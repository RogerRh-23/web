// footer.js
// Acordeón para las opciones del footer en mobile

document.addEventListener('DOMContentLoaded', function() {
  function isMobileFooter() {
    return window.innerWidth <= 575;
  }

  function setupFooterAccordion() {
    // Solo activar en mobile
    if (!isMobileFooter()) return;
    const cols = document.querySelectorAll('.footer-options-col');
    cols.forEach(col => {
      const h3 = col.querySelector('h3');
      if (!h3) return;
      // Evitar duplicar listeners
      h3.onclick = function() {
        // Cerrar otros
        cols.forEach(c => { if (c !== col) c.classList.remove('active'); });
        // Toggle el actual
        col.classList.toggle('active');
      };
      // Por defecto, todos cerrados
      col.classList.remove('active');
    });
  }

  // Inicializar acordeón en load y en resize
  setupFooterAccordion();
  window.addEventListener('resize', setupFooterAccordion);
});
