try {
    var hasScrollTrigger = (typeof window !== 'undefined' && window && window.ScrollTrigger) ? true : false;
    var hasGsap = (typeof window !== 'undefined' && window && window.gsap) ? true : false;
    if (hasScrollTrigger && hasGsap && typeof window.gsap.registerPlugin === 'function') {
        window.gsap.registerPlugin(window.ScrollTrigger);
    } else {
        console.warn('[gsap] ScrollTrigger plugin not available at init time. Skipping registerPlugin.');
    }
} catch (e) {
    console.warn('[gsap] Error registering ScrollTrigger plugin:', e);
}

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
