

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

