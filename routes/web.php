<?php

use App\Http\Controllers\InquiryController;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

// The site has no logins: without a session it sets no cookies and needs no cookie banner.
$stateless = [EncryptCookies::class, AddQueuedCookiesToResponse::class, StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class];

// A short public cache lets Cloudflare and browsers reuse the pages.
Route::withoutMiddleware($stateless)
    ->middleware('cache.headers:public;max_age=60;etag')
    ->group(function () {
        Route::get('/', function () {
            return view('pages.home', ['content' => config('portfolio')]);
        })->name('home');

        Route::get('/ochrana-osobnych-udajov', function () {
            return view('pages.privacy', ['content' => config('portfolio')]);
        })->name('privacy');

        Route::get('/obchodne-podmienky', function () {
            return view('pages.terms', ['content' => config('portfolio')]);
        })->name('terms');

        Route::get('/dopyt-odoslany', function () {
            return view('pages.inquiry-sent', ['content' => config('portfolio')]);
        })->name('inquiry.sent');

        Route::get('/dopyt', function () {
            return redirect(url('/').'#kontakt');
        });

        // Search engine files are rendered so they always point at the domain the site is served from.
        Route::get('/sitemap.xml', function () {
            return response()->view('seo.sitemap', ['content' => config('portfolio')])->header('Content-Type', 'application/xml; charset=utf-8');
        })->name('sitemap');

        Route::get('/robots.txt', function () {
            return response()->view('seo.robots', ['content' => config('portfolio')])->header('Content-Type', 'text/plain; charset=utf-8');
        })->name('robots');
    });

// The inquiry form protects itself without a session (see InquiryController).
Route::withoutMiddleware($stateless)->post('/dopyt', [InquiryController::class, 'store'])->name('inquiry.store');
