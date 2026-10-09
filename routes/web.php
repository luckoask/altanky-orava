<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('pages.home', ['content' => config('portfolio')]);
})->name('home');
