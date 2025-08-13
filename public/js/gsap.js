gsap.registerPlugin(ScrollTrigger);

// Forzar inicialización de scrollbar personalizada en desktop
function forceCustomScrollbar() {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.documentElement.style.overflowY = 'scroll';
        document.body.style.overflowY = 'scroll';
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        // Forzar ancho de la scrollbar si se usa variable
        document.documentElement.style.setProperty('--custom-scrollbar-width', '14px');
        document.body.style.setProperty('--custom-scrollbar-width', '14px');
        // Forzar visibilidad en Chrome/Safari/Edge
        document.documentElement.style.setProperty('scrollbarWidth', 'auto');
        document.body.style.setProperty('scrollbarWidth', 'auto');
    }
}

document.addEventListener('DOMContentLoaded', forceCustomScrollbar);
window.addEventListener('resize', forceCustomScrollbar);
// También fuerza la visibilidad si el usuario interactúa
window.addEventListener('mousemove', forceCustomScrollbar);
window.addEventListener('wheel', forceCustomScrollbar);
window.addEventListener('scroll', forceCustomScrollbar);
