// navbar-mobile-accordion.js
// Acordeón para los submenús del menú móvil

(function () {
    function setupMobileAccordion() {
        // Solo activar en mobile
        if (window.innerWidth > 991) return;
        const accordions = document.querySelectorAll('.navbar-mobile-accordion');
        accordions.forEach(acc => {
            const header = acc.querySelector('.navbar-mobile-accordion-header');
            if (!header) return;
            // Evitar duplicar listeners
            header.onclick = function () {
                // Cerrar otros
                accordions.forEach(a => { if (a !== acc) a.classList.remove('active'); });
                // Toggle el actual
                acc.classList.toggle('active');
            };
            // Por defecto, todos cerrados
            acc.classList.remove('active');
        });
    }
    // Inicializar acordeón en load y en resize
    setupMobileAccordion();
    window.addEventListener('resize', setupMobileAccordion);
    // Si el menú se recarga dinámicamente, exponer para llamada manual
    window.initNavbarMobileAccordion = setupMobileAccordion;
})();
