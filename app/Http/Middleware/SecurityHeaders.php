<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Browser hardening for every response, including error pages.
 *
 * The policy allows only this origin, plus Cloudflare Web Analytics so it can be switched on without a code change.
 * Inline style attributes stay allowed for the per-word and per-card custom properties; JSON data blocks are not scripts.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $headers = $response->headers;

        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('X-Frame-Options', 'SAMEORIGIN');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
        $headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if ($request->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        // The Vite dev server serves scripts and a websocket from another port.
        if (! Vite::isRunningHot()) {
            $headers->set('Content-Security-Policy', implode('; ', [
                "default-src 'self'",
                "script-src 'self' https://static.cloudflareinsights.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data:",
                "font-src 'self'",
                "connect-src 'self' https://cloudflareinsights.com",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
            ]));
        }

        return $response;
    }
}
