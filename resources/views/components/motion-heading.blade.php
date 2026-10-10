@props(['lines', 'tag' => 'h2', 'eyebrow' => null])
@php($tag = in_array($tag, ['h1', 'h2'], true) ? $tag : 'h2')
@php($wordIndex = 0)
<{{ $tag }} {{ $attributes->class(['motion-heading']) }}>
    {{-- An eyebrow inside the heading carries the plain keywords next to the editorial lines. --}}
    @if ($eyebrow)<span class="section-label motion-eyebrow">{{ $eyebrow }}</span>@endif
    @foreach ($lines as $line)
        <span class="motion-line @if (! $loop->first) motion-line--accent @endif">
            @foreach (explode(' ', $line) as $word)
                <span class="word-mask"><span data-motion-word style="--i: {{ $wordIndex++ }}">{{ $word }}</span></span>@unless ($loop->last){{ ' ' }}@endunless
            @endforeach
        </span>
    @endforeach
</{{ $tag }}>
