(function () {
    'use strict';

    const hero   = document.getElementById('dm-hero');
    const glow   = document.getElementById('dm-hero-glow');
    const canvas = document.getElementById('dm-hero-canvas');

    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');
    const CELL = 68;
    let cols, rows, cells = [], offset = 0, rafId;

    /* ── 1. CURSOR GLOW (lerped) ── */
    let glowX = 0, glowY = 0, targetX = 0, targetY = 0;

    hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        targetX = e.clientX - r.left;
        targetY = e.clientY - r.top;
    });

    (function lerpGlow() {
        glowX += (targetX - glowX) * 0.08;
        glowY += (targetY - glowY) * 0.08;
        if (glow) {
            glow.style.left = glowX + 'px';
            glow.style.top  = glowY + 'px';
        }
        requestAnimationFrame(lerpGlow);
    })();

    /* ── 2. CANVAS GRID ── */
    function initGrid() {
        canvas.width  = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        cols  = Math.ceil(canvas.width  / CELL) + 2;
        rows  = Math.ceil(canvas.height / CELL) + 2;
        cells = Array.from({ length: cols * rows }, () => ({
            alpha: 0,
            target: 0
        }));
    }

    /* Randomly light up a few cells */
    function activateCells() {
        const n = Math.max(2, Math.floor(cols * rows * 0.018));
        for (let k = 0; k < n; k++) {
            const i = Math.floor(Math.random() * cells.length);
            if (cells[i]) cells[i].target = Math.random() * 0.13 + 0.03;
        }
        setTimeout(activateCells, 700 + Math.random() * 900);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        /* drift offset makes grid appear to flow diagonally */
        offset = (offset + 0.18) % CELL;

        cells.forEach((cell, i) => {
            const cx = (i % cols) * CELL - offset;
            const cy = Math.floor(i / cols) * CELL - offset;

            /* ease towards target */
            cell.alpha += (cell.target - cell.alpha) * 0.028;
            if (cell.target > 0 && Math.abs(cell.alpha - cell.target) < 0.003) {
                cell.target = 0; /* start fading back */
            }

            /* grid lines */
            ctx.strokeStyle = 'rgba(32, 31, 31, 0.08)';
            ctx.lineWidth   = 1;
            ctx.strokeRect(cx, cy, CELL, CELL);           
        });

        rafId = requestAnimationFrame(draw);
    }

    /* ── Init ── */
    initGrid();
    activateCells();
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(rafId);
        initGrid();
        draw();
    });

})();


/* ================================================================
   DYNAMIC WORD CYCLE
   ================================================================ */
(function () {
    'use strict';

    const wordEl = document.getElementById('dm-hero-word');
    if (!wordEl) return;

    const words   = ['IGNORE.', 'DENY.', 'DOUBT.', 'RESIST.'];
    let current   = 0;
    const PAUSE   = 2400;  // ms each word is shown
    const EXIT_MS = 380;   // must match CSS wordExit duration

    function next() {
        /* 1. Exit current word downward */
        wordEl.classList.add('dm-hero__word--exit');

        setTimeout(() => {
            /* 2. Swap text while off-screen */
            wordEl.classList.remove('dm-hero__word--exit');
            current = (current + 1) % words.length;
            wordEl.textContent = words[current];

            /* 3. Enter new word from top */
            wordEl.classList.add('dm-hero__word--enter');
            setTimeout(() => wordEl.classList.remove('dm-hero__word--enter'), 450);
        }, EXIT_MS);
    }

    /* Start cycling after a delay so the page-load reveal finishes first */
    setInterval(next, PAUSE);
})();


/* ================================================================
   CUSTOM CURSOR  (dot snaps instantly, ring lerps behind)
   ================================================================ */
(function () {
    'use strict';

    const dot  = document.getElementById('dm-cursor-dot');
    const ring = document.getElementById('dm-cursor-ring');
    if (!dot || !ring) return;

    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    /* Dot follows cursor exactly */
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    /* Ring lerps smoothly behind */
    (function lerpRing() {
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(lerpRing);
    })();

    /* Grow/shrink ring on interactive elements */
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width       = '54px';
            ring.style.height      = '54px';
            ring.style.borderColor = 'rgba(145,13,23,0.95)';
            dot.style.transform    = 'translate(-50%,-50%) scale(1.6)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width       = '';
            ring.style.height      = '';
            ring.style.borderColor = '';
            dot.style.transform    = '';
        });
    });
})();


/* ================================================================
   STAT COUNTERS
   ================================================================ */
(function () {
    'use strict';

    const counters = document.querySelectorAll('.dm-hero__stat-number');
    if (!counters.length) return;

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        if (isNaN(target)) return;

        let count = 0;
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic out easing
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            count = Math.floor(easeProgress * target);
            el.textContent = count;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Hold for 2 seconds then restart
                setTimeout(() => {
                    el.textContent = '0';
                    setTimeout(() => animateCounter(el), 500); // Small reset gap
                }, 2000);
            }
        }

        requestAnimationFrame(update);
    }

    // Start all counters
    counters.forEach(counter => {
        // Initial delay to sync with hero entrance
        setTimeout(() => animateCounter(counter), 1000);
    });
})();

