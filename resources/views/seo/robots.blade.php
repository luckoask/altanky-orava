User-agent: *
Disallow:
@if ($content['seo']['indexable'])

Sitemap: {{ url('/sitemap.xml') }}
@endif
