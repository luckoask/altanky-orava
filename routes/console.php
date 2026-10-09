<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('portfolio:export {--url= : Verejná URL vrátane podadresára} {--output= : Adresár s pripraveným build/manifest.json}', function () {
    $url = rtrim((string) $this->option('url'), '/');
    $parts = parse_url($url);
    $output = realpath((string) $this->option('output'));
    $source = public_path();

    if (! $parts || ! in_array($parts['scheme'] ?? '', ['http', 'https'], true) || empty($parts['host']) || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])) {
        $this->error('Zadajte platnú verejnú URL bez prihlasovacích údajov, query alebo fragmentu.');

        return 1;
    }

    if (! $output || $output === realpath($source) || ! is_file($output.'/build/manifest.json')) {
        $this->error('Výstup musí byť samostatný existujúci adresár s pripraveným Vite build/manifest.json.');

        return 1;
    }

    foreach (['images', 'fonts', 'downloads'] as $directory) {
        File::copyDirectory($source.'/'.$directory, $output.'/'.$directory);
    }
    File::copy($source.'/favicon.svg', $output.'/favicon.svg');

    // Only this CLI process changes its public path; the local app keeps its build.
    app()->usePublicPath($output);
    URL::useOrigin($url);
    URL::useAssetOrigin($url);
    URL::forceScheme($parts['scheme']);
    Vite::useHotFile($output.'/hot');

    File::put($output.'/index.html', view('pages.home', ['content' => config('portfolio')])->render());
    File::put($output.'/.htaccess', "DirectoryIndex index.html\nOptions -Indexes\n");

    $this->info('Export pripravený: '.$output);
    $this->line('Verejná URL: '.$url.'/');

    return 0;
})->purpose('Exportovať Blade frontend a lokálne assety na statický FTP hosting');
