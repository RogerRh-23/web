// Transición completa con hero reveal y navbar
function playFullHeroTransition(callback) {
  const hero = document.querySelector('.hero-reveal');
  const rects = Array.from(document.querySelectorAll('.hero-rect'));
  const logo = document.querySelector('.hero-reveal-logo-fixed');
  const navbar = document.querySelector('.navbar-custom');
  // Si la navbar ya está visible y en posición, no hacer animación
  const navVisible = window.getComputedStyle(navbar).opacity === '1' && window.getComputedStyle(navbar).transform === 'none';
  if (navVisible) {
    if (typeof callback === 'function') callback();
    return;
  }
  // 1. Ocultar navbar con animación
  gsap.to(navbar, { y: -120, opacity: 0, duration: 0.4, onComplete: () => {
    // 2. Mover scroll al inicio
    window.scrollTo({ top: 0, behavior: 'auto' });
    // 3. Mostrar hero reveal y preparar animación inversa
    gsap.set(hero, { opacity: 1, display: 'block' });
    gsap.set(rects, { y: (i) => i % 2 === 0 ? '-120vh' : '-100vh' });
    gsap.set(logo, { y: '-120vh', opacity: 1 });
    // 4. Animar hero reveal normal (rectángulos y logo suben)
    gsap.timeline({
      onComplete: () => {
        // 5. Ocultar hero y mostrar navbar con animación
        gsap.to(hero, { opacity: 0, display: 'none', duration: 0.5 });
        gsap.to(navbar, { y: 0, opacity: 1, duration: 0.5, onComplete: () => {
          if (typeof callback === 'function') callback();
        }});
      }
    })
    .to(rects, {
      y: 0,
      stagger: { each: 0.05, from: 'edges', ease: 'power2.inOut' },
      ease: 'power2.inOut',
      duration: 0.7
    }, 0)
    .to(logo, {
      y: 0,
      ease: 'power2.inOut',
      duration: 0.6
    }, 0.1);
  }});
}

// Enlazar los botones de certificados, contacto e inicio para la transición
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const certificados = document.querySelector('.nav-link[href*="certificados.html"]');
    const contacto = document.querySelector('.nav-link[href*="contacto.html"]');
    const inicio = document.querySelector('.nav-link.active[aria-current="page"]');
    if (certificados) {
      certificados.addEventListener('click', function(e) {
        e.preventDefault();
        playFullHeroTransition(() => {
          document.querySelector('.head-img-container').style.display = 'none';
          document.getElementById('cards').style.display = 'none';
          document.getElementById('dynamic-content').style.display = 'block';
          fetch('./components/certificados.html')
            .then(res => res.text())
            .then(html => {
              document.getElementById('dynamic-content').innerHTML = html;
            });
        });
      });
    }
    if (contacto) {
      contacto.addEventListener('click', function(e) {
        e.preventDefault();
        playFullHeroTransition(() => {
          document.querySelector('.head-img-container').style.display = 'none';
          document.getElementById('cards').style.display = 'none';
          document.getElementById('dynamic-content').style.display = 'block';
          fetch('./components/contacto.html')
            .then(res => res.text())
            .then(html => {
              document.getElementById('dynamic-content').innerHTML = html;
            });
        });
      });
    }
    if (inicio) {
      inicio.addEventListener('click', function(e) {
        e.preventDefault();
        playFullHeroTransition(() => {
          document.querySelector('.head-img-container').style.display = '';
          document.getElementById('cards').style.display = '';
          document.getElementById('dynamic-content').style.display = 'none';
          document.getElementById('dynamic-content').innerHTML = '';
        });
      });
    }
  }, 100);
});
