@props(['business', 'navigation'])
<footer class="site-footer">
    <div class="container footer-main">
        <div><x-brand :business="$business" /></div>
        <nav aria-label="Navigácia v päte">
            @foreach ($navigation as $item)<a href="{{ $item['href'] }}">{{ $item['label'] }}</a>@endforeach
            <a href="#kontakt">Kontakt</a>
        </nav>
        <a class="back-to-top" href="#obsah">Späť na začiatok <x-icon name="arrow-up-right" /></a>
    </div>
    <div class="container footer-bottom">
        <p>© {{ date('Y') }} {{ $business['name'] ?: $business['descriptor'] }}</p>
        <a href="#fotografie">O fotografiách <x-icon name="arrow-up-right" /></a>
    </div>
</footer>
