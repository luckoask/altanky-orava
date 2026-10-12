@props(['business', 'href' => '#'])
@php
    $name = $business['name'] ?: $business['descriptor'];
    // A domain-style name shows its ending as a quieter accent, e.g. DomOrava + .sk.
    [$label, $domain] = preg_match('/^(.+?)(\.[a-z]{2,})$/i', $name, $parts) ? [$parts[1], $parts[2]] : [$name, ''];
    // The drawn wordmark has the same outlines as the 3D intro, which lands on it.
    // Any other business name falls back to live text.
    $drawn = $name === 'DomOrava.sk';
@endphp
<a {{ $attributes->merge(['class' => 'brand']) }} href="{{ $href }}">
    <span class="brand-in">
        <x-brand-mark />
        <span class="brand-name">
            @if ($drawn)
                <x-brand-wordmark /><span class="sr-only">{{ $name }}</span>
            @else
                {{ $label }}@if ($domain)<span class="brand-domain">{{ $domain }}</span>@endif
            @endif
            <span class="brand-tagline">Altánky, pergoly, prístrešky</span>
        </span>
    </span>
    <span class="sr-only">, úvod stránky</span>
</a>
