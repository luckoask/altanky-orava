@props(['business', 'navigation'])
<header class="site-header">
    <div class="container header-inner">
        <x-brand :business="$business" />
        <nav class="desktop-navigation" aria-label="Hlavná navigácia">
            @foreach ($navigation as $item)
                <a href="{{ $item['href'] }}">{{ $item['label'] }}</a>
            @endforeach
        </nav>
        <div class="header-actions">
            <a class="header-contact" href="#kontakt">Podklady <x-icon /></a>
            <details class="mobile-navigation" data-mobile-menu>
                <summary aria-label="Menu: otvoriť alebo zatvoriť navigáciu"><span>Menu</span><x-icon name="menu" class="menu-open-icon" /><x-icon name="close" class="menu-close-icon" /></summary>
                <nav class="mobile-navigation-panel" aria-label="Mobilná navigácia">
                    @foreach ($navigation as $item)
                        <a href="{{ $item['href'] }}">{{ $item['label'] }}<x-icon /></a>
                    @endforeach
                    <a href="#kontakt">Podklady <x-icon /></a>
                </nav>
            </details>
        </div>
    </div>
</header>
