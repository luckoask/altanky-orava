import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

let errors;
test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
});
test.afterEach(() => expect(errors).toEqual([]));

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    test(`complete layout and local media at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await page.evaluate(() => document.fonts.ready);

        for (const section of await page.locator('main > section').all()) {
            await section.scrollIntoViewIfNeeded();
            await section.locator('img').evaluateAll(async (images) => {
                await Promise.all(images.map((image) => image.decode()));
            });
        }

        const layout = await page.evaluate(() => {
            const viewport = document.documentElement.clientWidth;
            const headings = [...document.querySelectorAll('main h1, main h2, main h3')];
            return {
                overflow: document.documentElement.scrollWidth - viewport,
                outsideHeadings: headings.filter((heading) => {
                    const bounds = heading.getBoundingClientRect();
                    return bounds.left < -1 || bounds.right > viewport + 1 || heading.scrollWidth > heading.clientWidth + 1;
                }).map((heading) => heading.textContent),
                missingMedia: [...document.querySelectorAll('main img')].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.src),
            };
        });
        expect(layout.overflow).toBeLessThanOrEqual(1);
        expect(layout.outsideHeadings).toEqual([]);
        expect(layout.missingMedia).toEqual([]);
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: testInfo.outputPath(`viewport-${width}.png`) });
        await page.screenshot({ path: testInfo.outputPath(`full-${width}.png`), fullPage: true });
    });
}

for (const width of [390, 1440]) {
    test(`photo parallax follows native scrolling without exposing edges at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto('/');
        const frames = page.locator('[data-parallax]');
        await expect(frames.first().locator('[data-parallax-layer]')).toHaveCSS('transform', /matrix/);
        await page.evaluate(() => document.fonts.ready);

        async function photoState(frame) {
            let previousY = NaN;
            await expect.poll(async () => {
                const y = await frame.locator('[data-parallax-layer]').evaluate((layer) => new DOMMatrixReadOnly(getComputedStyle(layer).transform).m42);
                const settled = Number.isFinite(previousY) && Math.abs(y - previousY) < 0.1;
                previousY = y;
                return settled;
            }, { intervals: [100, 200, 300] }).toBe(true);
            return frame.evaluate((element) => {
                const bounds = element.getBoundingClientRect();
                const layer = element.querySelector('[data-parallax-layer]');
                const image = layer.querySelector('img').getBoundingClientRect();
                return {
                    y: new DOMMatrixReadOnly(getComputedStyle(layer).transform).m42,
                    height: bounds.height,
                    gap: Math.max(image.top - bounds.top, bounds.bottom - image.bottom, image.left - bounds.left, bounds.right - image.right),
                };
            });
        }

        for (const frame of await frames.all()) {
            const range = await frame.evaluate((element) => {
                const bounds = element.getBoundingClientRect();
                const top = bounds.top + scrollY;
                return {
                    start: Math.max(0, top - innerHeight),
                    end: Math.min(top + bounds.height, document.documentElement.scrollHeight - innerHeight),
                };
            });
            await page.evaluate((range) => window.scrollTo({ top: range.start + (range.end - range.start) * 0.25, behavior: 'instant' }), range);
            await frame.locator('img').evaluate((image) => image.decode());
            const before = await photoState(frame);
            await page.evaluate((range) => window.scrollTo({ top: range.start + (range.end - range.start) * 0.75, behavior: 'instant' }), range);
            const after = await photoState(frame);
            expect(after.y - before.y).toBeGreaterThan(1);
            expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
            expect(before.gap).toBeLessThanOrEqual(1);
            expect(after.gap).toBeLessThanOrEqual(1);
        }

        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
        await page.locator('.gallery-image-link').first().scrollIntoViewIfNeeded();
        await photoState(page.locator('.gallery-image-link').first());
        await page.screenshot({ path: testInfo.outputPath(`parallax-${width}.png`) });
    });
}

