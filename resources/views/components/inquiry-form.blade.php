@props(['settings', 'state' => []])
@php
    // Without JavaScript the server renders this form again with its errors and the typed values.
    $fieldErrors = $state['errors'] ?? [];
    $old = $state['old'] ?? [];
    $errorFor = fn (string $field) => $fieldErrors[$field][0] ?? null;
    $invalid = fn (string ...$fields) => collect($fields)->contains(fn ($field) => isset($fieldErrors[$field])) ? 'true' : null;
    $alert = $fieldErrors['form'][0] ?? ($fieldErrors ? 'Skontrolujte zvýraznené polia.' : null);
    if ($alert && ($state['photos_lost'] ?? false)) {
        $alert .= ' Fotky, ak ste ich pridali, vyberte znova.';
    }
@endphp
<div class="inquiry" id="dopyt" tabindex="-1" data-surface="light">
    <div class="inquiry-head">
        <h3>{{ $settings['heading'] }}</h3>
        <p>{{ $settings['description'] }}</p>
    </div>
    <form class="inquiry-form" action="{{ route('inquiry.store') }}#dopyt" method="post" enctype="multipart/form-data" data-inquiry-form data-max-photos="{{ $settings['max_photos'] }}" data-max-photo-kb="{{ $settings['max_photo_kb'] }}">
        <p class="inquiry-alert" role="alert" data-inquiry-alert @unless ($alert) hidden @endunless>{{ $alert }}</p>

        <div class="field">
            <label class="field-label" for="inquiry-name">Meno</label>
            <input id="inquiry-name" name="name" type="text" autocomplete="name" maxlength="120" required value="{{ $old['name'] ?? '' }}" aria-describedby="inquiry-name-error" @if ($invalid('name')) aria-invalid="true" @endif>
            <p class="field-error" id="inquiry-name-error" data-error-for="name" @unless ($errorFor('name')) hidden @endunless>{{ $errorFor('name') }}</p>
        </div>

        <div class="field-row">
            <div class="field">
                <label class="field-label" for="inquiry-phone">Telefón</label>
                <input id="inquiry-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="40" value="{{ $old['phone'] ?? '' }}" aria-describedby="inquiry-contact-hint inquiry-phone-error inquiry-contact-error" @if ($invalid('phone', 'contact')) aria-invalid="true" @endif>
                <p class="field-error" id="inquiry-phone-error" data-error-for="phone" @unless ($errorFor('phone')) hidden @endunless>{{ $errorFor('phone') }}</p>
            </div>
            <div class="field">
                <label class="field-label" for="inquiry-email">E-mail</label>
                <input id="inquiry-email" name="email" type="email" autocomplete="email" maxlength="160" value="{{ $old['email'] ?? '' }}" aria-describedby="inquiry-contact-hint inquiry-email-error inquiry-contact-error" @if ($invalid('email', 'contact')) aria-invalid="true" @endif>
                <p class="field-error" id="inquiry-email-error" data-error-for="email" @unless ($errorFor('email')) hidden @endunless>{{ $errorFor('email') }}</p>
            </div>
            <p class="field-hint" id="inquiry-contact-hint">Stačí jedno z nich.</p>
            <p class="field-error" id="inquiry-contact-error" data-error-for="contact" @unless ($errorFor('contact')) hidden @endunless>{{ $errorFor('contact') }}</p>
        </div>

        <fieldset class="field" aria-describedby="inquiry-type-error">
            <legend class="field-label">Čo chcete postaviť</legend>
            <div class="choice-group">
                @foreach ($settings['types'] as $value => $label)
                    <label class="choice"><input type="radio" name="type" value="{{ $value }}" @checked(($old['type'] ?? null) === $value)><span>{{ $label }}</span></label>
                @endforeach
            </div>
            <p class="field-error" id="inquiry-type-error" data-error-for="type" @unless ($errorFor('type')) hidden @endunless>{{ $errorFor('type') }}</p>
        </fieldset>

        <div class="field-row">
            <div class="field">
                <label class="field-label" for="inquiry-size">Približné rozmery</label>
                <input id="inquiry-size" name="size" type="text" maxlength="120" placeholder="napríklad 4 × 3 m" value="{{ $old['size'] ?? '' }}" aria-describedby="inquiry-size-error" @if ($invalid('size')) aria-invalid="true" @endif>
                <p class="field-error" id="inquiry-size-error" data-error-for="size" @unless ($errorFor('size')) hidden @endunless>{{ $errorFor('size') }}</p>
            </div>
            <div class="field">
                <label class="field-label" for="inquiry-place">Obec</label>
                <input id="inquiry-place" name="place" type="text" autocomplete="address-level2" maxlength="120" value="{{ $old['place'] ?? '' }}" aria-describedby="inquiry-place-error" @if ($invalid('place')) aria-invalid="true" @endif>
                <p class="field-error" id="inquiry-place-error" data-error-for="place" @unless ($errorFor('place')) hidden @endunless>{{ $errorFor('place') }}</p>
            </div>
        </div>

        <div class="field">
            <label class="field-label" for="inquiry-message">Správa</label>
            <textarea id="inquiry-message" name="message" data-lenis-prevent rows="4" maxlength="3000" placeholder="Na čo bude stavba slúžiť, aký je podklad, termín alebo rozpočet." aria-describedby="inquiry-message-error" @if ($invalid('message')) aria-invalid="true" @endif>{{ $old['message'] ?? '' }}</textarea>
            <p class="field-error" id="inquiry-message-error" data-error-for="message" @unless ($errorFor('message')) hidden @endunless>{{ $errorFor('message') }}</p>
        </div>

        <div class="field">
            <span class="field-label" id="inquiry-photos-label">Fotky miesta</span>
            <label class="photo-drop" data-photo-drop>
                <input type="file" name="photos[]" accept="image/*" multiple data-photo-input aria-labelledby="inquiry-photos-label inquiry-photos-action" aria-describedby="inquiry-photos-hint inquiry-photos-error">
                <x-icon name="camera" />
                <span id="inquiry-photos-action"><strong>Pridať fotky</strong><span class="photo-drop-drag"> alebo ich sem pretiahnite</span></span>
            </label>
            <p class="field-hint" id="inquiry-photos-hint">Najviac {{ $settings['max_photos'] }} fotiek, ideálne z viacerých strán.</p>
            <ul class="photo-list" data-photo-list aria-label="Pridané fotky" hidden></ul>
            <p class="field-error" id="inquiry-photos-error" data-error-for="photos" @unless ($errorFor('photos')) hidden @endunless>{{ $errorFor('photos') }}</p>
        </div>

        <div class="field">
            <label class="consent">
                <input type="checkbox" name="consent" value="1" required @checked($old['consent'] ?? false) aria-describedby="inquiry-consent-error" @if ($invalid('consent')) aria-invalid="true" @endif>
                <span>{{ $settings['consent'] }} Viac v <a href="{{ route('privacy') }}">zásadách ochrany osobných údajov</a>.</span>
            </label>
            <p class="field-error" id="inquiry-consent-error" data-error-for="consent" @unless ($errorFor('consent')) hidden @endunless>{{ $errorFor('consent') }}</p>
        </div>

        {{-- Left empty by people; bots that fill every field reveal themselves. --}}
        <div class="inquiry-trap" aria-hidden="true">
            <label>Webová stránka <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>
        <input type="hidden" name="elapsed" value="">

        <div class="inquiry-submit">
            <button type="submit" class="button button--primary" data-inquiry-submit><span data-submit-label>Odoslať dopyt</span><x-icon name="arrow-right" /></button>
            <p class="inquiry-status" role="status" data-inquiry-status></p>
        </div>
    </form>
    <div class="inquiry-done" data-inquiry-done tabindex="-1" hidden>
        <span class="inquiry-done-mark" aria-hidden="true"><x-icon name="check" /></span>
        <h3>{{ $settings['sent_heading'] }}</h3>
        <p>{{ $settings['sent_description'] }}</p>
    </div>
</div>
