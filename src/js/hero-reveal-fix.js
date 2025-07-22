// Fix: Arrow reappears if user scrolls up, and logo/rect slices fill perfectly, logo centered

document.addEventListener('DOMContentLoaded', () => {
  const arrow = document.getElementById('hero-reveal-arrow');
  const overlay = document.querySelector('.hero-reveal');
  let lastScroll = 0;

  // Show/hide arrow on scroll up/down
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 0.2 && arrow) {
      arrow.style.opacity = '1';
      arrow.style.pointerEvents = 'auto';
    }
    lastScroll = y;
  });

  // Mostrar navbar-mobile tras ocultar el hero
  if (arrow && overlay) {
    arrow.addEventListener('click', () => {
      // Esperar a que el hero desaparezca (puedes ajustar el timeout según la animación)
      setTimeout(() => {
        if (typeof loadNavbarMobile === 'function') {
          loadNavbarMobile();
        } else if (window.loadNavbarMobile) {
          window.loadNavbarMobile();
        }
      }, 600); // Ajusta el tiempo si tu animación dura más/menos
    });
  }

  // Ensure slices fill perfectly and logo is centered (force redraw)
  function fixSlices() {
    const logoSlices = Array.from(document.querySelectorAll('.hero-logo-slice'));
    const logoImg = document.querySelector('.hero-logo-img');
    if (!logoImg) return;
    const logoW = logoImg.naturalWidth;
    logoSlices.forEach((slice, i) => {
      slice.style.width = (100 / logoSlices.length) + '%';
      slice.style.minWidth = '0';
      slice.style.overflow = 'hidden';
      // Each img inside slice
      const img = slice.querySelector('img');
      if (img) {
        img.style.objectFit = 'cover';
        img.style.width = (logoSlices.length * 100) + '%';
        img.style.height = '100%';
        img.style.transform = `translateX(-${i * 100}%)`;
      }
    });
  }
  window.addEventListener('resize', fixSlices);
  setTimeout(fixSlices, 200);
});
