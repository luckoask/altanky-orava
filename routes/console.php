<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;

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
    foreach (['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'] as $file) {
        File::copy($source.'/'.$file, $output.'/'.$file);
    }

    // Static hosting cannot receive the inquiry form, so the export leaves it out.
    config(['portfolio.inquiry.to' => null]);

    // Only this CLI process changes its public path; the local app keeps its build.
    app()->usePublicPath($output);
    URL::useOrigin($url);
    URL::useAssetOrigin($url);
    URL::forceScheme($parts['scheme']);
    Vite::useHotFile($output.'/hot');

    File::put($output.'/index.html', view('pages.home', ['content' => config('portfolio')])->render());
    File::put($output.'/sitemap.xml', view('seo.sitemap', ['content' => config('portfolio')])->render());
    File::put($output.'/robots.txt', view('seo.robots', ['content' => config('portfolio')])->render());
    foreach (['ochrana-osobnych-udajov' => 'pages.privacy', 'obchodne-podmienky' => 'pages.terms'] as $path => $page) {
        File::ensureDirectoryExists($output.'/'.$path);
        File::put($output.'/'.$path.'/index.html', view($page, ['content' => config('portfolio')])->render());
    }
    File::put($output.'/404.html', view('errors.404')->render());
    File::put($output.'/.htaccess', "DirectoryIndex index.html\nOptions -Indexes\nErrorDocument 404 ".rtrim($parts['path'] ?? '', '/')."/404.html\n");

    $this->info('Export pripravený: '.$output);
    $this->line('Verejná URL: '.$url.'/');

    return 0;
})->purpose('Exportovať Blade frontend a lokálne assety na statický FTP hosting');

Artisan::command('portfolio:mail-test', function () {
    $to = config('portfolio.inquiry.to');
    $from = config('mail.from.address');

    if (! $to || ! $from) {
        $this->error('Doplňte INQUIRY_TO aj MAIL_FROM_ADDRESS. V produkcii musí byť nastavený skutočný MAIL_MAILER.');

        return 1;
    }

    try {
        Mail::raw('Skúšobná správa z webu. Ak ju čítate, dopyty z formulára budú chodiť sem.', function ($message) use ($to) {
            $message->to($to)->subject('Skúška odosielania dopytov');
        });
    } catch (Throwable $exception) {
        $this->error('Odoslanie zlyhalo: '.$exception->getMessage());

        return 1;
    }

    $this->info('Skúšobný e-mail odišiel na '.$to.' cez '.config('mail.default').'.');

    return 0;
})->purpose('Poslať skúšobný e-mail na adresu pre dopyty');
