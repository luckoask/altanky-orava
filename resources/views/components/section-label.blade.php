@props(['number' => null])
<p {{ $attributes->merge(['class' => 'section-label']) }}>
    @if ($number)<span class="section-number" aria-hidden="true">{{ $number }}</span>@endif
    <span>{{ $slot }}</span>
</p>
