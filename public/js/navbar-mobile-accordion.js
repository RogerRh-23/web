
(function () {
    // Mostrar/ocultar el menú debajo de los iconos al hacer click en el botón de menú
    function setupMobileMenuDropdown() {
        var menuBtn = document.querySelector('.navbar-mobile-menu');
        if (!menuBtn) {
            console.log('[navbar-mobile] Botón de menú NO encontrado');
            return;
        }
        console.log('[navbar-mobile] Botón de menú encontrado:', menuBtn);
        // Forzar pointer-events solo por JS para evitar problemas de CSS heredado
        menuBtn.style.pointerEvents = 'auto';
        var iconText = menuBtn.querySelector('.navbar-mobile-icon-text');
        if (iconText) iconText.style.pointerEvents = 'auto';
        var text = menuBtn.querySelector('.navbar-mobile-text');
        if (text) text.style.pointerEvents = 'auto';

        // Ahora el menú está fuera, lo buscamos globalmente
        var dropdownMenu = document.querySelector('.navbar-mobile-dropdown-menu');
        if (!dropdownMenu) {
            console.log('[navbar-mobile] Menú desplegable NO encontrado');
            return;
        }
        console.log('[navbar-mobile] Menú desplegable encontrado:', dropdownMenu);
        // Elimina listeners previos
        menuBtn.onclick = null;
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var expanded = dropdownMenu.classList.toggle('expanded');
            menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            console.log('[navbar-mobile] Click en menú. expanded:', expanded);
        });
        // Cerrar al hacer click fuera
        document.addEventListener('click', function closeMenu(e) {
            if (!dropdownMenu.classList.contains('expanded')) return;
            if (!dropdownMenu.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
                dropdownMenu.classList.remove('expanded');
                menuBtn.setAttribute('aria-expanded', 'false');
                console.log('[navbar-mobile] Click fuera, menú cerrado');
            }
        });
    }

    // Acordeón para idioma y submenús
    function setupMobileAccordion() {
        if (window.innerWidth > 991) return;
        const accordions = document.querySelectorAll('.navbar-mobile-accordion');
        accordions.forEach(acc => {
            const header = acc.querySelector('.navbar-mobile-accordion-header');
            if (!header) return;
            // Elimina listeners previos
            header.onclick = null;
            header.onclick = function () {
                accordions.forEach(a => { if (a !== acc) a.classList.remove('active'); });
                acc.classList.toggle('active');
            };
            acc.classList.remove('active');
        });
    }

    // Cambio de idioma
    function setupLangSwitch() {
        document.querySelectorAll('.lang-option').forEach(function (btn) {
            btn.onclick = null;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var lang = btn.getAttribute('data-lang');
                if (window.changeLanguage) window.changeLanguage(lang);
            });
        });
    }

    // Inicializar todo solo cuando el DOM esté listo
    function init() {
        setupMobileMenuDropdown();
        setupMobileAccordion();
        setupLangSwitch();
    }
    function waitForNavbarMobile(retries = 30) {
        if (document.querySelector('.navbar-mobile-menu')) {
            init();
        } else if (retries > 0) {
            setTimeout(function () { waitForNavbarMobile(retries - 1); }, 100);
        } else {
            console.log('[navbar-mobile] Botón de menú NO encontrado tras esperar');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { waitForNavbarMobile(); });
    } else {
        waitForNavbarMobile();
    }
    window.addEventListener('resize', setupMobileAccordion);
    window.initNavbarMobileAccordion = setupMobileAccordion;
})();
