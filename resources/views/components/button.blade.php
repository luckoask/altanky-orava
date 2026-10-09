@props(['href', 'variant' => 'primary', 'icon' => 'arrow-up-right'])
<a href="{{ $href }}" {{ $attributes->class(['button', 'button--'.$variant]) }}>
    <span>{{ $slot }}</span>
    <x-icon :name="$icon" />
</a>
