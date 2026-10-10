const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate = (element) => !reducedMotion.matches && typeof element?.animate === 'function';
// The desktop Lenis instance while smoothing is active, so programmatic scrolls share its easing.
let smoothScroller = null;
// A page opened with #section is placed once; later smoothing restarts must not jump back there.
let initialHashSettled = false;

function initializeNavigation() {
    const menu = document.querySelector('[data-mobile-menu]');
    if (!menu) return;

    const summary = menu.querySelector('summary');
    const panel = menu.querySelector('.mobile-navigation-panel');
    const backdrop = menu.querySelector('.mobile-navigation-backdrop');
    const parts = () => [panel, backdrop, ...panel.children].filter(Boolean);
    let closing = null;
    menu.dataset.state = menu.open ? 'open' : 'closed';

    function open() {
        parts().forEach((part) => part.getAnimations().forEach((animation) => animation.cancel()));
        closing = null;
        menu.dataset.state = 'open';
        menu.open = true;
        if (!canAnimate(panel)) return;
        // The negative bottom inset keeps the panel shadow visible while it unfolds.
        panel.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 -48px 0)' }], { duration: 560, easing: EASE_OUT });
        backdrop?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
        [...panel.children].forEach((link, index) => link.animate(
            [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
            { duration: 560, delay: 70 + index * 45, easing: EASE_OUT, fill: 'backwards' },
        ));
    }

    function close({ instant = false } = {}) {
        if (!menu.open || closing) return;
        menu.dataset.state = 'closed';
        if (instant || !canAnimate(panel)) {
            menu.open = false;
            return;
        }
        const timing = { duration: 300, easing: 'cubic-bezier(.55,0,.7,.4)', fill: 'forwards' };
        const animation = panel.animate([{ clipPath: 'inset(0 0 -48px 0)' }, { clipPath: 'inset(0 0 100% 0)' }], timing);
        backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], timing);
        closing = animation;
        animation.onfinish = () => {
            if (closing !== animation) return;
            closing = null;
            menu.open = false;
            parts().forEach((part) => part.getAnimations().forEach((item) => item.cancel()));
        };
    }

    // Opening in the click task lets the first painted frame already belong to the animation.
    summary.addEventListener('click', (event) => {
        event.preventDefault();
        if (menu.open && !closing) close();
        else open();
    });
    menu.addEventListener('toggle', () => {
        if (!closing) menu.dataset.state = menu.open ? 'open' : 'closed';
    });

    menu.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;
        close();
        const target = document.getElementById(link.hash.slice(1));
        if (target) target.focus({ preventScroll: true });
    });

    document.addEventListener('pointerdown', (event) => {
        if (menu.open && (!menu.contains(event.target) || event.target === backdrop)) close();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.open) {
            close();
            summary.focus();
            event.preventDefault();
        }
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
        if (event.matches) close({ instant: true });
    });
}

function initializeHeader() {
    const header = document.querySelector('.site-header');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!header) return;
    const parts = [...header.querySelectorAll('[data-header-part]')];
    let settleUntil = 0;
    let frame = 0;

    // The first element under a point outside the header decides the tone; unmarked surfaces count as light.
    const below = (x, y) => document.elementsFromPoint(x, y).find((element) => !header.contains(element));

    function update() {
        const menuOpen = menu?.dataset.state === 'open';
        const middle = header.querySelector('.header-inner').getBoundingClientRect();
        let overContent = false;
        parts.forEach((part) => {
            const bounds = part.getBoundingClientRect();
            if (!bounds.width) return;
            const element = below(bounds.left + bounds.width / 2, middle.top + middle.height / 2);
            overContent ||= Boolean(element) && element.tagName !== 'IMG';
            part.dataset.on = menuOpen ? 'light' : element?.closest('[data-surface]')?.dataset.surface ?? 'light';
        });
        // Passing text and lines are softened; a photograph alone under the header stays edge to edge.
        header.toggleAttribute('data-veil', window.scrollY > 8 && overContent);
    }

    // Surfaces keep moving after the trigger (scrubbed scenes, intro animations, smooth-scroll coasting),
    // so every trigger re-reads the page each frame for a short while instead of once.
    const loop = (now) => {
        update();
        frame = now < settleUntil ? requestAnimationFrame(loop) : 0;
    };
    const queue = () => {
        settleUntil = performance.now() + 1200;
        if (!frame) frame = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    window.addEventListener('pageshow', queue);
    document.addEventListener('portfolio:layout-change', queue);
    document.addEventListener('portfolio:surface-change', queue);
    document.fonts?.ready.then(queue);
    menu?.addEventListener('click', queue);
    menu?.addEventListener('toggle', queue);
    // A slow safety check catches anything that changed without an event.
    window.setInterval(() => {
        if (!document.hidden && !frame) update();
    }, 700);
    queue();
}

