gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  let lastTouchY = 0;

  // Mostrar navbar cuando la imagen principal ya no es visible
  ScrollTrigger.create({
    trigger: '.main-head-img',
    start: 'top top-=250',
    onEnter: () => {
      const navbar = document.getElementById('navbar-placeholder');
      navbar.classList.remove('preload');
      navbar.classList.remove('hidden');
      navbar.classList.add('visible');
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
    onLeaveBack: () => {
      const navbar = document.getElementById('navbar-placeholder');
      const navBg = navbar.querySelector('.navbar-custom');
      const logo = navbar.querySelector('.navbar-brand');
      const navContent = navbar.querySelectorAll('.nav-item, .nav-link, .collapse, .container-fluid, .navbar-nav, .btn-outline-light');
      // Animar salida de background, logo y contenido
      const tl = gsap.timeline({
        onComplete: () => {
          navbar.classList.remove('visible');
          navbar.classList.add('hidden');
        }
      });
      if (navBg) {
        tl.to(
          navBg,
          {
            backgroundColor: 'rgba(20,50,63,0)',
            duration: 0.6,
            ease: 'power2.in'
          },
          0
        );
      }
      if (logo) {
        tl.to(logo, { opacity: 0, y: -40, duration: 0.6 }, 0);
      }
      if (navContent.length) {
        tl.to(navContent, { opacity: 0, y: -20, duration: 0.5, stagger: 0.08 }, 0.1);
      }
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


  // Permitir scroll con rueda del ratón, touchpad y dispositivos móviles
  function customScroll(e) {
    // Solo si la scrollbar personalizada está visible
    if (scrollbar.style.display !== 'block') return;
    let delta = 0;
    if (e.type === 'wheel') {
      delta = e.deltaY;
    } else if (e.type === 'touchmove') {
      if (e.touches.length === 1) {
        delta = lastTouchY - e.touches[0].clientY;
        lastTouchY = e.touches[0].clientY;
      }
    }
    window.scrollBy(0, delta);
  }

  // Mouse wheel
  window.addEventListener('wheel', customScroll, { passive: false });

  // Touchpad y dispositivos móviles
  window.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      lastTouchY = e.touches[0].clientY;
    }
  }, { passive: false });
  window.addEventListener('touchmove', customScroll, { passive: false });

  // Animación SVG y path eliminados
});
