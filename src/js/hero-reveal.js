// Animación de hero reveal con GSAP
// Cada corte vertical sube alternadamente al hacer scroll, mostrando el fondo y el logo dividido

document.addEventListener('DOMContentLoaded', () => {
  const rects = Array.from(document.querySelectorAll('.hero-rect'));
  const logo = document.querySelector('.hero-reveal-logo-fixed');
  const arrow = document.getElementById('hero-reveal-arrow');
  const overlay = document.querySelector('.hero-reveal');

  // Inicializar posiciones
  rects.forEach((rect) => {
    gsap.set(rect, { y: 0 });
  });
  if (logo) {
    gsap.set(logo, { y: 0 });
  }

  // Duraciones
  const rectDuration = 1;
  const logoDuration = rectDuration * 0.9;

  // Timeline con pin para la imagen del head
  gsap.timeline({
    scrollTrigger: {
      id: 'hero-reveal-timeline',
      trigger: '.hero-reveal',
      start: 'top top',
      end: '+=100vh',
      scrub: 1,
      pin: '.head-img-container',
      pinSpacing: true,
      onUpdate: self => {
        if (self.progress > 0.05 && arrow) arrow.style.opacity = '0';
      },
      onLeave: () => {
        if (overlay) overlay.style.pointerEvents = 'none';
      }
    }
  })
  .to(logo, {
    y: '-120vh',
    ease: 'power2.inOut',
    duration: logoDuration
  }, 0)
  .to(rects, {
    y: (i) => i % 2 === 0 ? '-120vh' : '-100vh',
    stagger: {
      each: 0.05,
      from: 'edges',
      ease: 'power2.inOut'
    },
    ease: 'power2.inOut',
    duration: rectDuration
  }, logoDuration);

  // Flecha: al hacer click, dispara la animación de logo y rectángulos
  if (arrow) {
    const hideArrow = () => {
      arrow.style.opacity = '0';
      arrow.style.pointerEvents = 'none';
    };
    arrow.addEventListener('click', () => {
      hideArrow();
      gsap.to(logo, {
        y: '-120vh',
        ease: 'power2.inOut',
        duration: logoDuration,
        onComplete: () => {
          logo.style.opacity = '0';
          logo.style.pointerEvents = 'none';
        }
      });
      gsap.to(rects, {
        y: (i) => i % 2 === 0 ? '-120vh' : '-100vh',
        stagger: { each: 0.05, from: 'edges', ease: 'power2.inOut' },
        ease: 'power2.inOut',
        duration: rectDuration,
        delay: logoDuration,
        onStart: () => {
          // Solo elimina el ScrollTrigger del hero reveal y refresca los triggers
          if (window.ScrollTrigger) {
            const st = ScrollTrigger.getById && ScrollTrigger.getById('hero-reveal-timeline');
            if (st) st.kill();
            if (ScrollTrigger.refresh) ScrollTrigger.refresh();
          }
        }
      });
    });
    // Ocultar el botón si el usuario hace scroll hacia abajo
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        hideArrow();
      } else {
        // Mostrar el botón y el logo si los rectángulos y logo están en posición inicial
        const rectsAtTop = rects.every(rect => Math.abs(gsap.getProperty(rect, 'y')) < 1);
        const logoAtTop = logo && Math.abs(gsap.getProperty(logo, 'y')) < 1;
        if (rectsAtTop && logoAtTop) {
          arrow.style.opacity = '1';
          arrow.style.pointerEvents = 'auto';
          logo.style.opacity = '1';
          logo.style.pointerEvents = 'auto';
        }
      }
    });
  }
});
