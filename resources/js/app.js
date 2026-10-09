function initializeNavigation() {
    const menu = document.querySelector('[data-mobile-menu]');
    if (!menu) return;

    const summary = menu.querySelector('summary');
    menu.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        menu.open = false;
        const target = document.getElementById(link.hash.slice(1));
        if (target) target.focus({ preventScroll: true });
    });

    document.addEventListener('pointerdown', (event) => {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.open) {
            menu.open = false;
            summary.focus();
            event.preventDefault();
        }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
        if (event.matches) menu.open = false;
    });
}

function initializeFAQ() {
    const items = [...document.querySelectorAll('.faq-item')];
    if (!items.length || typeof items[0].animate !== 'function') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh = () => document.dispatchEvent(new Event('portfolio:layout-change'));
    const states = items.map((item) => ({
        item, summary: item.querySelector('summary'), answer: item.querySelector('.faq-answer'),
        expanded: item.open, heightAnimation: null, answerAnimation: null,
    }));

    function finish(state) {
        const changed = state.item.open !== state.expanded;
        state.item.open = state.expanded;
        state.heightAnimation?.cancel();
        state.answerAnimation?.cancel();
        state.heightAnimation = state.answerAnimation = null;
        state.item.removeAttribute('data-faq-animating');
        if (!changed) refresh(); // Otherwise the native toggle refreshes the final layout.
    }

    function setExpanded(state, expanded) {
        const startHeight = state.item.getBoundingClientRect().height;
        const startOpacity = state.item.open ? getComputedStyle(state.answer).opacity : '0';
        const startTransform = state.item.open ? getComputedStyle(state.answer).transform : 'translateY(6px)';
        state.heightAnimation?.cancel();
        state.answerAnimation?.cancel();
        state.heightAnimation = state.answerAnimation = null;
        state.expanded = expanded;
        state.item.dataset.expanded = String(expanded);
        if (reduced.matches) {
            finish(state);
            return;
        }

        // Keep native content visible until closing finishes; measure the new natural height.
        state.item.open = true;
        const fullHeight = state.item.getBoundingClientRect().height;
        const endHeight = expanded ? fullHeight : fullHeight - state.answer.getBoundingClientRect().height;
        const timing = { duration: expanded ? 480 : 400, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' };
        state.item.dataset.faqAnimating = '';
        const animation = state.item.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], timing);
        state.heightAnimation = animation;
        state.answerAnimation = state.answer.animate([
            { opacity: startOpacity, transform: startTransform },
            { opacity: expanded ? 1 : 0, transform: expanded ? 'translateY(0px)' : 'translateY(-4px)' },
        ], timing);
        animation.onfinish = () => {
            if (state.heightAnimation === animation) finish(state);
        };
    }

    states.forEach((state) => {
        // Native named groups hide siblings immediately, so animate the same exclusive behavior.
        state.item.removeAttribute('name');
        state.item.dataset.faqAnimated = '';
        state.item.dataset.expanded = String(state.expanded);
        state.summary.addEventListener('click', (event) => {
            event.preventDefault();
            const expanded = !state.expanded;
            if (expanded) states.filter((other) => other !== state && other.expanded).forEach((other) => setExpanded(other, false));
            setExpanded(state, expanded);
        });
        state.item.addEventListener('toggle', () => {
            if (state.heightAnimation && state.item.open) return;
            state.expanded = state.item.open;
            state.item.dataset.expanded = String(state.expanded);
            if (state.heightAnimation) finish(state);
            else {
                if (state.expanded) states.filter((other) => other !== state && other.expanded).forEach((other) => setExpanded(other, false));
                refresh();
            }
        });
    });
    const settle = () => states.filter((state) => state.heightAnimation).forEach(finish);
    reduced.addEventListener('change', settle);
    window.addEventListener('resize', settle);
    window.addEventListener('beforeprint', settle);
}

