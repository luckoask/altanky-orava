@php
    // Error pages render without route data; other pages may override the title, robots and section link base.
    $content ??= config('portfolio');
    $title ??= $content['seo']['title'];
    $description ??= $content['seo']['description'];
    $robots ??= $content['seo']['indexable'] ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
    $canonical ??= $content['seo']['indexable'] ? url('/') : null;
    $anchorBase ??= '';
@endphp
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#263e33">
    <meta name="description" content="{{ $description }}">
    <meta name="robots" content="{{ $robots }}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="sk_SK">
    <meta property="og:site_name" content="{{ $content['business']['name'] ?: $content['business']['descriptor'] }}">
    <meta property="og:url" content="{{ $canonical ?: url()->current() }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:image" content="{{ asset($content['seo']['image']['path']) }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="{{ $content['seo']['image']['width'] }}">
    <meta property="og:image:height" content="{{ $content['seo']['image']['height'] }}">
    <meta property="og:image:alt" content="{{ $content['seo']['image']['alt'] }}">
    <meta name="twitter:card" content="summary_large_image">
    @if ($canonical)
        <link rel="canonical" href="{{ $canonical }}">
    @endif
    <title>{{ $title }}</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="sitemap" type="application/xml" href="{{ url('/sitemap.xml') }}">
    @stack('head')
    <link rel="preload" href="{{ Vite::asset('resources/fonts/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{ Vite::asset('resources/fonts/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2') }}" as="font" type="font/woff2" crossorigin>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    {{-- Covers the first paint until app.js decides whether the 3D intro plays (CSS shows it only with JavaScript). --}}
    <div class="curtain" aria-hidden="true"></div>
    <a class="skip-link" href="#obsah">Prejsť na obsah</a>
    <x-header :business="$content['business']" :navigation="$content['navigation']" :base="$anchorBase" />
    <main id="obsah" tabindex="-1">
        @yield('content')
    </main>
    <x-footer :business="$content['business']" :navigation="$content['navigation']" :base="$anchorBase" />
    @stack('dialogs')
</body>
</html>
