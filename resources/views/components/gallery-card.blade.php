@props(['project', 'index'])
<article class="gallery-card" data-category="{{ $project['category'] }}" data-reveal>
    <a class="gallery-image-link" href="{{ asset('images/'.$project['image'].'-1600.webp') }}" data-gallery-open data-gallery-index="{{ $index }}" data-parallax="0.05" aria-label="{{ $project['is_reference'] ? 'Realizácia' : 'Inšpirácia' }}: {{ $project['title'] }}. Zobraziť fotografiu">
        <div class="photo-mask" data-photo-morph>
            <div class="parallax-layer" data-parallax-layer>
                <x-image :image="$project['image']" :alt="$project['alt']" sizes="(min-width: 1440px) 680px, (min-width: 768px) 46vw, 90vw" />
            </div>
        </div>
        <span class="image-badge">{{ $project['is_reference'] ? 'Realizácia' : 'Inšpirácia' }}</span>
        <span class="gallery-expand" aria-hidden="true"><x-icon /></span>
    </a>
    <div class="gallery-card-caption">
        <div><p class="gallery-category">{{ $project['label'] }}</p><h3>{{ $project['title'] }}</h3></div>
        <span class="gallery-card-number" aria-hidden="true">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span>
    </div>
</article>
