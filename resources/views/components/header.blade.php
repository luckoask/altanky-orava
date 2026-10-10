@props(['business', 'navigation'])
<header class="site-header">
    <div class="container header-inner">
        <x-brand :business="$business" data-header-part />
        <nav class="desktop-navigation" aria-label="Hlavná navigácia" data-header-part>
            @foreach ($navigation as $item)
                <a href="{{ $item['href'] }}">{{ $item['label'] }}</a>
            @endforeach
        </nav>
        <div class="header-actions" data-header-part>
            <a class="header-contact" href="#kontakt">Podklady <x-icon /></a>
            <details class="mobile-navigation" data-mobile-menu>
                <summary aria-label="Menu: otvoriť alebo zatvoriť navigáciu"><span>Menu</span><span class="menu-icons"><x-icon name="menu" class="menu-open-icon" /><x-icon name="close" class="menu-close-icon" /></span></summary>
                <div class="mobile-navigation-backdrop" aria-hidden="true"></div>
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
