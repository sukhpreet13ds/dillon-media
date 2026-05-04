

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
            const href = this.getAttribute('href');
            if (href === '#' || href === 'javascript:void(0)') {
                e.preventDefault();
            }
            
            /* Remove active from all */
            document.querySelectorAll('.dm-nav__item').forEach(li => {
                li.classList.remove('dm-nav__item--active');
            });
            /* Add to clicked */
            const parentItem = this.closest('.dm-nav__item');
            if (parentItem) parentItem.classList.add('dm-nav__item--active');

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

/* ── Awards Timeline Auto-scroll & Drag ── */
(function() {
    'use strict';
    
    const slider = document.querySelector('.dm-awards__timeline');
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let isHovered = false;
    let autoScrollRequest;
    const scrollSpeed = 0.6; // Pixels per frame

    const isDesktop = () => window.innerWidth > 1024;

    function startAutoScroll() {
        if (!autoScrollRequest && isDesktop()) {
            autoScrollRequest = requestAnimationFrame(step);
        }
    }

    function stopAutoScroll() {
        if (autoScrollRequest) {
            cancelAnimationFrame(autoScrollRequest);
            autoScrollRequest = null;
        }
    }

    function step() {
        if (isDesktop() && !isDown && !isHovered) {
            slider.scrollLeft += scrollSpeed;
            
            // Loop back to start when reaching the end
            if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 1) {
                slider.scrollLeft = 0;
            }
        }
        autoScrollRequest = requestAnimationFrame(step);
    }

    // Drag events
    slider.addEventListener('mousedown', (e) => {
        if (!isDesktop()) return;
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        stopAutoScroll();
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        isHovered = false;
        slider.classList.remove('active');
        startAutoScroll();
    });

    slider.addEventListener('mouseenter', () => {
        isHovered = true;
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
        startAutoScroll();
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown || !isDesktop()) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; 
        slider.scrollLeft = scrollLeft - walk;
    });

    // Intersection Observer to run only when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && isDesktop()) {
                startAutoScroll();
            } else {
                stopAutoScroll();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(slider);

    // Resize handler to toggle auto-scroll based on viewport
    window.addEventListener('resize', () => {
        if (!isDesktop()) {
            stopAutoScroll();
        } else {
            const rect = slider.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                startAutoScroll();
            }
        }
    });
})();

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




const wordsList = document.querySelectorAll('.dm-work__text-word');
if (wordsList.length > 0) {
    let wordIndex = 0;
    setInterval(() => {
        wordsList[wordIndex].classList.remove('active');
        wordIndex = (wordIndex + 1) % wordsList.length;
        wordsList[wordIndex].classList.add('active');
    }, 1500);
}

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

/* ── Process Section Animation ── */
(function() {
    'use strict';

    const processSection = document.querySelector('.dm-process');
    const steps = document.querySelectorAll('.dm-process__step');
    const lineProgress = document.querySelector('.dm-process__line-progress');

    if (!processSection || !lineProgress) return;

    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate the line
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    lineProgress.style.height = '100%';
                } else {
                    lineProgress.style.width = '100%';
                }

                // Animate the steps
                steps.forEach(step => {
                    step.classList.add('is-visible');
                });

                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(processSection);
})();

