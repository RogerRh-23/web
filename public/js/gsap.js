gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  let lastTouchY = 0;
  let navbarShown = false;
  // Mostrar navbar cuando la imagen principal ya no es visible
  ScrollTrigger.create({
    trigger: '.main-head-img',
    start: 'top top-=250',
    onEnter: () => {
      const navbar = document.getElementById('navbar-placeholder');
      navbar.classList.remove('preload');
      navbar.classList.remove('hidden');
      navbar.classList.add('visible');
      navbarShown = true;
      // Animar el background de la navbar
      const navBg = navbar.querySelector('.navbar-custom');
      if (navBg) {
        gsap.fromTo(
          navBg,
          { backgroundColor: 'rgba(20,50,63,0)' },
          {
            backgroundColor: 'rgba(20,50,63,1)',
            duration: 0.7,
            ease: 'power2.out'
          }
        );
      }
      // Animar el logo primero
      const logo = navbar.querySelector('.navbar-brand');
      const navContent = navbar.querySelectorAll('.nav-item, .nav-link, .collapse, .container-fluid, .navbar-nav, .btn-outline-light');
      if (logo) {
        gsap.fromTo(logo, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 });
      }
      if (navContent.length) {
        gsap.fromTo(navContent, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.7 });
      }
    },
    onLeave: () => {
      // Ocultar navbar al salir hacia abajo SOLO si no se ha mostrado antes
      if (!navbarShown) {
        const navbar = document.getElementById('navbar-placeholder');
        navbar.classList.remove('visible');
        navbar.classList.add('hidden');
      }
    },
    onLeaveBack: () => {
      // Ya no ocultar la navbar al regresar a la altura
      // (No hacer nada)
    }
  });

  gsap.utils.toArray('.section-gsap').forEach(section => {
    gsap.fromTo(section,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Mouse wheel
  // Touchpad y dispositivos móviles
  window.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: false });
  // Animación SVG y path eliminados
});
