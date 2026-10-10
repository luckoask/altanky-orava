<?php

// Spúšťa ho deploy.sh priamo cez FastCGI socket PHP-FPM (nie cez nginx).
// FPM má opcache.validate_timestamps=0 a OPcache je zdieľaná so všetkými
// webmi na serveri, preto sa zneplatnia iba skripty z tohto projektu
// namiesto opcache_reset() alebo reloadu PHP-FPM.

if (PHP_SAPI !== 'fpm-fcgi') {
    http_response_code(403);
    exit("Iba pre PHP-FPM.\n");
}

$root = dirname(__DIR__).DIRECTORY_SEPARATOR;
$status = function_exists('opcache_get_status') ? opcache_get_status(true) : false;

if ($status === false) {
    exit("OPcache nie je aktívna, nie je čo zneplatniť.\n");
}

$count = 0;

foreach (array_keys($status['scripts'] ?? []) as $file) {
    if (str_starts_with($file, $root) && opcache_invalidate($file, true)) {
        $count++;
    }
}

echo "OPcache: zneplatnených {$count} skriptov.\n";
