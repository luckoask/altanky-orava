@props(['image', 'alt', 'sizes' => '100vw', 'priority' => false, 'variants' => null, 'width' => null, 'height' => null])
@php
    $metadata = config('portfolio.media.'.$image, []);
    $variants ??= $metadata['variants'] ?? [640, 1000, 1600];
    $width ??= $metadata['width'] ?? 1600;
    $height ??= $metadata['height'] ?? 1067;
@endphp
<img
    {{ $attributes }}
    src="{{ asset('images/'.$image.'-'.max($variants).'.webp') }}"
    srcset="{{ collect($variants)->map(fn ($size) => asset('images/'.$image.'-'.$size.'.webp').' '.$size.'w')->implode(', ') }}"
    sizes="{{ $sizes }}"
    width="{{ $width }}"
    height="{{ $height }}"
    alt="{{ $alt }}"
    loading="{{ $priority ? 'eager' : 'lazy' }}"
    fetchpriority="{{ $priority ? 'high' : 'auto' }}"
    decoding="async"
>
