<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('pages.home', ['content' => config('portfolio')]);
})->name('home');

// Search engine files are rendered so they always point at the domain the site is served from.
Route::get('/sitemap.xml', function () {
    return response()->view('seo.sitemap', ['content' => config('portfolio')])->header('Content-Type', 'application/xml; charset=utf-8');
})->name('sitemap');

Route::get('/robots.txt', function () {
    return response()->view('seo.robots', ['content' => config('portfolio')])->header('Content-Type', 'text/plain; charset=utf-8');
})->name('robots');
