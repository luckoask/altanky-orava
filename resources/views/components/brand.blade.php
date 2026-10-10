@props(['business'])
@php
    $name = $business['name'] ?: $business['descriptor'];
    // A domain-style name shows its ending as a quieter accent, e.g. DomOrava + .sk.
    [$label, $domain] = preg_match('/^(.+?)(\.[a-z]{2,})$/i', $name, $parts) ? [$parts[1], $parts[2]] : [$name, ''];
@endphp
<a {{ $attributes->merge(['class' => 'brand']) }} href="#">
    <svg class="brand-mark" viewBox="0 0 42 42" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
        <path d="M4 19 21 5l17 14M8 19v18h26V19M15 37V24h12v13M4 19h34" />
        <path d="M12 15v22M30 15v22M21 6v13" opacity=".45" />
    </svg>
    <span class="brand-name">
        {{ $label }}@if ($domain)<span class="brand-domain">{{ $domain }}</span>@endif
        <span class="brand-tagline">Altánky, pergoly, prístrešky</span>
    </span>
    <span class="sr-only">, úvod stránky</span>
</a>
