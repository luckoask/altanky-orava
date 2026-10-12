<?php

namespace Tests\Feature;

use App\Mail\InquiryReceived;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Tests\TestCase;

class InquiryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['portfolio.inquiry.to' => 'dopyty@example.test']);
    }

    /**
     * @return array<string, mixed>
     */
    private function inquiry(array $overrides = []): array
    {
        return [
            'name' => 'Jana Testovacia',
            'phone' => '+421 900 123 456',
            'email' => 'jana@example.test',
            'type' => 'pergola',
            'size' => '4 × 3 m',
            'place' => 'Tvrdošín',
            'message' => "Pergola k terase.\nPodklad je dlažba.",
            'consent' => '1',
            'elapsed' => '15000',
            ...$overrides,
        ];
    }

    private function photo(string $name = 'zahrada.webp'): UploadedFile
    {
        return new UploadedFile(public_path('images/garden-640.webp'), $name, 'image/webp', null, true);
    }

    public function test_form_appears_only_with_a_recipient_and_links_the_privacy_policy(): void
    {
        $this->get('/')->assertOk()
            ->assertSee('action="'.route('inquiry.store').'#dopyt"', false)
            ->assertSee('enctype="multipart/form-data"', false)
            ->assertSee('name="consent"', false)
            ->assertSee('href="'.route('privacy').'"', false)
            ->assertSee('data-surface="light"', false);

        config(['portfolio.inquiry.to' => null]);
        $this->get('/')->assertOk()->assertDontSee('<form', false);
    }

    public function test_a_valid_inquiry_is_mailed_with_photos_and_sets_no_cookies(): void
    {
        Mail::fake();

        $response = $this->post('/dopyt', $this->inquiry(['photos' => [$this->photo(), $this->photo('druha.webp')]]), ['Accept' => 'application/json', 'Origin' => url('/')])
            ->assertOk()
            ->assertJson(['message' => config('portfolio.inquiry.sent_description')]);

        $this->assertSame([], $response->headers->getCookies());
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        Mail::assertSent(InquiryReceived::class, function (InquiryReceived $mail) {
            $mail->assertSeeInHtml('Jana Testovacia')
                ->assertSeeInHtml('href="tel:+421900123456"', false)
                ->assertSeeInHtml('Tvrdošín')
                ->assertSeeInText('Typ stavby: Pergola')
                ->assertSeeInText("Pergola k terase.\nPodklad je dlažba.");

            return $mail->hasTo('dopyty@example.test')
                && $mail->hasReplyTo('jana@example.test', 'Jana Testovacia')
                && $mail->hasSubject('Dopyt z webu: Pergola · Jana Testovacia · Tvrdošín')
                && count($mail->attachments()) === 2
                && $mail->attachments()[0]->as === 'fotka-1.webp';
        });
    }

    public function test_without_javascript_a_sent_inquiry_redirects_to_the_thank_you_page(): void
    {
        Mail::fake();

        $this->post('/dopyt', $this->inquiry(['email' => null, 'elapsed' => null]))
            ->assertStatus(303)
            ->assertRedirect(route('inquiry.sent'));
        Mail::assertSent(InquiryReceived::class, fn (InquiryReceived $mail) => $mail->envelope()->replyTo === []);

        $this->get('/dopyt-odoslany')->assertOk()
            ->assertSee('name="robots" content="noindex, follow"', false)
            ->assertSeeText(config('portfolio.inquiry.sent_heading'));
        $this->get('/dopyt')->assertRedirect(url('/').'#kontakt');
    }

    public function test_missing_name_contact_and_consent_are_reported_per_field(): void
    {
        Mail::fake();

        $this->postJson('/dopyt', $this->inquiry(['name' => '', 'phone' => '', 'email' => '', 'consent' => null]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.name.0', 'Napíšte, prosím, svoje meno.')
            ->assertJsonPath('errors.contact.0', 'Vyplňte telefón alebo e-mail, aby sme vám mohli odpovedať.')
            ->assertJsonPath('errors.consent.0', 'Bez súhlasu nemôžeme dopyt spracovať.');

        $this->postJson('/dopyt', $this->inquiry(['phone' => 'zavolajte', 'email' => 'nie je e-mail', 'type' => 'hrad']))
            ->assertUnprocessable()
            ->assertJsonPath('errors.phone.0', 'Skontrolujte telefónne číslo.')
            ->assertJsonPath('errors.email.0', 'Skontrolujte e-mailovú adresu.')
            ->assertJsonPath('errors.type.0', 'Vyberte typ stavby z ponuky.');

        Mail::assertNothingSent();
    }

    public function test_photos_must_be_images_within_the_limits(): void
    {
        Mail::fake();

        $this->postJson('/dopyt', $this->inquiry(['photos' => [UploadedFile::fake()->create('zmluva.pdf', 20, 'application/pdf')]]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.photos.0', 'Fotka musí byť vo formáte JPG, PNG, WebP alebo HEIC.');

        $this->postJson('/dopyt', $this->inquiry(['photos' => array_map(fn ($index) => $this->photo("fotka-{$index}.webp"), range(1, 7))]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.photos.0', 'Pridajte najviac 6 fotiek.');

        $this->postJson('/dopyt', $this->inquiry(['photos' => [UploadedFile::fake()->image('obrovska.jpg')->size(11000)]]))
            ->assertUnprocessable()
            ->assertJsonPath('errors.photos.0', 'Jedna fotka môže mať najviac 10 MB.');

        Mail::assertNothingSent();
    }

    public function test_without_javascript_errors_render_the_form_again_with_escaped_values(): void
    {
        Mail::fake();
        $unsafe = '"><script>alert(1)</script>';

        $response = $this->post('/dopyt', $this->inquiry(['name' => $unsafe, 'phone' => '', 'email' => '', 'photos' => [$this->photo()]]))
            ->assertUnprocessable()
            ->assertSeeText('Skontrolujte zvýraznené polia. Fotky, ak ste ich pridali, vyberte znova.')
            ->assertSeeText('Vyplňte telefón alebo e-mail, aby sme vám mohli odpovedať.')
            ->assertSee('value="'.e($unsafe).'"', false)
            ->assertSee('value="pergola" checked', false)
            ->assertDontSee($unsafe, false);

        $this->assertSame([], $response->headers->getCookies());
        Mail::assertNothingSent();
    }

    public function test_bots_get_the_usual_answer_but_nothing_is_sent(): void
    {
        Mail::fake();

        $this->postJson('/dopyt', $this->inquiry(['website' => 'https://spam.example']))->assertOk();
        $this->postJson('/dopyt', $this->inquiry(['elapsed' => '900']))->assertOk();

        Mail::assertNothingSent();
    }

    public function test_foreign_origins_are_refused_and_repeated_attempts_are_limited(): void
    {
        Mail::fake();

        $this->post('/dopyt', $this->inquiry(), ['Origin' => 'https://cudzi.example'])->assertForbidden();
        Mail::assertNothingSent();

        foreach (range(1, 10) as $attempt) {
            $this->postJson('/dopyt', $this->inquiry(['name' => '']))->assertUnprocessable();
        }
        $this->postJson('/dopyt', $this->inquiry())
            ->assertTooManyRequests()
            ->assertJsonPath('errors.form.0', 'Z tohto pripojenia prišlo veľa pokusov. Skúste to znova o hodinu.');
        Mail::assertNothingSent();
    }

    public function test_a_mail_failure_keeps_the_form_and_asks_to_try_again(): void
    {
        Mail::extend('failing', fn () => new class extends AbstractTransport
        {
            protected function doSend(SentMessage $message): void
            {
                throw new TransportException('Server pošty neodpovedá.');
            }

            public function __toString(): string
            {
                return 'failing://';
            }
        });
        config(['mail.mailers.failing' => ['transport' => 'failing'], 'mail.default' => 'failing']);

        $this->postJson('/dopyt', $this->inquiry())
            ->assertServiceUnavailable()
            ->assertJsonPath('message', 'Dopyt sa nepodarilo odoslať. Skúste to o chvíľu znova.');
    }

    public function test_production_never_shows_a_form_that_would_only_write_to_the_log(): void
    {
        $this->assertNull($this->recipientWith(['APP_ENV' => 'production', 'MAIL_MAILER' => 'log', 'INQUIRY_TO' => 'dopyty@example.test']));
        $this->assertSame('dopyty@example.test', $this->recipientWith(['APP_ENV' => 'production', 'MAIL_MAILER' => 'smtp', 'INQUIRY_TO' => 'dopyty@example.test']));
        $this->assertSame('dopyty@example.test', $this->recipientWith(['APP_ENV' => 'local', 'MAIL_MAILER' => 'log', 'INQUIRY_TO' => 'dopyty@example.test']));
    }

    /**
     * Loads the configuration file with temporary environment values and restores them afterwards.
     *
     * @param  array<string, string>  $environment
     */
    private function recipientWith(array $environment): ?string
    {
        $saved = [];
        foreach ($environment as $key => $value) {
            $saved[$key] = [$_ENV[$key] ?? null, $_SERVER[$key] ?? null, getenv($key)];
            $_ENV[$key] = $_SERVER[$key] = $value;
            putenv("{$key}={$value}");
        }

        try {
            return (require config_path('portfolio.php'))['inquiry']['to'];
        } finally {
            foreach ($saved as $key => [$env, $server, $process]) {
                if ($env === null) {
                    unset($_ENV[$key]);
                } else {
                    $_ENV[$key] = $env;
                }
                if ($server === null) {
                    unset($_SERVER[$key]);
                } else {
                    $_SERVER[$key] = $server;
                }
                putenv($process === false ? $key : "{$key}={$process}");
            }
        }
    }
}
