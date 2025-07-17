// Dropdown animado con GSAP para la opción "Servicios"
document.addEventListener('DOMContentLoaded', () => {
  // Buscar el enlace de Servicios por texto
  // Espera a que la navbar esté en el DOM si se carga dinámicamente
  function getServiciosLink() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    for (let link of navLinks) {
      if (link.textContent.trim().includes('Servicios')) {
        // Cambia el href para evitar navegación
        link.setAttribute('href', 'javascript:void(0)');
        return link;
      }
    }
    return null;
  }
  let serviciosItem = getServiciosLink();
  if (!serviciosItem) {
    // Si no está, espera a que se cargue la navbar
    const observer = new MutationObserver(() => {
      serviciosItem = getServiciosLink();
      if (serviciosItem) {
        observer.disconnect();
        inicializarDropdown();
      }
    });
    observer.observe(document.getElementById('navbar-placeholder'), { childList: true, subtree: true });
    return;
  }

  inicializarDropdown();

  function inicializarDropdown() {

    // Crear el contenedor y el dropdown como elemento flotante fuera de la navbar
    let dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown-gsap-container';
    let dropdown = document.createElement('ul');
    dropdown.className = 'dropdown-gsap';
    dropdown.innerHTML = `
      <li><a href="#">Consultoría</a></li>
      <li><a href="#">Capacitación</a></li>
      <li><a href="#">Soporte</a></li>
    `;
    dropdownContainer.appendChild(dropdown);
    document.body.appendChild(dropdownContainer);
    gsap.set(dropdownContainer, { height: 0, opacity: 0, display: 'none' });

    let open = false;
    serviciosItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      open = !open;
      if (open) {
        // Calcula la posición del enlace Servicios
        const rect = serviciosItem.getBoundingClientRect();
        dropdownContainer.style.position = 'fixed';
        dropdownContainer.style.left = rect.left + 'px';
        dropdownContainer.style.top = (rect.bottom + 2) + 'px';
        dropdownContainer.style.minWidth = rect.width + 'px';
        dropdownContainer.style.display = 'block';
        gsap.to(dropdownContainer, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(dropdownContainer, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
          dropdownContainer.style.display = 'none';
        }});
      }
    });
    // Evita que el click en el dropdown cierre el menú inmediatamente
    dropdownContainer.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    // Cierra el dropdown si se hace click fuera
    document.addEventListener('click', function(e) {
      if (!serviciosItem.contains(e.target) && !dropdownContainer.contains(e.target)) {
        if (open) {
          open = false;
          gsap.to(dropdownContainer, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => {
            dropdownContainer.style.display = 'none';
          }});
        }
      }
    });
  }
});