// Gallery pile: a card shrinks and dims as the following cards slide over it; each arriving photo settles from a slight zoom.
function initializeGalleryStack() {
    const cards = [...document.querySelectorAll('.gallery-card')].map((card) => ({
        card, frame: card.querySelector('[data-stack-frame]'), shade: card.querySelector('.gallery-card-shade'), photo: card.querySelector('[data-parallax-layer]'),
    })).filter((item) => item.frame && item.shade && item.photo);
    if (!cards.length) return;
    let queued = false;

    // Cards slide in faster than a lazy image near the screen edge loads (Safari loads late), so the whole pile
    // starts loading once the gallery is a screen away.
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            cards.forEach(({ photo }) => photo.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = 'eager'; }));
            observer.disconnect();
        }, { rootMargin: '100% 0px' });
        observer.observe(cards[0].card.parentElement);
    }

    function update() {
        queued = false;
        if (reducedMotion.matches) {
            cards.forEach(({ frame, shade, photo }) => {
                frame.style.removeProperty('scale');
                photo.style.removeProperty('scale');
                shade.style.removeProperty('opacity');
            });
            return;
        }
        const viewport = window.innerHeight;
        const visible = cards.filter(({ card }) => !card.hidden);
        // 0 while a card is below the screen, 1 once it rests at its sticky place in the pile.
        const arrival = visible.map(({ card }) => {
            const rest = parseFloat(getComputedStyle(card).top) || 0;
            return Math.min(Math.max((viewport - card.getBoundingClientRect().top) / Math.max(viewport - rest, 1), 0), 1);
        });
        visible.forEach(({ frame, shade, photo }, index) => {
            const covered = arrival.slice(index + 1).reduce((sum, value) => sum + value, 0);
            frame.style.scale = String(1 - Math.min(covered, 3) * 0.05);
            shade.style.opacity = String(Math.min(covered * 0.34, 0.62));
            photo.style.scale = String(1.12 - arrival[index] * 0.12);
        });
    }

    const queue = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    document.addEventListener('portfolio:layout-change', queue);
    reducedMotion.addEventListener('change', queue);
    update();
}

// Sections marked data-snap settle to fill the screen once scrolling stops with most of them in view.
function initializeSectionSnap() {
    const sections = [...document.querySelectorAll('[data-snap]')];
    if (!sections.length) return;
    const menu = document.querySelector('[data-mobile-menu]');
    const dialog = document.querySelector('[data-gallery-dialog]');
    const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
    let timer = 0;
    let touching = false;

    function settle() {
        if (touching || reducedMotion.matches || menu?.open || dialog?.open) return;
        const viewport = window.innerHeight;
        for (const section of sections) {
            const { top, bottom } = section.getBoundingClientRect();
            if (Math.min(bottom, viewport) - Math.max(top, 0) < viewport * 0.7) continue;
            // Align the edge that is still inside the screen; when both are outside the section already fills it.
            const offset = top > 0 ? top : bottom < viewport ? bottom - viewport : 0;
            if (Math.abs(offset) <= 1) return;
            const target = window.scrollY + offset;
            if (smoothScroller) smoothScroller.scrollTo(target, { duration: 0.9, easing: easeInOut });
            else window.scrollTo({ top: target, behavior: 'smooth' });
            return;
        }
    }

    const schedule = () => {
        clearTimeout(timer);
        timer = window.setTimeout(settle, 140);
    };
    const release = () => {
        touching = false;
        schedule();
    };
    window.addEventListener('scroll', schedule, { passive: true });
    // A finger resting on the screen is still steering; settle only after it lifts and momentum ends.
    window.addEventListener('touchstart', () => {
        touching = true;
        clearTimeout(timer);
    }, { passive: true });
    window.addEventListener('touchend', release, { passive: true });
    window.addEventListener('touchcancel', release, { passive: true });
}

