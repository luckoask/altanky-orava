@props(['business', 'navigation'])
@php($name = $business['name'] ?: $business['descriptor'])
<footer class="site-footer">
    {{-- Decorative name behind the footer; letters are separate so they can rise one after another. --}}
    <div class="footer-watermark" aria-hidden="true" data-footer-watermark>
        @foreach (mb_str_split($name) as $letter)<span data-watermark-letter>{{ $letter }}</span>@endforeach
    </div>
    <div class="container footer-main">
        <div><x-brand :business="$business" /></div>
        <nav class="footer-nav" aria-label="Navigácia v päte">
            @foreach ([...$navigation, ['label' => 'Kontakt', 'href' => '#kontakt']] as $item)<a class="footer-pill" href="{{ $item['href'] }}"><span>{{ $item['label'] }}</span><x-icon name="arrow-right" /></a>@endforeach
        </nav>
        <a class="back-to-top" href="#obsah"><span class="back-to-top-label">Späť na začiatok</span><span class="back-to-top-circle" aria-hidden="true"><x-icon name="arrow-up" /></span></a>
    </div>
    <div class="container footer-bottom">
        <p>© {{ date('Y') }} {{ $name }}</p>
        <a href="#fotografie">O fotografiách <x-icon name="arrow-up-right" /></a>
    </div>
</footer>