function initializeGallery() {
    const data = document.getElementById('gallery-data');
    const grid = document.getElementById('gallery-grid');
    const filters = document.querySelector('[data-gallery-filters]');
    const dialog = document.querySelector('[data-gallery-dialog]');
    if (!data || !grid || !filters || !dialog) return;

    let projects;
    try {
        projects = JSON.parse(data.textContent);
    } catch {
        return; // Ordinary image links remain available if enhancement cannot start.
    }

    const cards = [...grid.querySelectorAll('[data-category]')];
    let visibleIndices = projects.map((_, index) => index);
    let activeIndex = 0;
    let opener = null;
    const image = dialog.querySelector('[data-lightbox-image]');
    const previous = dialog.querySelector('[data-lightbox-previous]');
    const next = dialog.querySelector('[data-lightbox-next]');

    function updatePhoto(index) {
        const project = projects[index];
        if (!project) return;
        activeIndex = index;
        image.src = project.src;
        image.alt = `${project.alt}${project.is_reference ? '' : ' Inšpiračná fotografia cudzej stavby.'}`;
        dialog.querySelector('#lightbox-title').textContent = project.title;
        dialog.querySelector('#lightbox-description').textContent = project.description;
        dialog.querySelector('[data-lightbox-category]').textContent = `${project.label} · ${project.is_reference ? 'Realizácia' : 'Inšpirácia'}`;
        dialog.querySelector('[data-lightbox-author]').textContent = `Foto: ${project.credit}`;
        dialog.querySelector('[data-lightbox-credit]').href = project.source;
        dialog.querySelector('[data-lightbox-counter]').textContent = `${visibleIndices.indexOf(index) + 1} / ${visibleIndices.length}`;
        previous.disabled = next.disabled = visibleIndices.length < 2;
    }

    function changePhoto(direction) {
        const position = visibleIndices.indexOf(activeIndex);
        updatePhoto(visibleIndices[(position + direction + visibleIndices.length) % visibleIndices.length]);
    }

    filters.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter]');
        if (!button || !filters.contains(button)) return;
        const selected = button.dataset.filter;
        filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        visibleIndices = [];
        cards.forEach((card, index) => {
            card.hidden = selected !== 'all' && card.dataset.category !== selected;
            if (!card.hidden) visibleIndices.push(index);
        });
        grid.dataset.filtered = String(selected !== 'all');
        const count = visibleIndices.length;
        const noun = count === 1 ? 'fotografia' : count >= 2 && count <= 4 ? 'fotografie' : 'fotografií';
        document.querySelector('[data-gallery-count]').textContent = `${count} ${noun}`;
        document.dispatchEvent(new Event('portfolio:layout-change'));
    });
    filters.hidden = false;

    if (typeof dialog.showModal !== 'function') return;

    grid.addEventListener('click', (event) => {
        const link = event.target.closest('[data-gallery-open]');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const index = Number(link.dataset.galleryIndex);
        if (!projects[index]) return;
        updatePhoto(index);
        try {
            dialog.showModal();
            opener = link;
            dialog.querySelector('[data-lightbox-close]').focus();
            event.preventDefault();
        } catch {
            // The href still opens the actual image when native dialogs are unavailable.
        }
    });

    dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
    previous.addEventListener('click', () => changePhoto(-1));
    next.addEventListener('click', () => changePhoto(1));
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href]')];
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                last.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === last) {
                first.focus();
                event.preventDefault();
            }
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
            event.preventDefault();
        }
    });
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
}

