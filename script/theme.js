(function () {
    'use strict';

    const themeToggles = document.querySelectorAll('.dm-theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    const updateLogos = (theme) => {

        const path = window.location.pathname;

        // Pages inside folders like /authors/ or /blogs/
        const isNestedPage =
            path.includes('/authors/') ||
            path.includes('/blogs/');

        const logoSrc = theme === 'light'
            ? (isNestedPage
                ? '../assets/logo-light.png'
                : 'assets/logo-light.png')
            : (isNestedPage
                ? '../assets/dillon-logo.png'
                : 'assets/dillon-logo.png');

        const selectors = [
            '.dm-mobile-header__logo img',
            '.dm-mobile-menu__logo img',
            '.dm-logo-img',
            '.dm-footer__logo img'
        ];

        selectors.forEach(selector => {
            const img = document.querySelector(selector);
            if (img) {
                img.src = logoSrc;
            }
        });
    };

    // Initial Theme Load
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    updateLogos(currentTheme);

    // Theme Toggle
    if (themeToggles.length > 0) {
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {

                const isLight =
                    document.documentElement.getAttribute('data-theme') === 'light';

                const newTheme = isLight ? 'dark' : 'light';

                document.documentElement.setAttribute('data-theme', newTheme);

                localStorage.setItem('theme', newTheme);

                updateLogos(newTheme);
            });
        });
    }

})();