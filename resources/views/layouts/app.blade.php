<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#263e33">
    <meta name="description" content="{{ $content['seo']['description'] }}">
    <meta name="robots" content="{{ $content['seo']['indexable'] ? 'index, follow' : 'noindex, nofollow' }}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="sk_SK">
    <meta property="og:title" content="{{ $content['seo']['title'] }}">
    <meta property="og:description" content="{{ $content['seo']['description'] }}">
    <meta property="og:image" content="{{ asset('images/'.$content['hero']['image'].'-1600.webp') }}">
    <meta property="og:image:alt" content="{{ $content['hero']['alt'] }}">
    @if ($content['seo']['indexable'])
        <link rel="canonical" href="{{ url('/') }}">
    @endif
    <title>{{ $content['seo']['title'] }}</title>
    <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
    <link rel="preload" href="{{ Vite::asset('resources/fonts/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2') }}" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="{{ Vite::asset('resources/fonts/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2') }}" as="font" type="font/woff2" crossorigin>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <a class="skip-link" href="#obsah">Prejsť na obsah</a>
    <x-header :business="$content['business']" :navigation="$content['navigation']" />
    <main id="obsah" tabindex="-1">
        @yield('content')
    </main>
    <x-footer :business="$content['business']" :navigation="$content['navigation']" />
    @stack('dialogs')
</body>
</html>
