@props(['business', 'navigation', 'base' => ''])
@php
    $name = $business['name'] ?: $business['descriptor'];
    // Statutory identification appears as soon as it is filled in.
    $identity = implode(' · ', array_filter([$business['legal_name'], $business['ico'] ? 'IČO '.$business['ico'] : null]));
@endphp
<footer class="site-footer">
    {{-- Decorative name behind the footer; letters are separate so they can rise one after another. --}}
    <div class="footer-watermark" aria-hidden="true" data-footer-watermark>
        @foreach (mb_str_split($name) as $letter)<span data-watermark-letter>{{ $letter }}</span>@endforeach
    </div>
    <div class="container footer-main">
        <div><x-brand :business="$business" :href="$base ?: '#'" /></div>
        <nav class="footer-nav" aria-label="Navigácia v päte">
            @foreach ([...$navigation, ['label' => 'Kontakt', 'href' => '#kontakt']] as $item)<a class="footer-pill" href="{{ $base }}{{ $item['href'] }}"><span>{{ $item['label'] }}</span><x-icon name="arrow-right" /></a>@endforeach
        </nav>
        <a class="back-to-top" href="#obsah"><span class="back-to-top-label">Späť na začiatok</span><span class="back-to-top-circle" aria-hidden="true"><x-icon name="arrow-up" /></span></a>
    </div>
    <div class="container footer-bottom">
        <p>© {{ date('Y') }} {{ $name }}@if ($identity) · {{ $identity }}@endif</p>
        <nav class="footer-legal" aria-label="Právne informácie">
            <a href="{{ route('privacy') }}">Ochrana osobných údajov</a>
            <a href="{{ route('terms') }}">Obchodné podmienky</a>
            <a href="{{ $base }}#fotografie">O fotografiách <x-icon name="arrow-up-right" /></a>
        </nav>
    </div>
</footer>
