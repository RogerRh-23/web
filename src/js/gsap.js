gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  let lastTouchY = 0;

  // Mostrar navbar cuando la imagen principal ya no es visible
  ScrollTrigger.create({
    trigger: '.main-head-img',
    start: 'bottom top', // Cuando la imagen sale de la pantalla
    onEnter: () => {
      const navbar = document.getElementById('navbar-placeholder');
      navbar.classList.remove('hidden');
      navbar.classList.add('visible');
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
      navbar.classList.remove('visible');
      navbar.classList.add('hidden');
      // Animar el logo y contenido al ocultar (más lento)
      const logo = navbar.querySelector('.navbar-brand');
      const navContent = navbar.querySelectorAll('.nav-item, .nav-link, .collapse, .container-fluid, .navbar-nav, .btn-outline-light');
      if (logo) {
        gsap.fromTo(logo, { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.8 });
      }
      if (navContent.length) {
        gsap.fromTo(navContent, { opacity: 1, y: 0 }, { opacity: 0, y: -20, duration: 0.6, stagger: 0.1 });
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

  // Scrollbar personalizada con GSAP
  const scrollbar = document.createElement('div');
  scrollbar.className = 'custom-scrollbar';
  scrollbar.style.opacity = '0.6';
  scrollbar.style.top = '60px'; // Altura debajo de la navbar (ajusta según el alto de tu navbar)
  const thumb = document.createElement('div');
  thumb.className = 'custom-scrollbar-thumb';
  scrollbar.appendChild(thumb);
  document.body.appendChild(scrollbar);

  function updateThumb() {
    const margin = 2; // px
    const scrollbarHeight = scrollbar.offsetHeight;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const thumbHeight = Math.max((scrollbarHeight - 2 * margin) * (window.innerHeight / document.documentElement.scrollHeight), 40);
    let thumbTop = margin + (scrollTop / docHeight) * (scrollbarHeight - thumbHeight - 2 * margin);
    thumb.style.height = thumbHeight + 'px';
    thumb.style.top = thumbTop + 'px';

    // Bounce effect arriba/abajo
    if (scrollTop <= 0) {
      gsap.to(thumb, { y: -6, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" });
    } else if (scrollTop >= docHeight - 2) {
      gsap.to(thumb, { y: 6, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.inOut" });
    } else {
      gsap.to(thumb, { y: 0, duration: 0.18, ease: "power1.inOut" });
    }
  }
  window.addEventListener('scroll', updateThumb);
  window.addEventListener('resize', updateThumb);
  updateThumb();

  thumb.addEventListener('mousedown', function(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startScroll = window.scrollY;
    function onMouseMove(ev) {
      const delta = ev.clientY - startY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const newScroll = startScroll + (delta * (docHeight / (window.innerHeight - thumb.offsetHeight)));
      window.scrollTo(0, newScroll);
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Mostrar/ocultar scrollbar personalizada según scroll
  function toggleScrollbar() {
    const mainImg = document.querySelector('.main-head-img');
    if (!mainImg) return;
    const rect = mainImg.getBoundingClientRect();
    if (rect.bottom <= 60) {
      scrollbar.style.display = 'block';
    } else {
      scrollbar.style.display = 'none';
    }
  }
  window.addEventListener('scroll', toggleScrollbar);
  window.addEventListener('resize', toggleScrollbar);
  toggleScrollbar();

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
});