function initializeSmoothScroll(gsap, ScrollTrigger) {
    let active = true;
    let lenis;
    const dialog = document.querySelector('[data-gallery-dialog]');
    // Real frame time keeps scroll in sync without changing GSAP's global clock.
    const tick = () => lenis?.raf(performance.now());
    const resize = () => lenis?.resize();
    const settle = () => lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    const syncDialog = () => {
        if (!lenis) return;
        if (dialog?.open) lenis.stop();
        else lenis.start();
    };
    const observer = new MutationObserver(syncDialog);
    const keyboard = (event) => {
        if (event.defaultPrevented || event.target.isContentEditable || event.target.closest('input, textarea, select')) return;
        if (event.key === ' ' && event.target.closest('button')) return;
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) settle();
    };
    const anchor = (event) => {
        const link = event.target.closest('a[href]');
        if (!lenis || lenis.isStopped || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
        const targetUrl = new URL(link.href, window.location.href);
        if (targetUrl.origin !== location.origin || targetUrl.pathname !== location.pathname || targetUrl.search !== location.search || !targetUrl.hash) return;
        let id;
        try { id = decodeURIComponent(targetUrl.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        if (location.hash !== targetUrl.hash) history.pushState(history.state, '', targetUrl.hash);
        lenis.scrollTo(target, {
            immediate: link.classList.contains('skip-link'),
            duration: 1.5,
            easing: (progress) => 1 - Math.pow(1 - progress, 4),
            onComplete: () => target.focus({ preventScroll: true }),
        });
    };

    import('lenis').then(({ default: Lenis }) => {
        if (!active) return;
        lenis = new Lenis({
            lerp: 0.055,
            wheelMultiplier: 1.05,
            smoothWheel: true,
            syncTouch: false,
            autoRaf: false,
            anchors: false,
            prevent: (node) => node.tagName === 'DIALOG',
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(tick);
        ScrollTrigger.addEventListener('refresh', resize);
        document.addEventListener('click', anchor);
        document.addEventListener('keydown', keyboard);
        document.addEventListener('focusin', settle);
        window.addEventListener('popstate', settle);
        window.addEventListener('hashchange', settle);
        window.addEventListener('pagehide', settle);
        window.addEventListener('pageshow', resize);
        if (dialog) observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
        syncDialog();
    }).catch(() => {
        // Native scrolling remains available if the optional chunk cannot load.
        cleanup();
    });

    function cleanup() {
        active = false;
        observer.disconnect();
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener('refresh', resize);
        document.removeEventListener('click', anchor);
        document.removeEventListener('keydown', keyboard);
        document.removeEventListener('focusin', settle);
        window.removeEventListener('popstate', settle);
        window.removeEventListener('hashchange', settle);
        window.removeEventListener('pagehide', settle);
        window.removeEventListener('pageshow', resize);
        lenis?.stop();
        lenis?.destroy();
        lenis = null;
    }
    return cleanup;
}

function animateHeroCaption(gsap, caption) {
    const lines = [...caption.querySelectorAll('[data-typewriter-line]')];
    const text = lines.map((line) => line.textContent);
    const animation = gsap.timeline({ paused: true });
    lines.forEach((line, index) => {
        const fragment = document.createDocumentFragment();
        for (const character of Array.from(text[index])) {
            const letter = document.createElement('span');
            letter.dataset.typewriterChar = '';
            letter.textContent = character;
            fragment.append(letter);
        }
        line.replaceChildren(fragment);
        // All letters keep their space while only their appearance changes.
        gsap.set(line.children, { opacity: 0, y: 5, filter: 'blur(3px)' });
        animation.to(line.children, {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.22, stagger: 0.055,
            ease: 'power2.out', clearProps: 'opacity,transform,filter',
        }, index ? '>+=0.12' : 0);
    });
    let started = false;
    return {
        play: () => {
            if (started) return;
            started = true;
            animation.play();
        },
        cleanup: () => {
            animation.kill();
            lines.forEach((line, index) => { line.textContent = text[index]; });
        },
    };
}

function animateHero(gsap, ScrollTrigger, desktop, smoothDesktop) {
    const stage = document.querySelector('[data-hero-scene]');
    if (!stage) return () => {};
    const photo = stage.querySelector('[data-hero-media]');
    const image = stage.querySelector('[data-hero-image]');
    const copy = stage.querySelector('.hero-copy');
    const actions = stage.querySelector('.hero-actions');
    const caption = stage.querySelector('[data-hero-caption]');
    const captionMotion = animateHeroCaption(gsap, caption);
    gsap.from(copy.querySelectorAll('[data-motion-word]'), {
        yPercent: 115, duration: 1.1, stagger: 0.12, ease: 'power3.out', clearProps: 'transform',
    });

    if (!desktop) {
        gsap.fromTo(photo, { borderRadius: '170px 170px 22px 22px' }, {
            borderRadius: '24px 24px 24px 24px', ease: 'none',
            scrollTrigger: { trigger: photo, start: 'clamp(top 85%)', end: 'bottom 35%', scrub: 0.8 },
        });
        gsap.fromTo(image, { scale: 1.14, yPercent: -3 }, {
            scale: 1.04, yPercent: 1, ease: 'none',
            scrollTrigger: { trigger: photo, start: 'clamp(top bottom)', end: 'bottom top', scrub: 0.8 },
        });
        ScrollTrigger.create({
            trigger: caption, start: 'clamp(top 90%)', once: true,
            onEnter: captionMotion.play,
        });
        return captionMotion.cleanup;
    }

    stage.classList.add('is-cinematic');
    const header = document.querySelector('.site-header');
    const shade = stage.querySelector('[data-hero-shade]');
    const scrollHint = stage.querySelector('.hero-scroll');
    gsap.set(stage, { '--header-height': `${header.offsetHeight}px` });
    gsap.set(photo, { clipPath: 'inset(7% 4% 9% 56% round 48% 48% 8% 8%)' });
    gsap.set(image, { scale: 1.18, yPercent: -2, rotation: 0.4 });
    gsap.set(caption, { opacity: 0 });
    gsap.set(shade, { opacity: 0.28 });

    const timeline = gsap.timeline({
        scrollTrigger: {
            id: 'hero-morph',
            trigger: stage,
            start: () => `top ${header.offsetHeight}px`,
            end: () => `+=${Math.min(window.innerHeight * 1.15, 1100)}`,
            pin: true,
            scrub: smoothDesktop ? 0.15 : 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Invisible CTAs must not remain in the keyboard tab order.
                actions.inert = self.progress > 0.35;
                if (self.progress >= 0.68) captionMotion.play();
            },
        },
    });
    timeline
        .to(photo, { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
        .to(image, { scale: 1.015, yPercent: 0, rotation: 0, duration: 1.2, ease: 'power1.inOut' }, 0)
        .to(copy, { x: -100, scale: 0.96, opacity: 0, filter: 'blur(12px)', duration: 0.42, ease: 'power2.in' }, 0.04)
        .to(scrollHint, { opacity: 0, duration: 0.2 }, 0.02)
        .to(shade, { opacity: 0.84, duration: 0.5 }, 0.38)
        .to(caption, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.76)
        .to(stage.querySelector('[data-scene-progress]'), { scaleX: 1, duration: 1.2, ease: 'none' }, 0);

    return () => {
        captionMotion.cleanup();
        stage.classList.remove('is-cinematic');
        actions.inert = false;
        // The centered desktop transform must not survive the static layout.
        ['transform', 'translate', 'rotate', 'scale', 'opacity', 'filter'].forEach((property) => copy.style.removeProperty(property));
    };
}

function animateButtons(gsap) {
    const cleanups = [];
    document.querySelectorAll('.button, .header-contact').forEach((button) => {
        const x = gsap.quickTo(button, 'x', { duration: 0.35, ease: 'power3.out' });
        const y = gsap.quickTo(button, 'y', { duration: 0.35, ease: 'power3.out' });
        const move = (event) => {
            const bounds = button.getBoundingClientRect();
            x((event.clientX - bounds.left - bounds.width / 2) * 0.08);
            y((event.clientY - bounds.top - bounds.height / 2) * 0.13);
        };
        const leave = () => { x(0); y(0); };
        button.addEventListener('pointermove', move);
        button.addEventListener('pointerleave', leave);
        button.addEventListener('blur', leave);
        cleanups.push(() => {
            button.removeEventListener('pointermove', move);
            button.removeEventListener('pointerleave', leave);
            button.removeEventListener('blur', leave);
        });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
}

async function initializeMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let media;
    try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
            import('gsap'),
            import('gsap/ScrollTrigger'),
        ]);
        await document.fonts.ready;
        gsap.registerPlugin(ScrollTrigger);
        media = gsap.matchMedia();
        media.add({
            motion: '(prefers-reduced-motion: no-preference)',
            wide: '(min-width: 768px)',
            desktop: '(min-width: 1024px)',
            pointer: '(hover: hover) and (pointer: fine)',
        }, (context) => {
            if (!context.conditions.motion) return;
            const smoothDesktop = context.conditions.desktop && context.conditions.pointer;
            const heroCleanup = animateHero(gsap, ScrollTrigger, context.conditions.desktop, smoothDesktop);
            const scrollCleanup = smoothDesktop ? initializeSmoothScroll(gsap, ScrollTrigger) : () => {};
            const buttonCleanup = context.conditions.pointer ? animateButtons(gsap) : () => {};

            document.querySelectorAll('.motion-heading:not(#hero-title)').forEach((heading) => {
                gsap.from(heading.querySelectorAll('[data-motion-word]'), {
                    yPercent: 110, duration: 0.95, stagger: 0.055, ease: 'power3.out', clearProps: 'transform',
                    scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
                });
            });
            document.querySelectorAll('[data-reveal]').forEach((element) => {
                gsap.from(element, {
                    y: context.conditions.wide ? 42 : 22, duration: 0.85, ease: 'power3.out', clearProps: 'transform',
                    scrollTrigger: { trigger: element, start: 'top 93%', once: true },
                });
            });
            document.querySelectorAll('[data-parallax]').forEach((frame) => {
                const layer = frame.querySelector('[data-parallax-layer]');
                if (!layer) return;
                const strength = Number(frame.dataset.parallax) || 0.06;
                const travel = () => Math.min(frame.clientHeight * strength * (context.conditions.wide ? 1 : 0.55), context.conditions.wide ? 60 : 24);
                const scale = () => 1 + (travel() * 2 + 2) / Math.max(frame.clientHeight, 1);
                gsap.fromTo(layer, { y: () => -travel(), scale }, {
                    y: travel, scale, ease: 'none',
                    scrollTrigger: { trigger: frame, start: 'clamp(top bottom)', end: 'clamp(bottom top)', scrub: smoothDesktop ? 0.15 : 0.8, invalidateOnRefresh: true },
                });
            });
            document.querySelectorAll('[data-photo-morph]').forEach((mask, index) => {
                const curved = context.conditions.wide
                    ? (index % 2 ? 'inset(12% 8% 12% 8% round 42% 42% 42% 42%)' : 'inset(8% 5% 8% 5% round 45% 45% 8% 8%)')
                    : 'inset(5% 3% 5% 3% round 25% 25% 8% 8%)';
                gsap.fromTo(mask, { clipPath: curved }, {
                    clipPath: 'inset(0% 0% 0% 0% round 3% 3% 3% 3%)', ease: 'power2.out',
                    scrollTrigger: { trigger: mask.parentElement, start: 'top 95%', end: 'top 28%', scrub: smoothDesktop ? 0.15 : 0.8 },
                });
            });
            document.querySelectorAll('.service-drawing, [data-plan-drawing]').forEach((drawing) => {
                const paths = [...drawing.querySelectorAll('path, line, polyline, circle, rect')].filter((path) => typeof path.getTotalLength === 'function');
                paths.forEach((path) => {
                    const length = path.getTotalLength();
                    gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
                        strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
                        scrollTrigger: { trigger: drawing, start: 'top 88%', once: true },
                    });
                });
            });

            const refresh = (event) => {
                if (event?.type === 'toggle' && event.target.matches('.faq-item[data-faq-animated]')) return;
                ScrollTrigger.refresh();
            };
            const disclosures = document.querySelectorAll('.craft-principle, .faq-item, .photo-information, .service-detail');
            document.addEventListener('portfolio:layout-change', refresh);
            disclosures.forEach((element) => element.addEventListener('toggle', refresh));
            return () => {
                document.removeEventListener('portfolio:layout-change', refresh);
                disclosures.forEach((element) => element.removeEventListener('toggle', refresh));
                scrollCleanup();
                heroCleanup();
                buttonCleanup();
            };
        });
    } catch {
        media?.revert();
        document.querySelector('[data-hero-scene]')?.classList.remove('is-cinematic');
        const actions = document.querySelector('.hero-actions');
        if (actions) actions.inert = false;
        document.querySelectorAll('[data-reveal], .hero-copy, [data-parallax-layer], [data-motion-word], [data-photo-morph], [data-typewriter-char]').forEach((element) => {
            ['opacity', 'transform', 'translate', 'rotate', 'scale', 'filter', 'clip-path'].forEach((property) => element.style.removeProperty(property));
        });
    }
}

initializeNavigation();
initializeFAQ();
initializeGallery();
if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initializeMotion, { timeout: 1500 });
} else {
    window.setTimeout(initializeMotion, 120);
}
