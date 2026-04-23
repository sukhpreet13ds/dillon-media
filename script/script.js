

(function () {
    'use strict';

    const header        = document.getElementById('dm-header');
    const progress      = document.getElementById('dm-progress');
    const searchToggle  = document.getElementById('dm-search-toggle');
    const searchBox     = document.getElementById('dm-search-box');
    const searchInput   = document.getElementById('dm-search-input');
    const searchClose   = document.getElementById('dm-search-close');
    const navLinks      = document.querySelectorAll('.dm-nav__link');


  
    function onScroll () {
        const scrolled  = window.scrollY > 10;
        header.classList.toggle('is-scrolled', scrolled);

        const docH   = document.documentElement.scrollHeight - window.innerHeight;
        const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
        if (progress) progress.style.width = pct + '%';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); 


    function openSearch () {
        searchBox.classList.add('is-open');
        header.classList.add('search-active');
        searchToggle.setAttribute('aria-expanded', 'true');
        setTimeout(() => searchInput.focus(), 200);
    }

    function closeSearch () {
        searchBox.classList.remove('is-open');
        header.classList.remove('search-active');
        searchToggle.setAttribute('aria-expanded', 'false');
        searchInput.value = '';
    }

    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchBox.classList.contains('is-open') ? closeSearch() : openSearch();
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchBox.classList.contains('is-open')) {
            closeSearch();
            searchToggle.focus();
        }
    });

    document.addEventListener('click', (e) => {
        const search = document.getElementById('dm-search');
        if (search && !search.contains(e.target) && searchBox.classList.contains('is-open')) {
            closeSearch();
        }
    });


    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            /* Remove active from all */
            document.querySelectorAll('.dm-nav__item').forEach(li => {
                li.classList.remove('dm-nav__item--active');
            });
            /* Add to clicked */
            this.closest('.dm-nav__item').classList.add('dm-nav__item--active');

            /* Ripple burst */
            triggerRipple(this);
        });
    });


    function triggerRipple (el) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position:absolute; border-radius:50%;
            background:rgba(255,255,255,.28);
            width:8px; height:8px;
            top:50%; left:50%;
            transform:translate(-50%,-50%) scale(0);
            animation:dmRipple .55s ease forwards;
            pointer-events:none; z-index:9;
        `;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }


    if (!document.getElementById('dm-ripple-style')) {
        const s = document.createElement('style');
        s.id = 'dm-ripple-style';
        s.textContent = `
            @keyframes dmRipple {
                to { transform:translate(-50%,-50%) scale(18); opacity:0; }
            }
        `;
        document.head.appendChild(s);
    }






    const cta = document.getElementById('dm-cta');

    if (cta) {
        cta.addEventListener('mousemove', (e) => {
            const r  = cta.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width  / 2);
            const dy = e.clientY - (r.top  + r.height / 2);
            cta.style.transform = `
                translate(${dx * 0.18}px, ${dy * 0.18}px)
                scale(1.05)
            `;
        });

        cta.addEventListener('mouseleave', () => {
            cta.style.transform = '';
        });
    }


    const mobileBurger = document.getElementById('dm-mobile-burger');
    const mobileClose  = document.getElementById('dm-mobile-close');
    const mobileMenu   = document.getElementById('dm-mobile-menu');

    if (mobileBurger && mobileMenu) {
        mobileBurger.addEventListener('click', () => {
            mobileMenu.classList.add('is-open');
            document.body.style.overflow = 'hidden'; 
        });
    }

    if (mobileClose && mobileMenu) {
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    }

    /* ── Accordion triggers ── */
    const mobileTriggers = document.querySelectorAll('.dm-mobile-nav__trigger, .dm-mobile-nav__sub-trigger');

    mobileTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parent = this.parentElement;
            const isOpen = parent.classList.contains('active');

            /* Close siblings at the same level (only one open at a time) */
            const siblings = parent.parentElement.children;
            for (let sibling of siblings) {
                sibling.classList.remove('active');
            }

            /* Toggle clicked if it wasn't open */
            if (!isOpen) {
                parent.classList.add('active');
            }
        });
    });

})();

(function () {
    'use strict';

    const hero   = document.getElementById('dm-hero');
    const glow   = document.getElementById('dm-hero-glow');
    const canvas = document.getElementById('dm-hero-canvas');

    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');
    const CELL = 68;
    let cols, rows, cells = [], offset = 0, rafId;

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

        offset = (offset + 0.18) % CELL;

        cells.forEach((cell, i) => {
            const cx = (i % cols) * CELL - offset;
            const cy = Math.floor(i / cols) * CELL - offset;

            cell.alpha += (cell.target - cell.alpha) * 0.028;
            if (cell.target > 0 && Math.abs(cell.alpha - cell.target) < 0.003) {
                cell.target = 0; 
            }

            ctx.strokeStyle = 'rgba(32, 31, 31, 0.08)';
            ctx.lineWidth   = 1;
            ctx.strokeRect(cx, cy, CELL, CELL);           
        });

        rafId = requestAnimationFrame(draw);
    }

    initGrid();
    activateCells();
    draw();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(rafId);
        initGrid();
        draw();
    });

})();


(function () {
    'use strict';

    const wordEl = document.getElementById('dm-hero-word');
    if (!wordEl) return;

    const words   = ['IGNORE.', 'DENY.', 'DOUBT.', 'RESIST.'];
    let current   = 0;
    const PAUSE   = 2400;  
    const EXIT_MS = 380;  

    function next() {
        wordEl.classList.add('dm-hero__word--exit');

        setTimeout(() => {
            wordEl.classList.remove('dm-hero__word--exit');
            current = (current + 1) % words.length;
            wordEl.textContent = words[current];

            wordEl.classList.add('dm-hero__word--enter');
            setTimeout(() => wordEl.classList.remove('dm-hero__word--enter'), 450);
        }, EXIT_MS);
    }


    setInterval(next, PAUSE);
})();

(function () {
    'use strict';

    const dot  = document.getElementById('dm-cursor-dot');
    const ring = document.getElementById('dm-cursor-ring');
    if (!dot || !ring) return;

    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    });

    (function lerpRing() {
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(lerpRing);
    })();

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



(function () {
    'use strict';

    const counters = document.querySelectorAll('.dm-hero__stat-number');
    if (!counters.length) return;

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        if (isNaN(target)) return;

        let count = 0;
        const duration = 1500; 
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
         
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            count = Math.floor(easeProgress * target);
            el.textContent = count;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                
                setTimeout(() => {
                    el.textContent = '0';
                    setTimeout(() => animateCounter(el), 500); 
                }, 2000);
            }
        }

        requestAnimationFrame(update);
    }


    counters.forEach(counter => {
       
        setTimeout(() => animateCounter(counter), 1000);
    });
})();

const slider = document.querySelector('.dm-awards__timeline');

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
    isDown = false;
});

slider.addEventListener('mouseup', () => {
    isDown = false;
});

slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5; // speed
    slider.scrollLeft = scrollLeft - walk;
});

/* Our Work Slider Logic */
(function() {
    const slides = document.querySelectorAll('.dm-work__slide');
    const progressBar = document.querySelector('.dm-work__slider-bar');
    const nextBtn = document.querySelector('.dm-work__slider-arrow.next');
    const prevBtn = document.querySelector('.dm-work__slider-arrow.prev');
    
    if (!slides.length || !progressBar) return;
    
    let currentIndex = 0;
    const intervalTime = 5000;
    let slideInterval;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        resetProgressBar();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    }
    
    function resetProgressBar() {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        // Force reflow
        progressBar.offsetHeight; 
        setTimeout(() => {
            progressBar.style.transition = `width ${intervalTime}ms linear`;
            progressBar.style.width = '100%';
        }, 50);
    }
    
    function startInterval() {
        clearInterval(slideInterval);
        resetProgressBar();
        slideInterval = setInterval(nextSlide, intervalTime);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
            startInterval();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
            startInterval();
        });
    }
    
    // Pause on hover
    const sliderContainer = document.querySelector('.dm-work__item--slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        sliderContainer.addEventListener('mouseleave', () => startInterval());
    }
    
    startInterval();
})();




const words = document.querySelectorAll('.dm-work__text-word');
let index = 0;

setInterval(() => {
    words[index].classList.remove('active');
    index = (index + 1) % words.length;
    words[index].classList.add('active');
}, 1500);

(function() {
    const counts = document.querySelectorAll('.experience-block .count');
    
    function animateCount(el) {
        const target = +el.getAttribute('data-target');
        const duration = 2500;
        const startTime = performance.now();
       
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const ease = 1 - Math.pow(2, -10 * progress);
            const currentCount = Math.round(ease * target);
            
            el.innerText = currentCount;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                setTimeout(() => {
                    el.innerText = '0';
                    animateCount(el);
                }, 1500);
            }   
        }
        
        requestAnimationFrame(update);
    }
    
    counts.forEach(animateCount);
})();