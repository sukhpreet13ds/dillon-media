(function () {
    'use strict';

    const themeToggles = document.querySelectorAll('.dm-theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    const updateLogos = (theme) => {
        const logoSrc = theme === 'light' ? 'assets/logo-light.png' : 'assets/dillon-logo.png';
        const selectors = [
            '.dm-mobile-header__logo img',
            '.dm-mobile-menu__logo img',
            '.dm-logo-img',
            '.dm-footer__logo img'
        ];
        selectors.forEach(selector => {
            const img = document.querySelector(selector);
            if (img) img.src = logoSrc;
        });
    };

    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateLogos('light');
    }

    if (themeToggles.length > 0) {
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                const newTheme = isLight ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateLogos(newTheme);
            });
        });
    }
})();
