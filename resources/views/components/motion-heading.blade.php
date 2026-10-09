@props(['lines', 'tag' => 'h2'])
@php($tag = in_array($tag, ['h1', 'h2'], true) ? $tag : 'h2')
<{{ $tag }} {{ $attributes->class(['motion-heading']) }}>
    @foreach ($lines as $line)
        <span class="motion-line @if (! $loop->first) motion-line--accent @endif">
            @foreach (explode(' ', $line) as $word)
                <span class="word-mask"><span data-motion-word>{{ $word }}</span></span>@unless ($loop->last){{ ' ' }}@endunless
            @endforeach
        </span>
    @endforeach
</{{ $tag }}>