test('desktop hero morphs, follows native scroll and reverts cleanly on mobile and reduced motion', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const stage = page.locator('[data-hero-scene]');
    const photo = page.locator('[data-hero-media]');
    const actions = page.locator('.hero-actions');
    await expect(stage).toHaveClass(/is-cinematic/);
    const initial = await photo.evaluate((element) => getComputedStyle(element).clipPath);
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
    await expect.poll(() => photo.evaluate((element) => parseFloat(getComputedStyle(element).clipPath.match(/inset\(([^%]+)/)[1]))).toBeLessThan(0.1);
    expect(await photo.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe(initial);
    await expect.poll(() => page.locator('[data-hero-caption]').evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.9);
    expect(await actions.evaluate((element) => element.inert)).toBe(true);
    const pin = await stage.boundingBox();
    const header = await page.locator('.site-header').boundingBox();
    expect(Math.abs(pin.y - header.height)).toBeLessThanOrEqual(2);
    await page.screenshot({ path: testInfo.outputPath('hero-expanded.png') });

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(stage).not.toHaveClass(/is-cinematic/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    expect(await actions.evaluate((element) => element.inert)).toBe(false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.locator('[data-motion-word], [data-parallax-layer]').evaluateAll((elements) => elements.every((element) => getComputedStyle(element).transform === 'none'))).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.locator('.hero-copy').evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

for (const width of [390, 1440]) {
    test(`hero caption types smoothly in two stable lines at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: width < 1024 ? 650 : 1000 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto('/');
        const caption = page.locator('[data-hero-caption]');
        const lines = caption.locator('[data-typewriter-line]');
        const letters = caption.locator('[data-typewriter-char]');
        await expect(letters).toHaveCount(18);
        await expect(caption.locator('.sr-only')).toHaveText('Zostaňte do večera.');
        await expect.poll(() => letters.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === '0'))).toBe(true);
        const dimensions = await lines.evaluateAll((elements) => elements.map((element) => ({ width: element.clientWidth, height: element.clientHeight })));
        await page.evaluate(() => {
            window.__typingFrames = new Promise((resolve) => {
                const samples = [];
                const start = performance.now();
                const frame = (time) => {
                    samples.push([...document.querySelectorAll('[data-typewriter-char]')].map((element) => Number(getComputedStyle(element).opacity)));
                    if (time - start < 2400) requestAnimationFrame(frame);
                    else resolve(samples);
                };
                requestAnimationFrame(frame);
            });
        });
        if (width >= 1024) await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
        else await caption.evaluate((element) => window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - 250, behavior: 'instant' }));
        const samples = await page.evaluate(() => window.__typingFrames);
        expect(samples.some((sample) => sample[0] > 0 && sample[0] < 1 && sample[1] < 1 && sample.at(-1) === 0)).toBe(true);
        expect(samples.some((sample) => sample[7] === 1 && sample[8] === 0)).toBe(true);
        await expect.poll(() => letters.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === '1' && getComputedStyle(element).transform === 'none' && getComputedStyle(element).filter === 'none'))).toBe(true);
        expect(await lines.evaluateAll((elements) => elements.map((element) => ({ width: element.clientWidth, height: element.clientHeight })))).toEqual(dimensions);
        await writeFile(testInfo.outputPath('typewriter-motion.json'), JSON.stringify(samples));
        await page.screenshot({ path: testInfo.outputPath(`typewriter-${width}.png`) });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect(letters).toHaveCount(0);
        await expect(lines).toHaveText(['Zostaňte', 'do večera.']);
        await expect(caption).toHaveCSS('opacity', '1');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await expect(letters).toHaveCount(18);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect(letters).toHaveCount(0);
        await expect(lines).toHaveText(['Zostaňte', 'do večera.']);
    });
}

test('gallery masks morph as photographs enter the viewport and stay accessible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const mask = page.locator('.gallery-card [data-photo-morph]').first();
    await expect(mask).toHaveCSS('clip-path', /inset/);
    const initial = await mask.evaluate((element) => getComputedStyle(element).clipPath);
    await page.locator('.gallery-image-link').first().evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
    await expect.poll(() => mask.evaluate((element) => getComputedStyle(element).clipPath)).not.toBe(initial);
    const opener = page.locator('[data-gallery-open]').first();
    await opener.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
});

test('desktop wheel input has a measurable smooth coast and still drives the morph', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page.evaluate(() => document.fonts.ready);
    const initialClip = await page.locator('[data-hero-media]').evaluate((element) => getComputedStyle(element).clipPath);
    await page.mouse.move(1100, 550);
    await page.evaluate(() => {
        window.__wheelComplete = new Promise((resolve) => {
            const samples = [];
            const start = performance.now();
            const frame = (time) => {
                samples.push({ time: time - start, y: scrollY });
                if (time - start < 2400) requestAnimationFrame(frame);
                else resolve(samples);
            };
            requestAnimationFrame(frame);
        });
    });
    await page.mouse.wheel(0, 600);
    const samples = await page.evaluate(() => window.__wheelComplete);
    const moving = samples.filter((sample) => sample.y > 0);
    expect(moving.length).toBeGreaterThan(12);
    expect(moving[0].y).toBeLessThan(400);
    expect(samples.filter((sample, index) => index && sample.y - samples[index - 1].y > 0).length).toBeGreaterThan(12);
    expect(Math.max(...samples.map((sample) => sample.y))).toBeLessThanOrEqual(632);
    expect(Math.abs(await page.evaluate(() => scrollY) - 630)).toBeLessThanOrEqual(2);
    expect(await page.locator('[data-hero-media]').evaluate((element) => getComputedStyle(element).clipPath)).not.toBe(initialClip);
    await writeFile(testInfo.outputPath('wheel-motion.json'), JSON.stringify(samples));
});

test('desktop section links retain history and focus while keyboard scroll cancels inertia', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page.getByRole('navigation', { name: 'Hlavná navigácia' }).getByRole('link', { name: 'Inšpirácia' }).click();
    await expect(page).toHaveURL(/#inspiracia$/);
    await expect(page.locator('#inspiracia')).toBeFocused();
    const destination = await page.locator('#inspiracia').boundingBox();
    expect(destination.y).toBeGreaterThanOrEqual(85);
    expect(destination.y).toBeLessThanOrEqual(120);
    await page.goBack();
    await expect(page).toHaveURL('http://127.0.0.1:8000/');
    await page.keyboard.press('End');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeLessThanOrEqual(2);
    await page.mouse.move(800, 500);
    await page.mouse.wheel(0, -600);
    await expect(page.locator('html')).toHaveClass(/lenis-smooth/);
    await page.keyboard.press('Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(2);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => scrollY)).toBeLessThanOrEqual(2);
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#obsah')).toBeFocused();
});

test('gallery dialog scrolls natively while page inertia is paused and resumes after closing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 480 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    const opener = page.locator('[data-gallery-open]').first();
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/lenis-stopped/);
    const before = await page.evaluate(() => scrollY);
    const bounds = await dialog.boundingBox();
    await page.mouse.move(bounds.x + 200, bounds.y + 140);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(/lenis-stopped/);
    await expect(opener).toBeFocused();
    await page.mouse.move(800, 300);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
});

test('desktop smoothing is removed on mobile or reduced motion and can restart', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page.mouse.move(1000, 500);
    await page.mouse.wheel(0, 600);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
    await page.waitForTimeout(500);
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.locator('html')).toHaveClass(/\blenis\b/);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => /\/lenis-[^/]+\.js$/.test(entry.name)))).toBe(false);
});

test('a delayed scroll module cannot reactivate after reduced motion is selected', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    let release;
    const held = new Promise((resolve) => { release = resolve; });
    await page.route(/\/lenis-[^/]+\.js$/, async (route) => { await held; await route.continue(); });
    const requested = page.waitForRequest(/\/lenis-[^/]+\.js$/);
    try {
        await page.goto('/');
        await requested;
        await expect(page.locator('[data-hero-scene]')).toHaveClass(/is-cinematic/);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        release();
        await page.waitForLoadState('networkidle');
        await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
        await expect(page.locator('.pin-spacer')).toHaveCount(0);
    } finally {
        release();
    }
});

test('mobile navigation closes, navigates and returns focus with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const menu = page.locator('[data-mobile-menu]');
    const toggle = menu.locator('summary');
    await toggle.click();
    await expect(menu).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.getByRole('navigation', { name: 'Mobilná navigácia' }).getByRole('link', { name: 'Inšpirácia' }).click();
    await expect(page).toHaveURL(/#inspiracia$/);
    await expect(menu).not.toHaveAttribute('open');
    await expect(page.locator('#inspiracia')).toBeFocused();
});

test('gallery filters, keyboard navigation, focus containment and single-photo controls', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Pergoly', exact: true }).click();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(2);
    await expect(page.locator('[data-gallery-count]')).toHaveText('2 fotografie');
    const opener = page.locator('.gallery-card:visible [data-gallery-open]').first();
    const firstTitle = await page.locator('.gallery-card:visible h3').first().innerText();
    await opener.click();
    const dialog = page.getByRole('dialog');
    const close = page.getByRole('button', { name: 'Zatvoriť fotografiu' });
    await expect(dialog).toBeVisible();
    await expect(page.locator('#lightbox-title')).toHaveText(firstTitle);
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('dialog')))).toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-lightbox-counter]')).toHaveText('2 / 2');
    await expect(page.locator('#lightbox-title')).not.toHaveText(firstTitle);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();

    await page.getByRole('button', { name: 'Altánky', exact: true }).click();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(1);
    await page.locator('.gallery-card:visible [data-gallery-open]').click();
    await expect(page.getByRole('button', { name: 'Predchádzajúca fotografia' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Nasledujúca fotografia' })).toBeDisabled();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toBeVisible();
    await page.getByRole('button', { name: 'Všetko', exact: true }).click();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(4);
});

test('FAQ works with keyboard and maintains one expanded answer', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.faq-item');
    await items.first().locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(items.first()).toHaveAttribute('open', '');
    await expect(items.first().locator('.faq-answer')).toBeVisible();
    await items.nth(1).locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(items.first()).not.toHaveAttribute('open');
    await expect(items.nth(1)).toHaveAttribute('open', '');
});

for (const width of [390, 1440]) {
    test(`FAQ opening and closing have intermediate heights and fade at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 1000 });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto('/');
        await page.evaluate(() => document.fonts.ready);
        const item = page.locator('.faq-item').first();
        const summary = item.locator('summary');
        await expect(item).toHaveAttribute('data-faq-animated', '');
        await summary.scrollIntoViewIfNeeded();
        const collapsed = await item.evaluate((element) => element.getBoundingClientRect().height);
        async function record() {
            await page.evaluate(() => {
                window.__faqFrames = new Promise((resolve) => {
                    const samples = [];
                    const start = performance.now();
                    const frame = (time) => {
                        const element = document.querySelector('.faq-item');
                        samples.push({ height: element.getBoundingClientRect().height, opacity: Number(getComputedStyle(element.querySelector('.faq-answer')).opacity), animating: element.hasAttribute('data-faq-animating') });
                        if (time - start < 700) requestAnimationFrame(frame);
                        else resolve(samples);
                    };
                    requestAnimationFrame(frame);
                });
            });
        }
        await record();
        await summary.click();
        const opening = await page.evaluate(() => window.__faqFrames);
        await expect(item).toHaveAttribute('open', '');
        await expect(item).not.toHaveAttribute('data-faq-animating', '');
        const expanded = await item.evaluate((element) => element.getBoundingClientRect().height);
        expect(expanded).toBeGreaterThan(collapsed + 10);
        expect(opening.filter((sample) => sample.height > collapsed + 1 && sample.height < expanded - 1 && sample.opacity > 0 && sample.opacity < 1).length).toBeGreaterThan(2);
        expect(await item.locator('.faq-answer').evaluate((element) => element.getAnimations().length)).toBe(0);
        await page.screenshot({ path: testInfo.outputPath(`faq-open-${width}.png`) });
        await record();
        await summary.click();
        const closing = await page.evaluate(() => window.__faqFrames);
        expect(closing.filter((sample) => sample.height > collapsed + 1 && sample.height < expanded - 1 && sample.opacity > 0 && sample.opacity < 1).length).toBeGreaterThan(2);
        await expect(item).not.toHaveAttribute('open');
        await expect(item).not.toHaveAttribute('data-faq-animating', '');
        expect(await item.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(collapsed, 1);
        expect(await item.evaluate((element) => element.style.height)).toBe('');
        await writeFile(testInfo.outputPath('faq-motion.json'), JSON.stringify({ opening, closing }));
    });
}

test('FAQ reverses repeated clicks and settles when resized or reduced motion changes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const items = page.locator('.faq-item');
    const first = items.first().locator('summary');
    const second = items.nth(1).locator('summary');
    await first.click();
    await page.waitForTimeout(80);
    await first.click();
    await page.waitForTimeout(50);
    await first.click();
    await second.click();
    await expect(items.first()).not.toHaveAttribute('open');
    await expect(items.nth(1)).toHaveAttribute('open', '');
    await expect(page.locator('.faq-item[data-faq-animating]')).toHaveCount(0);
    await expect(page.locator('.faq-item[open]')).toHaveCount(1);
    await second.click();
    await page.waitForTimeout(80);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(items.nth(1)).not.toHaveAttribute('open');
    await expect(page.locator('.faq-item[data-faq-animating]')).toHaveCount(0);
    await second.click();
    await page.waitForTimeout(80);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(items.nth(1)).toHaveAttribute('open', '');
    await expect(page.locator('.faq-item[data-faq-animating]')).toHaveCount(0);
    expect(await items.nth(1).evaluate((element) => element.getAnimations().length)).toBe(0);
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(items.first()).toHaveAttribute('open', '');
    await expect(items.nth(1)).not.toHaveAttribute('open');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await first.click();
    await expect(items.first()).not.toHaveAttribute('open');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('FAQ remains a native exclusive disclosure when animation support is unavailable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => { Element.prototype.animate = undefined; });
    await page.goto('/');
    const items = page.locator('.faq-item');
    await expect(items.first()).toHaveAttribute('name', 'faq');
    await expect(items.first()).not.toHaveAttribute('data-faq-animated');
    await items.first().locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(items.first().locator('.faq-answer')).toBeVisible();
    await items.nth(1).locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(items.first()).not.toHaveAttribute('open');
    await expect(items.nth(1)).toHaveAttribute('open', '');
});

test('project brief downloads a real UTF-8 text file', async ({ page }) => {
    await page.goto('/');
    const received = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Stiahnuť podklady' }).click();
    const download = await received;
    expect(download.suggestedFilename()).toBe('podklady-pre-drevenu-stavbu.txt');
    expect(await download.failure()).toBeNull();
    expect(await readFile(await download.path(), 'utf8')).toContain('PODKLADY PRE DREVENÚ STAVBU');
});

test('reduced motion skips GSAP and disables smooth scrolling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
    expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('ScrollTrigger-')))).toBe(false);
    expect(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => /\/lenis-[^/]+\.js$/.test(entry.name)))).toBe(false);
    await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
    expect(await page.locator('[data-parallax-layer]').evaluateAll((layers) => layers.every((layer) => getComputedStyle(layer).transform === 'none'))).toBe(true);
    await expect(page.locator('.hero-copy')).toBeVisible();
    await expect(page.locator('[data-typewriter-char]')).toHaveCount(0);
    await expect(page.locator('[data-hero-caption] .sr-only')).toHaveText('Zostaňte do večera.');
});