// Groups of native disclosures and the element that holds each answer.
const DISCLOSURES = [
    ['.faq-item', '.faq-answer'],
    ['.craft-principle', ':scope > p'],
    ['.service-detail', '.service-description'],
    ['.photo-information', ':scope > ul'],
];

function initializeDisclosures() {
    const items = DISCLOSURES.flatMap(([selector, content]) => [...document.querySelectorAll(selector)].map((item) => [item, content]));
    if (!items.length || typeof items[0][0].animate !== 'function') return;
    const refresh = () => document.dispatchEvent(new Event('portfolio:layout-change'));
    const states = items.map(([item, content]) => ({
        item, summary: item.querySelector('summary'), answer: item.querySelector(content), group: item.getAttribute('name'),
        expanded: item.open, heightAnimation: null, answerAnimation: null,
    })).filter((state) => state.summary && state.answer);
    const siblings = (state) => states.filter((other) => other !== state && other.expanded && state.group && other.group === state.group);

    function finish(state) {
        const changed = state.item.open !== state.expanded;
        state.item.open = state.expanded;
        state.heightAnimation?.cancel();
        state.answerAnimation?.cancel();
        state.heightAnimation = state.answerAnimation = null;
        state.item.removeAttribute('data-disclosure-animating');
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
        if (reducedMotion.matches) {
            finish(state);
            return;
        }

        // Keep native content visible until closing finishes; measure the new natural height.
        state.item.open = true;
        const fullHeight = state.item.getBoundingClientRect().height;
        const endHeight = expanded ? fullHeight : fullHeight - state.answer.getBoundingClientRect().height;
        const timing = { duration: expanded ? 480 : 400, easing: EASE_OUT, fill: 'both' };
        state.item.dataset.disclosureAnimating = '';
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
        state.item.dataset.disclosureAnimated = '';
        state.item.dataset.expanded = String(state.expanded);
        state.summary.addEventListener('click', (event) => {
            event.preventDefault();
            const expanded = !state.expanded;
            if (expanded) siblings(state).forEach((other) => setExpanded(other, false));
            setExpanded(state, expanded);
        });
        state.item.addEventListener('toggle', () => {
            if (state.heightAnimation && state.item.open) return;
            state.expanded = state.item.open;
            state.item.dataset.expanded = String(state.expanded);
            if (state.heightAnimation) finish(state);
            else {
                if (state.expanded) siblings(state).forEach((other) => setExpanded(other, false));
                refresh();
            }
        });
    });
    const settle = () => states.filter((state) => state.heightAnimation).forEach(finish);
    reducedMotion.addEventListener('change', settle);
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
    const stage = dialog.querySelector('.lightbox-image-stage');
    const caption = dialog.querySelector('.lightbox-caption');
    const previous = dialog.querySelector('[data-lightbox-previous]');
    const next = dialog.querySelector('[data-lightbox-next]');
    let swap = 0;

    function render(project) {
        image.src = project.src;
        image.alt = `${project.alt}${project.is_reference ? '' : ' Inšpiračná fotografia cudzej stavby.'}`;
        dialog.querySelector('#lightbox-title').textContent = project.title;
        dialog.querySelector('#lightbox-description').textContent = project.description;
        dialog.querySelector('[data-lightbox-category]').textContent = `${project.label} · ${project.is_reference ? 'Realizácia' : 'Inšpirácia'}`;
        dialog.querySelector('[data-lightbox-author]').textContent = `Foto: ${project.credit}`;
        dialog.querySelector('[data-lightbox-credit]').href = project.source;
    }

    function settlePhoto() {
        swap += 1;
        [image, caption].forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
    }

    function updatePhoto(index, direction = 0) {
        const project = projects[index];
        if (!project) return;
        activeIndex = index;
        dialog.querySelector('[data-lightbox-counter]').textContent = `${visibleIndices.indexOf(index) + 1} / ${visibleIndices.length}`;
        previous.disabled = next.disabled = visibleIndices.length < 2;
        if (!direction || !dialog.open || !canAnimate(image)) {
            settlePhoto();
            render(project);
            return;
        }

        // The current photo leaves first; the next one enters from the travel direction once decoded.
        const token = ++swap;
        const preload = new Image();
        preload.src = project.src;
        Promise.all([
            preload.decode().catch(() => {}),
            image.animate([{ opacity: 0, transform: `translateX(${direction * -28}px)` }], { duration: 180, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.catch(() => {}),
            caption.animate([{ opacity: 0 }], { duration: 160, fill: 'forwards' }).finished.catch(() => {}),
        ]).then(() => {
            if (token !== swap) return;
            [image, caption].forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
            render(project);
            image.animate([{ opacity: 0, transform: `translateX(${direction * 36}px)` }, { opacity: 1, transform: 'none' }], { duration: 520, easing: EASE_OUT });
            caption.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: EASE_OUT });
        });
    }

    function changePhoto(direction) {
        const position = visibleIndices.indexOf(activeIndex);
        updatePhoto(visibleIndices[(position + direction + visibleIndices.length) % visibleIndices.length], direction);
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
        // Visible cards take consecutive places in the pile.
        cards.filter((card) => !card.hidden).forEach((card, order) => card.style.setProperty('--card', order));
        const count = visibleIndices.length;
        const noun = count === 1 ? 'fotografia' : count >= 2 && count <= 4 ? 'fotografie' : 'fotografií';
        document.querySelector('[data-gallery-count]').textContent = `${count} ${noun}`;
        // Measure the settled layout before the entering cards are offset.
        document.dispatchEvent(new Event('portfolio:layout-change'));
        if (!canAnimate(grid)) return;
        cards.filter((card) => !card.hidden).forEach((card, order) => [...card.children].forEach((part, depth) => part.animate(
            [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
            { duration: 620, delay: order * 80 + depth * 60, easing: EASE_OUT, fill: 'backwards' },
        )));
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
        settlePhoto();
        if (opener?.isConnected) opener.focus({ preventScroll: true });
    });

    // Horizontal touch swipes change photos; vertical movement keeps scrolling the dialog.
    let swipe = null;
    stage.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' || event.target.closest('button') || visibleIndices.length < 2) return;
        swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
        image.style.transition = 'none';
    });
    stage.addEventListener('pointermove', (event) => {
        if (event.pointerId !== swipe?.id) return;
        swipe.dx = event.clientX - swipe.x;
        swipe.dy = event.clientY - swipe.y;
        if (!reducedMotion.matches && Math.abs(swipe.dx) > Math.abs(swipe.dy)) image.style.translate = `${swipe.dx * 0.55}px 0`;
    });
    const endSwipe = (event) => {
        if (event.pointerId !== swipe?.id) return;
        const { dx, dy } = swipe;
        swipe = null;
        image.style.removeProperty('transition');
        image.style.removeProperty('translate');
        if (event.type === 'pointerup' && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) changePhoto(dx < 0 ? 1 : -1);
    };
    stage.addEventListener('pointerup', endSwipe);
    stage.addEventListener('pointercancel', endSwipe);
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
        lenis = smoothScroller = new Lenis({
            lerp: 0.055,
            wheelMultiplier: 1.05,
            smoothWheel: true,
            syncTouch: false,
            autoRaf: false,
            anchors: false,
            prevent: (node) => node.tagName === 'DIALOG',
        });
        lenis.on('scroll', ScrollTrigger.update);
        // Starting Lenis interrupts the browser's own jump to #section on load (e.g. /#kontakt from a legal page).
        if (!initialHashSettled) {
            initialHashSettled = true;
            let target = null;
            try {
                target = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
            } catch {
                target = null;
            }
            if (target) lenis.scrollTo(target, { immediate: true, force: true });
        }
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
        if (smoothScroller === lenis) smoothScroller = null;
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
    // The opening reveal is CSS, so it starts with the first paint instead of after this chunk loads.
    const captionMotion = animateHeroCaption(gsap, caption);

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
    // The arch keeps its old place below the header; the stage itself starts under it and fills the viewport.
    const arch = () => {
        const reserved = header.offsetHeight;
        const visible = stage.clientHeight - reserved;
        return `inset(${reserved + visible * 0.07}px ${stage.clientWidth * 0.04}px ${visible * 0.09}px ${stage.clientWidth * 0.56}px round 48% 48% 8% 8%)`;
    };
    gsap.set(image, { scale: 1.18, yPercent: -2, rotation: 0.4 });
    gsap.set(caption, { opacity: 0 });
    gsap.set(shade, { opacity: 0.28 });

    const timeline = gsap.timeline({
        scrollTrigger: {
            id: 'hero-morph',
            trigger: stage,
            start: 'top top',
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
        .fromTo(photo, { clipPath: arch }, { clipPath: 'inset(0px 0px 0px 0px round 0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, 0)
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
    document.querySelectorAll('.button, .header-contact, .back-to-top-circle').forEach((button) => {
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

// Supporting copy fades in after its heading; short lists arrive item by item.
const REVEAL_TEXT = 'main .section-label:not(.hero .section-label), .section-description, .introduction .body-copy, .garden-plan figcaption, .craft-copy > p, .contact-copy > p, .download-note, .checklist-title, .contact-details, .gallery-toolbar, .content-note';
const REVEAL_GROUPS = [['.faq-list', '.faq-item'], ['.craft-principles', '.craft-principle'], ['.contact-checklist', 'li']];

async function initializeMotion() {
    if (reducedMotion.matches) return;

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
                // Cards sharing a row arrive one after another instead of as a block.
                const columns = getComputedStyle(element.parentElement).gridTemplateColumns.split(' ').length;
                const column = [...element.parentElement.children].indexOf(element) % columns;
                gsap.from(element, {
                    y: context.conditions.wide ? 42 : 30, opacity: 0, duration: 0.95, delay: column * 0.1, ease: 'power3.out', clearProps: 'opacity,transform',
                    scrollTrigger: { trigger: element, start: 'top 92%', once: true },
                });
            });
            document.querySelectorAll(REVEAL_TEXT).forEach((element) => {
                gsap.from(element, {
                    y: 16, opacity: 0, duration: 0.85, ease: 'power2.out', clearProps: 'opacity,transform',
                    scrollTrigger: { trigger: element, start: 'top 94%', once: true },
                });
            });
            REVEAL_GROUPS.forEach(([container, item]) => document.querySelectorAll(container).forEach((group) => {
                gsap.from(group.querySelectorAll(`:scope > ${item}`), {
                    y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', clearProps: 'opacity,transform',
                    scrollTrigger: { trigger: group, start: 'top 90%', once: true },
                });
            }));
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
            const watermark = document.querySelector('[data-footer-watermark]');
            if (watermark) {
                // The name rises out of the footer edge letter by letter and settles exactly at the end of the page.
                gsap.timeline({
                    scrollTrigger: { trigger: watermark.parentElement, start: 'top bottom', end: 'bottom bottom', scrub: smoothDesktop ? 0.15 : 0.6, invalidateOnRefresh: true },
                })
                    .fromTo(watermark, { yPercent: 30 }, { yPercent: 0, ease: 'none', duration: 1 }, 0)
                    .fromTo(watermark.children, { yPercent: 90, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.55, stagger: 0.45 / Math.max(watermark.children.length - 1, 1) }, 0);
            }
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
                if (event?.type === 'toggle' && event.target.matches('[data-disclosure-animated]')) return;
                ScrollTrigger.refresh();
            };
            // Pins and scrubbed scenes move surfaces under the header without scrolling; let it look again.
            const surfaces = () => document.dispatchEvent(new Event('portfolio:surface-change'));
            ScrollTrigger.addEventListener('refresh', surfaces);
            surfaces();
            const disclosures = document.querySelectorAll('.craft-principle, .faq-item, .photo-information, .service-detail');
            document.addEventListener('portfolio:layout-change', refresh);
            disclosures.forEach((element) => element.addEventListener('toggle', refresh));
            return () => {
                document.removeEventListener('portfolio:layout-change', refresh);
                ScrollTrigger.removeEventListener('refresh', surfaces);
                surfaces();
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
        const revealed = [REVEAL_TEXT, ...REVEAL_GROUPS.map(([container, item]) => `${container} > ${item}`)].join(', ');
        document.querySelectorAll(`[data-reveal], .hero-copy, [data-parallax-layer], [data-motion-word], [data-typewriter-char], [data-footer-watermark], [data-watermark-letter], ${revealed}`).forEach((element) => {
            ['opacity', 'transform', 'translate', 'rotate', 'scale', 'filter', 'clip-path'].forEach((property) => element.style.removeProperty(property));
        });
    }
}

initializeNavigation();
initializeHeader();
initializeSectionSnap();
initializeDisclosures();
initializeGallery();
initializeGalleryStack();
if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initializeMotion, { timeout: 1500 });
} else {
    window.setTimeout(initializeMotion, 120);
}
