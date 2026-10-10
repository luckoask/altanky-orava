#!/usr/bin/env bash
# Nasadenie domorava.sk na tomto serveri: ./deploy.sh
#
# Na serveri beží viac webov, preto skript mení iba tento projekt:
# nereštartuje ani nereloaduje nginx či PHP-FPM, OPcache čistí len pre svoje súbory.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_URL="https://domorava.sk"
FPM_SOCKET="/run/php/php8.5-fpm.sock"
WEB_USER="www-data"

# Systémový Composer z apt hlási na PHP 8.5 deprecation notices z vlastného kódu;
# deploy beží ako root, plugins projektu sa majú spustiť.
export COMPOSER_ALLOW_SUPERUSER=1
composer() { php -d error_reporting='E_ALL & ~E_DEPRECATED' "$(type -P composer)" "$@"; }

cd "$APP_DIR"

step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }

# Pred pull: lokálne zmeny sledovaných súborov by pull zablokovali alebo by sa stratili.
if ! git diff --quiet || ! git diff --cached --quiet; then
    git status --short
    fail "Pracovný strom má necommitnuté zmeny, deploy zastavený."
fi

step "git pull"
git pull --ff-only

step "Composer (produkčné závislosti)"
composer install --no-dev --optimize-autoloader --no-interaction --no-progress

step "npm ci + Vite build"
npm ci --no-audit --no-fund
npm run build

step "Laravel cache"
php artisan optimize:clear
php artisan optimize

step "Práva pre ${WEB_USER}"
chown -R "${WEB_USER}:${WEB_USER}" storage bootstrap/cache

step "OPcache (iba súbory tohto projektu)"
SCRIPT_FILENAME="$APP_DIR/scripts/opcache-invalidate.php" \
REQUEST_METHOD=GET \
    cgi-fcgi -bind -connect "$FPM_SOCKET" | sed '1,/^\r\?$/d'

step "Kontrola ${APP_URL}"
# Priamo na lokálny nginx, bez Cloudflare.
host="${APP_URL#https://}"
for path in / /up; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --resolve "${host}:443:127.0.0.1" "${APP_URL}${path}")
    [[ "$code" == 200 ]] || fail "${APP_URL}${path} vrátilo HTTP ${code}"
    echo "${path} -> ${code}"
done

git_rev=$(git rev-parse --short HEAD)
step "Hotovo (${git_rev})"
