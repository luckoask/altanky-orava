@php
    // Every distinct photograph on the page, so image search can find them through the single page entry.
    $images = collect([$content['hero']['image'], $content['craft']['image'], $content['contact']['image']])
        ->merge(collect($content['gallery']['items'])->pluck('image'))
        ->unique()
        ->map(fn ($image) => asset('images/'.$image.'-'.max(config('portfolio.media.'.$image.'.variants')).'.webp'));
    $modified = max(filemtime(config_path('portfolio.php')), filemtime(resource_path('views/pages/home.blade.php')));
@endphp
{!! '<'.'?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>{{ url('/') }}</loc>
        <lastmod>{{ date('Y-m-d', $modified) }}</lastmod>
@foreach ($images as $image)
        <image:image><image:loc>{{ $image }}</image:loc></image:image>
@endforeach
    </url>
</urlset>