/* ── Video 2 Section Carousel & Autoplay ── */
(function() {
    'use strict';
    
    const section = document.getElementById('dm-video2-section');
    const mainIframe = document.getElementById('dm-video2-main-iframe');
    const track = document.getElementById('dm-video2-track');
    const items = document.querySelectorAll('.dm-video2-item');
    const prevBtn = document.getElementById('dm-video2-prev');
    const nextBtn = document.getElementById('dm-video2-next');
    
    if (!section || !mainIframe || !track) return;
    
    let currentIndex = 0;
    const totalItems = items.length;
    
    function getVisibleCount() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 4;
    }
    
    function updateCarousel() {
        if (!track || !items.length) return;

        const isDesktop = window.innerWidth > 1024;
        const visibleCount = getVisibleCount();
        const gap = isDesktop ? 10 : 24;
        const container = track.parentElement;
        
        // Ensure currentIndex is within bounds
        if (currentIndex > totalItems - visibleCount) {
            currentIndex = Math.max(0, totalItems - visibleCount);
        }
        if (currentIndex < 0) currentIndex = 0;

        if (isDesktop) {
            // Vertical layout for desktop
            items.forEach(item => {
                item.style.flex = '0 0 auto';
                item.style.width = '100%';
            });
            
            const firstItem = items[0];
            const itemHeight = firstItem ? firstItem.getBoundingClientRect().height : 0;
            const offset = currentIndex * (itemHeight + gap);
            track.style.transform = `translateY(-${offset}px)`;
        } else {
            // Horizontal layout for mobile/tablet
            const containerWidth = container ? container.offsetWidth : 0;
            const itemWidth = (containerWidth - (gap * (visibleCount - 1))) / visibleCount;
            
            items.forEach(item => {
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.width = ''; 
            });

            const offset = currentIndex * (itemWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
        }

        // Update arrows visibility
        if (prevBtn) {
            currentIndex <= 0 ? prevBtn.classList.add('hidden') : prevBtn.classList.remove('hidden');
        }
        if (nextBtn) {
            currentIndex >= totalItems - visibleCount ? nextBtn.classList.add('hidden') : nextBtn.classList.remove('hidden');
        }

        // Ensure main video is loaded if it's blank and we're in view
        if (mainIframe && (!mainIframe.src || mainIframe.src.includes('about:blank'))) {
             const activeItem = document.querySelector('.dm-video2-item.active') || items[0];
             if (activeItem) mainIframe.src = activeItem.getAttribute('data-video');
        }
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const visibleCount = getVisibleCount();
            if (currentIndex < totalItems - visibleCount) {
                currentIndex++;
                updateCarousel();
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }
    
    items.forEach(item => {
        item.addEventListener('click', () => {
            const videoUrl = item.getAttribute('data-video');
            if (mainIframe.src !== videoUrl) {
                mainIframe.src = videoUrl;
            }
            
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Autoplay when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateCarousel(); // Force update and load video
                observer.unobserve(section);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(section);
    
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateCarousel, 150);
    });
    
    // Initial call after a short delay to ensure DOM and styles are ready
    window.addEventListener('load', () => {
        setTimeout(updateCarousel, 300);
    });
    // Also call immediately just in case
    setTimeout(updateCarousel, 500);
})();

/* ── Section Reveal Animations ── */
(function() {
    'use strict';

    const observerOptions = {
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const diffSection = document.querySelector('.dm-diff');
    if (diffSection) observer.observe(diffSection);

    const blogSection = document.querySelector('.dm-blog');
    if (blogSection) observer.observe(blogSection);

    const ctaSection = document.querySelector('.dm-cta');
    if (ctaSection) observer.observe(ctaSection);
})();

/* ── About Page Story Reveal & Thread Animation ── */
(function() {
    'use strict';

    const reveals = document.querySelectorAll('[data-reveal]');
    const threadLine = document.querySelector('.dm-values-thread-line');
    const valuesSection = document.querySelector('.dm-about-values');

    if (!reveals.length) return;

    // Intersection Observer for generic reveals
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObserver.observe(el));

    // Scroll listener for thread growth
    if (threadLine && valuesSection) {
        window.addEventListener('scroll', () => {
            const rect = valuesSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how much of the section is visible
            // 0 when top enters, 1 when bottom enters/passes
            const start = rect.top;
            const end = rect.bottom;
            
            if (start < windowHeight && end > 0) {
                const totalHeight = rect.height;
                const visiblePart = windowHeight - start;
                let progress = (visiblePart / totalHeight) * 100;
                
                // Clamp between 0 and 100
                progress = Math.max(0, Math.min(100, progress));
                threadLine.style.height = progress + '%';
            }
        });
    }
})();

/* ── Video Modal Logic ── */
(function() {
    'use strict';

    const modal = document.getElementById('dm-video-modal');
    const openBtn = document.getElementById('dm-video-modal-open');
    const closeBtn = document.getElementById('dm-video-modal-close');
    const btnClose = document.getElementById('dm-video-modal-btn-close');
    const iframe = document.getElementById('dm-modal-iframe');

    if (!modal || !openBtn) return;

    const showreelUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Placeholder URL

    openBtn.addEventListener('click', () => {
        modal.classList.add('is-open');
        iframe.src = showreelUrl;
        document.body.style.overflow = 'hidden';
    });

    const closeModal = () => {
        modal.classList.remove('is-open');
        iframe.src = "";
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);

    // Escape key to close
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();

/* ── Video Production Slider ── */
(function() {
    'use strict';

    const slider = document.getElementById('dm-video-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.dm-video-slide');
    const prevBtn = document.getElementById('video-slide-prev');
    const nextBtn = document.getElementById('video-slide-next');
    const dotsContainer = document.getElementById('video-slide-dots');
    
    let currentIndex = 0;
    let autoSlideInterval;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dm-video-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dm-video-dot');

    function updateSlider() {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
            dots[index].classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoSlide();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    startAutoSlide();
})();




const iframe = document.querySelector('.dm-work__video-wrapper iframe');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // reload iframe to force autoplay
            iframe.src = iframe.src;
        }
    });
}, {
    threshold: 0.5 // play when 50% visible
});

