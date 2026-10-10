@php
    // One schema.org graph for the page: the site, the business behind it and the page with its visible questions.
    $business = $content['business'];
    $name = $business['name'] ?: $business['descriptor'];
    $home = url('/');
    $image = ['@type' => 'ImageObject', 'url' => asset($content['seo']['image']['path']), 'width' => $content['seo']['image']['width'], 'height' => $content['seo']['image']['height']];
    // A street address is required for local business results; until then the business is a plain organization.
    $organization = array_filter([
        '@type' => $business['address'] ? 'HomeAndConstructionBusiness' : 'Organization',
        '@id' => $home.'#firma',
        'name' => $name,
        'url' => $home,
        'logo' => asset($content['seo']['logo']),
        'image' => $image,
        'description' => $content['seo']['description'],
        'email' => $business['email'],
        'telephone' => $business['phone'],
        'address' => $business['address'] ? ['@type' => 'PostalAddress', 'streetAddress' => $business['address'], 'addressCountry' => 'SK'] : null,
        'areaServed' => $business['area'],
        'knowsAbout' => ['Drevené altánky', 'Pergoly', 'Prístrešky', 'Drevené konštrukcie do záhrady'],
    ]);
    $graph = [
        ['@type' => 'WebSite', '@id' => $home.'#web', 'url' => $home, 'name' => $name, 'inLanguage' => 'sk', 'publisher' => ['@id' => $home.'#firma']],
        $organization,
        [
            '@type' => ['WebPage', 'FAQPage'],
            '@id' => $home.'#stranka',
            'url' => $home,
            'name' => $content['seo']['title'],
            'description' => $content['seo']['description'],
            'inLanguage' => 'sk',
            'isPartOf' => ['@id' => $home.'#web'],
            'about' => ['@id' => $home.'#firma'],
            'primaryImageOfPage' => $image,
            'mainEntity' => collect($content['faq'])->map(fn ($item) => [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']],
            ])->all(),
        ],
    ];
@endphp
<script type="application/ld+json">{!! json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_THROW_ON_ERROR) !!}</script>
