<?php

namespace Tests\Feature;

use Tests\TestCase;

class PortfolioTest extends TestCase
{
    public function test_homepage_renders_slovak_metadata_and_all_sections(): void
    {
        config(['portfolio.seo.indexable' => false]);

        $this->get('/')
            ->assertOk()
            ->assertSee('<html lang="sk">', false)
            ->assertSee(config('portfolio.seo.title'))
            ->assertSee('name="robots" content="noindex, nofollow"', false)
            ->assertSee('id="moznosti"', false)
            ->assertSee('id="inspiracia"', false)
            ->assertSee('id="materialy"', false)
            ->assertSee('id="postup"', false)
            ->assertSee('id="kontakt"', false);
    }

    public function test_unknown_business_details_do_not_create_fake_contact_links(): void
    {
        config(['portfolio.business.name' => null, 'portfolio.business.email' => null, 'portfolio.business.phone' => null]);

        $this->get('/')
            ->assertOk()
            ->assertSeeText('Kontaktné údaje pripravujeme')
            ->assertSeeText(config('portfolio.services_intro.notice'))
            ->assertSeeText(config('portfolio.gallery.notice'))
            ->assertDontSee('href="mailto:', false)
            ->assertDontSee('href="tel:', false)
            ->assertDontSee('<form', false);
    }

    public function test_configured_contacts_render_working_email_and_telephone_links(): void
    {
        config([
            'portfolio.business.name' => 'Testovacia dielňa',
            'portfolio.business.email' => 'kontakt@example.test',
            'portfolio.business.phone' => '+421 900 111 222',
            'portfolio.business.address' => 'Adresa pre test',
        ]);

        $this->get('/')
            ->assertOk()
            ->assertSeeText('Testovacia dielňa')
            ->assertSee('href="mailto:kontakt@example.test"', false)
            ->assertSee('href="tel:+421900111222"', false)
            ->assertSeeText('Adresa pre test')
            ->assertSee('"@type":"HomeAndConstructionBusiness"', false)
            ->assertSee('"telephone":"+421 900 111 222"', false)
            ->assertDontSeeText('Kontaktné údaje pripravujeme');
    }

    public function test_configured_text_is_escaped_in_html_and_embedded_gallery_data(): void
    {
        $unsafe = '</script><script>alert("test")</script>';
        config(['portfolio.business.name' => $unsafe, 'portfolio.gallery.items.0.title' => $unsafe]);

        $response = $this->get('/')->assertOk()->assertDontSee($unsafe, false);
        $response->assertSee(e($unsafe), false);
        preg_match('/<script type="application\/json" id="gallery-data">(.*?)<\/script>/s', $response->getContent(), $matches);
        $this->assertArrayHasKey(1, $matches);
        $gallery = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame($unsafe, $gallery[0]['title']);
    }

    public function test_every_internal_anchor_and_download_has_a_target(): void
    {
        $html = $this->get('/')->assertOk()->getContent();
        preg_match_all('/href="#([^"]+)"/', $html, $anchors);
        foreach (array_unique($anchors[1]) as $anchor) {
            $this->assertStringContainsString('id="'.$anchor.'"', $html, 'Missing anchor: '.$anchor);
        }

        $download = public_path(config('portfolio.contact.download'));
        $this->assertFileExists($download);
        $this->assertStringContainsString('PODKLADY PRE DREVENÚ STAVBU', file_get_contents($download));
        $this->assertStringContainsString('download="podklady-pre-drevenu-stavbu.txt"', $html);
    }

    public function test_hero_is_eager_and_all_images_have_reserved_dimensions_and_alt_text(): void
    {
        $html = $this->get('/')->assertOk()->getContent();
        preg_match_all('/<img\b[^>]*>/s', $html, $images);
        $this->assertNotEmpty($images[0]);
        $this->assertStringContainsString('loading="eager"', $images[0][0]);
        $this->assertStringContainsString('fetchpriority="high"', $images[0][0]);
        foreach ($images[0] as $image) {
            $this->assertMatchesRegularExpression('/width="\d+"/', $image);
            $this->assertMatchesRegularExpression('/height="\d+"/', $image);
            $this->assertStringContainsString('alt=', $image);
        }
    }

    public function test_indexing_can_be_enabled_after_content_confirmation(): void
    {
        config(['portfolio.seo.indexable' => true]);

        $this->get('/')
            ->assertOk()
            ->assertSee('name="robots" content="index, follow, max-image-preview:large"', false)
            ->assertSee('rel="canonical"', false);
    }

