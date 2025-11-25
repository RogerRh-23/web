// Mostrar el enlace al panel dev si el usuario es dev
window.showDevPanelLinkIfDevMobile = function () {
    try {
        var devLink = document.getElementById('dev-panel-link-mobile');
        if (!devLink) {
            // Elemento no presente en esta página/plantilla
            return;
        }
        try {
            var userStr = localStorage.getItem('user');
            var user = userStr ? JSON.parse(userStr) : null;
            var isDev = false;
            if (user) {
                if (user.role === 'dev') isDev = true;
                if (user.user && user.user.role === 'dev') isDev = true;
            }
            if (devLink && devLink.style) {
                if (isDev) {
                    devLink.style.display = '';
                    console.log('[Navbar-Mobile] Dev panel link shown.');
                } else {
                    devLink.style.display = 'none';
                    console.log('[Navbar-Mobile] Dev panel link hidden.');
                }
            }
        } catch (e) {
            if (devLink && devLink.style) {
                devLink.style.display = 'none';
            }
            console.log('[Navbar-Mobile] Error parsing user from localStorage:', e);
        }
    } catch (outerErr) {
        console.log('[Navbar-Mobile] showDevPanelLinkIfDevMobile unexpected error:', outerErr);
    }
}
// Ejecutar también cuando el navbar se inserta dinámicamente
window.runDevPanelMobileCheck = function () {
    if (typeof window.showDevPanelLinkIfDevMobile === 'function') {
        try {
            window.showDevPanelLinkIfDevMobile();
        } catch (e) {
            console.log('[navbar-mobile] runDevPanelMobileCheck caught error from showDevPanelLinkIfDevMobile', e);
        }
    }
};
document.addEventListener('DOMContentLoaded', window.runDevPanelMobileCheck);
// Si el navbar se carga por fetch, llama window.runDevPanelMobileCheck() después de insertar el HTML

(function () {
    // Mostrar/ocultar el menú debajo de los iconos al hacer click en el botón de menú
    function setupMobileMenuDropdown() {
        var menuBtn = document.querySelector('.navbar-mobile-menu');
        var iconsBar = document.querySelector('.navbar-mobile-icons');
        var dropdownMenu = document.querySelector('.navbar-mobile-dropdown-menu');
        if (!menuBtn || !iconsBar || !dropdownMenu) {
            console.log('[navbar-mobile] Elementos clave no encontrados');
            return;
        }
        // Forzar pointer-events solo por JS para evitar problemas de CSS heredado
        menuBtn.style.pointerEvents = 'auto';
        var iconText = menuBtn.querySelector('.navbar-mobile-icon-text');
        if (iconText) iconText.style.pointerEvents = 'auto';
        var text = menuBtn.querySelector('.navbar-mobile-text');
        if (text) text.style.pointerEvents = 'auto';

        // Elimina listeners previos
        menuBtn.onclick = null;
        menuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var expanded = dropdownMenu.classList.toggle('expanded');
            iconsBar.classList.toggle('move-up', expanded);
            menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            // Ajustar altura al abrir/cerrar
            adjustNavbarMobileHeight();
        });
        // Cerrar al hacer click fuera
        document.addEventListener('click', function closeMenu(e) {
            if (!dropdownMenu.classList.contains('expanded')) return;
            if (!dropdownMenu.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
                dropdownMenu.classList.remove('expanded');
                iconsBar.classList.remove('move-up');
                menuBtn.setAttribute('aria-expanded', 'false');
                // Limpiar altura al cerrar
                adjustNavbarMobileHeight();
            }
        });
    }

    // Acordeón para idioma y submenús
    function setupMobileAccordion() {
        if (window.innerWidth > 991) return;
        const accordions = document.querySelectorAll('.navbar-mobile-accordion');
        const navbarMobile = document.querySelector('.navbar-mobile');
        const iconsBar = document.querySelector('.navbar-mobile-icons');
        const dropdownMenu = document.querySelector('.navbar-mobile-dropdown-menu');
        accordions.forEach(acc => {
            const header = acc.querySelector('.navbar-mobile-accordion-header');
            if (!header) return;
            // Elimina listeners previos
            header.onclick = null;
            header.onclick = function () {
                accordions.forEach(a => { if (a !== acc) a.classList.remove('active'); });
                acc.classList.toggle('active');
                setTimeout(adjustNavbarMobileHeight, 10); // Espera animación CSS si existe
            };
            acc.classList.remove('active');
        });
        // Ajustar altura al inicio
        setTimeout(adjustNavbarMobileHeight, 10);

        function adjustNavbarMobileHeight() {
            if (!navbarMobile) return;
            if (!dropdownMenu || !iconsBar) return;
            if (!dropdownMenu.classList.contains('expanded')) {
                navbarMobile.style.height = '';
                return;
            }
            // Suma la altura de los hijos visibles del dropdown
            let dropdownHeight = 0;
            Array.from(dropdownMenu.children).forEach(child => {
                if (child.offsetParent !== null) {
                    dropdownHeight += child.offsetHeight;
                }
            });
            // Suma la altura de la barra de iconos
            const iconsBarHeight = iconsBar.offsetHeight;
            // Ajusta la altura del contenedor principal
            navbarMobile.style.height = (dropdownHeight + iconsBarHeight) + 'px';
        }

        // Ajustar altura al contraer/expandir acordeones por transición CSS
        accordions.forEach(acc => {
            acc.addEventListener('transitionend', function (e) {
                if (e.propertyName === 'max-height' || e.propertyName === 'height') {
                    adjustNavbarMobileHeight();
                }
            });
        });
        // Hacer la función accesible globalmente para el dropdown
        window.adjustNavbarMobileHeight = adjustNavbarMobileHeight;
    }

    // Cambio de idioma
    function setupLangSwitch() {
        document.querySelectorAll('.lang-option').forEach(function (btn) {
            btn.onclick = null;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var lang = btn.getAttribute('data-lang');
                if (window.i18next && typeof window.i18next.changeLanguage === 'function') {
                    window.i18next.changeLanguage(lang, function () {
                        if (window.updateI18nContent) window.updateI18nContent();
                        if (window.updateLangBtnAll) window.updateLangBtnAll();
                    });
                } else if (window.changeLanguage) {
                    window.changeLanguage(lang);
                }
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

// Wrap existing function with a safety wrapper in case older references execute before this file fully loads
try {
    if (window && typeof window.showDevPanelLinkIfDevMobile === 'function') {
        if (!window._safe_showDevPanelLinkIfDevMobile) {
            window._orig_showDevPanelLinkIfDevMobile = window.showDevPanelLinkIfDevMobile;
            window.showDevPanelLinkIfDevMobile = function () {
                try {
                    return window._orig_showDevPanelLinkIfDevMobile();
                } catch (e) {
                    console.log('[navbar-mobile] safe wrapper caught error in showDevPanelLinkIfDevMobile', e);
                    return;
                }
            };
            window._safe_showDevPanelLinkIfDevMobile = true;
        }
    }
} catch (e) {
    console.log('[navbar-mobile] error installing safe wrapper for showDevPanelLinkIfDevMobile', e);
}
