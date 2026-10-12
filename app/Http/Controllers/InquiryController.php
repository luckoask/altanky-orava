<?php

namespace App\Http\Controllers;

use App\Mail\InquiryReceived;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Receives the inquiry form without a session, so the site still sets no cookies.
 *
 * CSRF tokens need a session; instead a foreign Origin is refused, a hidden field and a minimum fill time catch bots
 * and each IP address may try a limited number of times per hour. The enhanced form gets JSON. Without JavaScript the
 * page is rendered again with the errors and typed values, and a sent inquiry redirects to a thank-you page.
 */
class InquiryController extends Controller
{
    private const ATTEMPTS_PER_HOUR = 10;

    private const MIN_FILL_MS = 3000;

    public function store(Request $request): Response
    {
        $settings = config('portfolio.inquiry');

        $origin = $request->headers->get('Origin');
        if ($origin && parse_url($origin, PHP_URL_HOST) !== $request->getHost()) {
            abort(403);
        }

        if (! $settings['to']) {
            return $this->failed($request, ['form' => ['Formulár zatiaľ nie je spustený.']], 503);
        }

        // The cache keeps only a keyed hash of the address, for one hour.
        $key = 'inquiry:'.hash_hmac('sha256', (string) $request->ip(), (string) config('app.key'));
        if (RateLimiter::tooManyAttempts($key, self::ATTEMPTS_PER_HOUR)) {
            return $this->failed($request, ['form' => ['Z tohto pripojenia prišlo veľa pokusov. Skúste to znova o hodinu.']], 429);
        }
        RateLimiter::hit($key, 3600);

        // Bots fill the hidden field or post at once; they get the usual answer so they have nothing to adapt to.
        $elapsed = $request->input('elapsed');
        if (filled($request->input('website')) || (is_numeric($elapsed) && (int) $elapsed < self::MIN_FILL_MS)) {
            return $this->sent($request);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40', 'regex:#^\+?[0-9 ()/.]{6,}$#'],
            'email' => ['nullable', 'string', 'email', 'max:160'],
            'type' => ['nullable', Rule::in(array_keys($settings['types']))],
            'size' => ['nullable', 'string', 'max:120'],
            'place' => ['nullable', 'string', 'max:120'],
            'message' => ['nullable', 'string', 'max:3000'],
            'photos' => ['nullable', 'array', 'max:'.$settings['max_photos']],
            'photos.*' => ['file', 'mimes:jpg,jpeg,png,webp,heic,heif', 'max:'.$settings['max_photo_kb']],
            'consent' => ['accepted'],
        ], [
            'name.required' => 'Napíšte, prosím, svoje meno.',
            'phone.regex' => 'Skontrolujte telefónne číslo.',
            'email.email' => 'Skontrolujte e-mailovú adresu.',
            'type.in' => 'Vyberte typ stavby z ponuky.',
            'message.max' => 'Správa môže mať najviac 3000 znakov.',
            'photos.max' => 'Pridajte najviac '.$settings['max_photos'].' fotiek.',
            'photos.*.mimes' => 'Fotka musí byť vo formáte JPG, PNG, WebP alebo HEIC.',
            'photos.*.max' => 'Jedna fotka môže mať najviac '.intdiv($settings['max_photo_kb'], 1024).' MB.',
            'photos.*.uploaded' => 'Fotku sa nepodarilo nahrať. Skúste menšiu.',
            'consent.accepted' => 'Bez súhlasu nemôžeme dopyt spracovať.',
            '*.max' => 'Text je príliš dlhý.',
            '*.string' => 'Skontrolujte vyplnený text.',
            'photos.*.file' => 'Fotku sa nepodarilo nahrať. Skúste menšiu.',
            'photos.array' => 'Fotky sa nepodarilo nahrať.',
        ]);
        $validator->after(function ($validator) use ($request, $settings) {
            if (blank($request->input('phone')) && blank($request->input('email'))) {
                $validator->errors()->add('contact', 'Vyplňte telefón alebo e-mail, aby sme vám mohli odpovedať.');
            }
            $size = collect(Arr::wrap($request->file('photos')))->sum(fn ($photo) => $photo instanceof UploadedFile ? $photo->getSize() : 0);
            if ($size > $settings['max_total_kb'] * 1024) {
                $validator->errors()->add('photos', 'Fotky majú spolu viac ako '.intdiv($settings['max_total_kb'], 1024).' MB. Pošlite ich menej alebo menšie.');
            }
        });

        if ($validator->fails()) {
            return $this->failed($request, $validator->errors()->toArray(), 422);
        }

        $data = $validator->validated();
        // Single line fields lose line breaks, so nothing typed can reach the mail headers.
        $line = fn (?string $value) => Str::squish((string) $value) ?: null;
        $inquiry = [
            'name' => $line($data['name']),
            'phone' => $line($data['phone'] ?? null),
            'email' => $line($data['email'] ?? null),
            'type' => isset($data['type']) ? $settings['types'][$data['type']] : null,
            'size' => $line($data['size'] ?? null),
            'place' => $line($data['place'] ?? null),
            'message' => trim((string) ($data['message'] ?? '')) ?: null,
        ];

        try {
            // An empty file field (no photo chosen without JavaScript) arrives as null.
            $photos = array_values(array_filter($data['photos'] ?? [], fn ($photo) => $photo instanceof UploadedFile));
            Mail::to($settings['to'])->send(new InquiryReceived($inquiry, $photos));
        } catch (Throwable $exception) {
            report($exception);

            return $this->failed($request, ['form' => ['Dopyt sa nepodarilo odoslať. Skúste to o chvíľu znova.']], 503);
        }

        return $this->sent($request);
    }

    private function sent(Request $request): Response
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => config('portfolio.inquiry.sent_description')], 200, ['Cache-Control' => 'no-store']);
        }

        return redirect()->route('inquiry.sent', [], 303);
    }

    /**
     * @param  array<string, array<int, string>>  $errors
     */
    private function failed(Request $request, array $errors, int $status): Response
    {
        // One list per form field: messages for individual photos belong to the photo field.
        $fields = [];
        foreach ($errors as $key => $messages) {
            $field = Str::before($key, '.');
            $fields[$field] = array_values(array_unique([...$fields[$field] ?? [], ...$messages]));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => Arr::first(Arr::flatten($fields)), 'errors' => $fields], $status, ['Cache-Control' => 'no-store']);
        }

        return response()->view('pages.home', [
            'content' => config('portfolio'),
            'inquiry' => [
                'errors' => $fields,
                'old' => $request->only(['name', 'phone', 'email', 'type', 'size', 'place', 'message', 'consent']),
                'photos_lost' => filled($request->file('photos')),
            ],
        ], $status)->header('Cache-Control', 'no-store');
    }
}