test('switching to reduced motion clears GSAP transforms and opacity', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const motionLoaded = page.waitForResponse((response) => response.url().includes('ScrollTrigger-'));
    await page.goto('/');
    await motionLoaded;
    await page.waitForLoadState('networkidle');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.evaluate(() => [...document.querySelectorAll('[data-reveal], .hero-copy, [data-parallax-layer]')].every((element) => getComputedStyle(element).opacity === '1' && getComputedStyle(element).transform === 'none'))).toBe(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('[data-parallax-layer]').first()).toHaveCSS('transform', /matrix/);
});

test('content, native controls and photo links work without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8000/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-gallery-filters]')).not.toBeVisible();
    await expect(page.locator('[data-typewriter-line]')).toHaveText(['Zostaňte', 'do večera.']);
    await expect(page.locator('[data-typewriter-char]')).toHaveCount(0);
    const menu = page.locator('[data-mobile-menu]');
    await menu.locator('summary').click();
    await expect(menu).toHaveAttribute('open', '');
    await menu.locator('summary').click();
    await page.locator('.faq-item').first().locator('summary').click();
    await expect(page.locator('.faq-answer').first()).toBeVisible();
    await page.locator('[data-gallery-open]').first().click();
    await expect(page).toHaveURL(/\/images\/[^/]+\.webp$/);
    await context.close();
});