    public function test_search_engines_receive_structured_data_sitemap_and_robots(): void
    {
        config(['portfolio.seo.indexable' => true]);

        $html = $this->get('/')
            ->assertOk()
            ->assertSee('content="index, follow, max-image-preview:large"', false)
            ->assertSee('property="og:image" content="'.asset('images/og-domorava.jpg').'"', false)
            ->assertSee('name="twitter:card" content="summary_large_image"', false)
            ->getContent();
        $this->assertMatchesRegularExpression('/<h1[^>]*>\s*<span class="section-label motion-eyebrow">Drevené altánky, pergoly a prístrešky<\/span>/u', $html);

        preg_match('/<script type="application\/ld\+json">(.*?)<\/script>/s', $html, $matches);
        $this->assertArrayHasKey(1, $matches);
        $graph = collect(json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR)['@graph'])->keyBy('@id');
        $this->assertSame('WebSite', $graph[url('/').'#web']['@type']);
        $this->assertSame('Organization', $graph[url('/').'#firma']['@type']);
        $this->assertSame('DomOrava.sk', $graph[url('/').'#firma']['name']);
        $this->assertSame(['WebPage', 'FAQPage'], $graph[url('/').'#stranka']['@type']);
        $this->assertCount(count(config('portfolio.faq')), $graph[url('/').'#stranka']['mainEntity']);

        $sitemap = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=utf-8')->getContent();
        $this->assertNotFalse(simplexml_load_string($sitemap));
        $this->assertStringContainsString('<loc>'.url('/').'</loc>', $sitemap);
        $this->assertStringContainsString('<image:loc>'.asset('images/evening-2200.webp').'</image:loc>', $sitemap);
        $this->get('/robots.txt')->assertOk()->assertSee('Sitemap: '.url('/sitemap.xml'), false);

        foreach (['images/og-domorava.jpg' => [1200, 630], 'images/logo-512.png' => [512, 512], 'apple-touch-icon.png' => [180, 180]] as $file => $size) {
            $this->assertSame($size, array_slice(getimagesize(public_path($file)), 0, 2));
        }
    }

    public function test_pages_set_no_cookies_and_send_cache_and_security_headers(): void
    {
        foreach (['/', '/ochrana-osobnych-udajov', '/obchodne-podmienky', '/sitemap.xml'] as $path) {
            $response = $this->get($path)->assertOk();
            $this->assertSame([], $response->headers->getCookies(), $path);
            $this->assertStringContainsString('public', $response->headers->get('Cache-Control'));
            $this->assertNotEmpty($response->headers->get('ETag'));
            $this->assertSame('SAMEORIGIN', $response->headers->get('X-Frame-Options'));
            $this->assertStringContainsString("default-src 'self'", $response->headers->get('Content-Security-Policy'));
        }
    }

    public function test_legal_pages_show_only_known_company_details_and_are_not_indexed(): void
    {
        $this->get('/ochrana-osobnych-udajov')
            ->assertOk()
            ->assertSee('name="robots" content="noindex, follow"', false)
            ->assertSeeText('Ochrana osobných údajov')
            ->assertSeeText('Úradu na ochranu osobných údajov')
            ->assertSeeText('doplníme pred začatím poskytovania služieb')
            ->assertDontSee('rel="canonical"', false);

        config([
            'portfolio.business.legal_name' => 'Testovacia firma s.r.o.',
            'portfolio.business.ico' => '12345678',
            'portfolio.business.address' => 'Hlavná 1, 026 01 Dolný Kubín',
        ]);
        $this->get('/obchodne-podmienky')
            ->assertOk()
            ->assertSeeText('Obchodné podmienky')
            ->assertSeeText('Testovacia firma s.r.o.')
            ->assertSeeText('12345678')
            ->assertSeeText('Slovenská obchodná inšpekcia')
            ->assertDontSeeText('doplníme pred začatím poskytovania služieb')
            ->assertSee('href="'.url('/').'#kontakt"', false);
        $this->get('/')->assertSeeText('Testovacia firma s.r.o. · IČO 12345678')
            ->assertSee('href="'.route('privacy').'"', false)
            ->assertSee('href="'.route('terms').'"', false);
    }

    public function test_unknown_addresses_use_the_branded_not_found_page(): void
    {
        $response = $this->get('/neexistuje')->assertNotFound()
            ->assertSee('name="robots" content="noindex, follow"', false)
            ->assertSeeText('Stránka sa nenašla')
            ->assertSee('href="'.url('/').'"', false);
        $this->assertSame([], $response->headers->getCookies());
        $this->assertSame('SAMEORIGIN', $response->headers->get('X-Frame-Options'));
    }

    public function test_all_configured_image_variants_are_valid_local_webp_files(): void
    {
        foreach (config('portfolio.media') as $name => $media) {
            foreach ($media['variants'] as $width) {
                $path = public_path('images/'.$name.'-'.$width.'.webp');
                $this->assertFileExists($path);
                $dimensions = getimagesize($path);
                $this->assertIsArray($dimensions);
                $this->assertSame($width, $dimensions[0]);
                $this->assertSame('image/webp', $dimensions['mime']);
                if ($width === $media['width']) {
                    $this->assertSame($media['height'], $dimensions[1]);
                }
            }
        }

        foreach (config('portfolio.gallery.items') as $item) {
            $this->assertArrayHasKey($item['image'], config('portfolio.media'));
            $this->assertArrayHasKey($item['category'], config('portfolio.gallery.filters'));
            $this->assertIsBool($item['is_reference']);
            $this->assertNotEmpty($item['credit']);
            $this->assertNotFalse(filter_var($item['source'], FILTER_VALIDATE_URL));
        }
    }
}