if (iframe) observer.observe(iframe);

/* ── FAQ Accordion + Search + Category Filter ── */
(function () {
    'use strict';

    const faqList      = document.getElementById('faq-list');
    const searchInput  = document.getElementById('faq-search-input');
    const searchClear  = document.getElementById('faq-search-clear');
    const catBtns      = document.querySelectorAll('.faq-cat-btn');
    const noResults    = document.getElementById('faq-no-results');

    if (!faqList) return;

    const items = Array.from(faqList.querySelectorAll('.faq-item'));
    let activeCategory = 'all';
    let searchQuery    = '';

    /* ── Accordion ── */
    items.forEach(item => {
        const trigger = item.querySelector('.faq-item__trigger');
        const body    = item.querySelector('.faq-item__body');

        trigger.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all open items first
            items.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
                const b = i.querySelector('.faq-item__body');
                b.style.maxHeight = '0px';
            });

            // Open clicked if it was closed
            if (!isOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    /* ── Filter logic ── */
    function applyFilter() {
        const q = searchQuery.toLowerCase().trim();
        let visibleCount = 0;

        items.forEach(item => {
            const cat  = item.getAttribute('data-cat') || '';
            const tags = item.getAttribute('data-tags') || '';
            const question = item.querySelector('.faq-item__question');
            const qText = question ? question.textContent.toLowerCase() : '';

            const catMatch = activeCategory === 'all' || cat === activeCategory;
            const searchMatch = q === '' || qText.includes(q) || tags.toLowerCase().includes(q);

            if (catMatch && searchMatch) {
                item.classList.remove('is-hidden');
                visibleCount++;
            } else {
                item.classList.add('is-hidden');
                // Also close hidden items
                item.classList.remove('is-open');
                item.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
                item.querySelector('.faq-item__body').style.maxHeight = '0px';
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    /* ── Category buttons ── */
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-cat');
            applyFilter();
        });
    });

    /* ── Search input ── */
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value;
            if (searchClear) {
                searchClear.classList.toggle('is-visible', searchQuery.length > 0);
            }
            applyFilter();
        });
    }

    /* ── Clear button ── */
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClear.classList.remove('is-visible');
            applyFilter();
            searchInput.focus();
        });
    }

    // Initial filter pass
    applyFilter();
})();