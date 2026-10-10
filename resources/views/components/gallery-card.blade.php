@props(['project', 'index'])
{{-- Cards stick one below another; each next card slides over the previous one, which shrinks and dims. --}}
<article class="gallery-card" data-category="{{ $project['category'] }}" style="--card: {{ $index }}">
    <div class="gallery-card-frame" data-stack-frame>
        <a class="gallery-image-link" href="{{ asset('images/'.$project['image'].'-1600.webp') }}" data-gallery-open data-gallery-index="{{ $index }}" data-surface="{{ config('portfolio.media.'.$project['image'].'.surface', 'light') }}" aria-label="{{ $project['is_reference'] ? 'Realizácia' : 'Inšpirácia' }}: {{ $project['title'] }}. Zobraziť fotografiu">
            <div class="photo-mask">
                <div class="parallax-layer" data-parallax-layer>
                    <x-image :image="$project['image']" :alt="$project['alt']" sizes="(min-width: 1732px) 1560px, 92vw" />
                </div>
            </div>
            <span class="image-badge">{{ $project['is_reference'] ? 'Realizácia' : 'Inšpirácia' }}</span>
            <span class="gallery-expand" aria-hidden="true"><x-icon /></span>
        </a>
        <div class="gallery-card-caption">
            <span class="gallery-card-number" aria-hidden="true">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span>
            <div><p class="gallery-category">{{ $project['label'] }}</p><h3>{{ $project['title'] }}</h3></div>
        </div>
        <span class="gallery-card-shade" aria-hidden="true"></span>
    </div>
</article>
