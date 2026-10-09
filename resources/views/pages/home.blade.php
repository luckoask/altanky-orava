@extends('layouts.app')

@section('content')
    <section class="hero" aria-labelledby="hero-title">
        <div class="hero-stage" data-hero-scene>
            <div class="hero-copy">
                <x-section-label>{{ $content['hero']['eyebrow'] }}</x-section-label>
                <x-motion-heading tag="h1" :lines="$content['hero']['heading']" id="hero-title" />
                <p class="hero-description">{{ $content['hero']['description'] }}</p>
                <div class="hero-actions">
                    <x-button href="#inspiracia">Pozrieť fotografie</x-button>
                    <a class="hero-secondary" href="#moznosti">Možnosti <x-icon name="arrow-down" /></a>
                </div>
            </div>
            <figure class="hero-media" data-hero-media>
                <div class="parallax-layer" data-parallax-layer data-hero-image>
                    <x-image :image="$content['hero']['image']" :alt="$content['hero']['alt']" :priority="true" :variants="[640, 1000, 1600, 2200]" sizes="(min-width: 1024px) 100vw, 94vw" />
                </div>
                <div class="hero-shade" data-hero-shade aria-hidden="true"></div>
                <figcaption class="hero-scene-caption" data-hero-caption>
                    <span class="sr-only">{{ implode(' ', $content['hero']['scene_heading']) }}</span>
                    @foreach ($content['hero']['scene_heading'] as $line)<span data-typewriter-line aria-hidden="true">{{ $line }}</span>@endforeach
                </figcaption>
            </figure>
            <a class="hero-credit" href="{{ $content['hero']['source'] }}" target="_blank" rel="noopener noreferrer">{{ $content['hero']['is_reference'] ? 'Realizácia' : 'Inšpirácia' }} · Foto: {{ $content['hero']['credit'] }} <x-icon name="arrow-up-right" /><span class="sr-only">(otvorí sa v novom okne)</span></a>
            <div class="hero-scroll" aria-hidden="true"><span>Nižšie sú detaily</span><x-icon name="arrow-down" /></div>
            <div class="scene-progress" aria-hidden="true"><span data-scene-progress></span></div>
        </div>
    </section>

    <section class="introduction container section-space" aria-labelledby="intro-title">
        <div class="introduction-copy">
            <x-section-label number="01">{{ $content['introduction']['eyebrow'] }}</x-section-label>
            <x-motion-heading :lines="$content['introduction']['heading']" id="intro-title" />
            <p class="body-copy">{{ $content['introduction']['description'] }}</p>
        </div>
        <x-garden-plan />
    </section>

    <section class="services container section-space" id="moznosti" tabindex="-1" aria-labelledby="services-title">
        <div class="section-heading">
            <div><x-section-label number="02">{{ $content['services_intro']['eyebrow'] }}</x-section-label><x-motion-heading :lines="$content['services_intro']['heading']" id="services-title" /></div>
            <p class="section-description">{{ $content['services_intro']['description'] }}</p>
        </div>
        <div class="services-grid">@foreach ($content['services'] as $service)<x-service-card :service="$service" />@endforeach</div>
        @unless ($content['services_confirmed'])<p class="content-note">{{ $content['services_intro']['notice'] }}</p>@endunless
    </section>

    <section class="craft-section" id="materialy" tabindex="-1" aria-labelledby="craft-title">
        <figure class="craft-figure">
            <div class="craft-image-wrap" data-parallax="0.06">
                <div class="parallax-layer" data-parallax-layer>
                    <x-image :image="$content['craft']['image']" :alt="$content['craft']['alt']" sizes="(max-aspect-ratio: 3/2) 150vh, 100vw" />
                </div>
            </div>
            <figcaption><span class="craft-image-label">Kresba a suk.</span><a href="{{ $content['craft']['source'] }}" target="_blank" rel="noopener noreferrer">Ilustračná fotografia: {{ $content['craft']['credit'] }} <span class="sr-only">(otvorí sa v novom okne)</span></a></figcaption>
        </figure>
        <div class="craft-shade" aria-hidden="true"></div>
        <div class="container craft-grid">
            <div class="craft-copy">
                <x-section-label number="03">{{ $content['craft']['eyebrow'] }}</x-section-label>
                <x-motion-heading :lines="$content['craft']['heading']" id="craft-title" />
                <p>{{ $content['craft']['description'] }}</p>
                <div class="craft-principles">
                    @foreach ($content['craft']['principles'] as $principle)
                        <details class="craft-principle" name="craft">
                            <summary><span>{{ $principle['title'] }}</span><x-icon name="plus" /></summary>
                            <p>{{ $principle['text'] }}</p>
                        </details>
                    @endforeach
                </div>
            </div>
        </div>
    </section>

    <section class="gallery container section-space" id="inspiracia" tabindex="-1" aria-labelledby="gallery-title">
        <div class="section-heading">
            <div><x-section-label number="04">{{ $content['gallery']['eyebrow'] }}</x-section-label><x-motion-heading :lines="[$content['gallery']['title']]" id="gallery-title" /></div>
            <p class="section-description">{{ $content['gallery']['description'] }}</p>
        </div>
        <div class="gallery-toolbar">
            <div class="gallery-filters" role="group" aria-label="Filtrovať fotografie" data-gallery-filters hidden>
                @foreach ($content['gallery']['filters'] as $key => $label)<button type="button" class="gallery-filter" data-filter="{{ $key }}" aria-pressed="{{ $loop->first ? 'true' : 'false' }}" aria-controls="gallery-grid">{{ $label }}</button>@endforeach
            </div>
            <span class="gallery-count" data-gallery-count aria-live="polite" aria-atomic="true">{{ count($content['gallery']['items']) }} fotografie</span>
        </div>
        <div class="gallery-grid" id="gallery-grid">@foreach ($content['gallery']['items'] as $project)<x-gallery-card :project="$project" :index="$loop->index" />@endforeach</div>
        <details class="photo-information" id="fotografie">
            <summary><span>{{ $content['gallery']['notice'] }}</span><span class="photo-info-action">Autori a licencie <x-icon name="plus" /></span></summary>
            <ul>@foreach ($content['gallery']['items'] as $project)<li><a href="{{ $project['source'] }}" target="_blank" rel="noopener noreferrer">{{ $project['title'] }} ({{ $project['credit'] }}) <x-icon name="arrow-up-right" /><span class="sr-only">(otvorí sa v novom okne)</span></a></li>@endforeach<li><a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Licencia Unsplash <x-icon name="arrow-up-right" /><span class="sr-only">(otvorí sa v novom okne)</span></a></li></ul>
        </details>
    </section>

    <section class="process-section" id="postup" tabindex="-1" aria-labelledby="process-title">
        <div class="container">
            <div class="section-heading"><div><x-section-label number="05">{{ $content['process']['eyebrow'] }}</x-section-label><x-motion-heading :lines="$content['process']['heading']" id="process-title" /></div><p class="section-description">{{ $content['process']['description'] }}</p></div>
            <ol class="process-grid">@foreach ($content['process']['steps'] as $step)<li data-reveal><span class="process-number" aria-hidden="true">{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</span><h3>{{ $step['title'] }}</h3><p>{{ $step['text'] }}</p></li>@endforeach</ol>
        </div>
    </section>

    <section class="faq container section-space" aria-labelledby="faq-title">
        <div class="faq-heading"><x-section-label number="06">{{ $content['faq_intro']['eyebrow'] }}</x-section-label><x-motion-heading :lines="$content['faq_intro']['heading']" id="faq-title" /></div>
        <div class="faq-list">@foreach ($content['faq'] as $item)<x-faq-item :question="$item['question']" :answer="$item['answer']" :index="$loop->index" />@endforeach</div>
    </section>

    <section class="contact-section" id="kontakt" tabindex="-1" aria-labelledby="contact-title">
        <div class="container contact-grid">
            <div class="contact-copy"><x-section-label number="07">{{ $content['contact']['eyebrow'] }}</x-section-label><x-motion-heading :lines="$content['contact']['heading']" id="contact-title" /><p>{{ $content['contact']['description'] }}</p><x-button :href="asset($content['contact']['download'])" variant="light" icon="download" download="podklady-pre-drevenu-stavbu.txt">Stiahnuť podklady</x-button><span class="download-note">Textový súbor · bez registrácie</span></div>
            <div class="contact-aside">
                <p class="checklist-title">Na začiatok stačí</p>
                <ul class="contact-checklist">@foreach ($content['contact']['checklist'] as $item)<li><x-icon name="check" /><span>{{ $item }}</span></li>@endforeach</ul>
                <div class="contact-details">
                    @if ($content['business']['email'] || $content['business']['phone'])
                        @if ($content['business']['email'])<a href="mailto:{{ $content['business']['email'] }}"><x-icon name="mail" /><span>{{ $content['business']['email'] }}</span><x-icon name="arrow-up-right" /></a>@endif
                        @if ($content['business']['phone'])<a href="tel:{{ preg_replace('/[^+0-9]/', '', $content['business']['phone']) }}"><x-icon name="phone" /><span>{{ $content['business']['phone'] }}</span><x-icon name="arrow-up-right" /></a>@endif
                        @if ($content['business']['address'])<p>{{ $content['business']['address'] }}</p>@endif
                        @if ($content['business']['area'])<p>{{ $content['business']['area'] }}</p>@endif
                    @else
                        <p class="contact-pending-title">{{ $content['contact']['pending_title'] }}</p><p class="contact-pending-description">{{ $content['contact']['pending_description'] }}</p>
                    @endif
                </div>
            </div>
            <figure class="contact-figure">
                <div class="contact-image-wrap" data-parallax="0.08">
                    <div class="parallax-layer" data-parallax-layer>
                        <x-image :image="$content['contact']['image']" :alt="$content['contact']['alt']" sizes="(min-width: 1732px) 1560px, 92vw" />
                    </div>
                </div>
                <figcaption><span>Inšpirácia</span><a href="{{ $content['contact']['source'] }}" target="_blank" rel="noopener noreferrer">Foto: {{ $content['contact']['credit'] }} <x-icon name="arrow-up-right" /><span class="sr-only">(otvorí sa v novom okne)</span></a></figcaption>
            </figure>
        </div>
    </section>
@endsection

@push('dialogs')
    <dialog class="gallery-dialog" data-gallery-dialog aria-labelledby="lightbox-title" aria-describedby="lightbox-description">
        <div class="lightbox-topbar"><span data-lightbox-counter aria-live="polite"></span><button type="button" class="icon-button lightbox-close" data-lightbox-close aria-label="Zatvoriť fotografiu"><x-icon name="close" /></button></div>
        <div class="lightbox-image-stage"><button type="button" class="icon-button lightbox-previous" data-lightbox-previous aria-label="Predchádzajúca fotografia"><x-icon name="arrow-left" /></button><img data-lightbox-image src="{{ asset('images/'.$content['gallery']['items'][0]['image'].'-1600.webp') }}" alt="" width="1600" height="1067" loading="lazy"><button type="button" class="icon-button lightbox-next" data-lightbox-next aria-label="Nasledujúca fotografia"><x-icon name="arrow-right" /></button></div>
        <div class="lightbox-caption"><div><p class="gallery-category" data-lightbox-category></p><h2 id="lightbox-title"></h2><p id="lightbox-description"></p></div><a href="{{ $content['gallery']['items'][0]['source'] }}" data-lightbox-credit target="_blank" rel="noopener noreferrer"><span data-lightbox-author></span><x-icon name="arrow-up-right" /><span class="sr-only">Zdroj fotografie (otvorí sa v novom okne)</span></a></div>
    </dialog>
    <script type="application/json" id="gallery-data">{!! json_encode(collect($content['gallery']['items'])->map(fn ($item) => [...$item, 'src' => asset('images/'.$item['image'].'-1600.webp')])->values(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) !!}</script>
@endpush
