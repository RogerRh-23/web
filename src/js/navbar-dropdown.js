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
    // Mejorar área de hover: mostrar dropdown si el mouse está sobre el enlace o el dropdown
    function isHovering(e) {
      return serviciosItem.matches(':hover') || dropdownContainer.matches(':hover');
    }
    let hoverTimeout;
    function showDropdown() {
      if (!open) {
        open = true;
        // Calcula la posición del enlace Servicios y la navbar
        const rect = serviciosItem.getBoundingClientRect();
        const navbar = document.querySelector('.navbar-custom');
        let top = rect.bottom + 2;
        if (navbar) {
          const navbarRect = navbar.getBoundingClientRect();
          top = navbarRect.bottom;
        }
        dropdownContainer.style.position = 'fixed';
        dropdownContainer.style.left = rect.left + 'px';
        dropdownContainer.style.top = top + 'px';
        dropdownContainer.style.minWidth = rect.width + 'px';
        dropdownContainer.style.display = 'block';
        gsap.fromTo(
          dropdownContainer,
          { x: -40, opacity: 0, rotateY: -70, height: 0 },
          { x: 0, opacity: 1, rotateY: 0, height: 'auto', duration: 0.48, ease: 'power2.out', transformOrigin: 'left center' }
        );
      }
    }
    function closeDropdown() {
      if (open) {
        open = false;
        gsap.to(dropdownContainer, {
          x: -40,
          opacity: 0,
          rotateY: -70,
          height: 0,
          duration: 0.32,
          ease: 'power2.in',
          transformOrigin: 'left center',
          onComplete: () => {
            dropdownContainer.style.display = 'none';
          }
        });
      }
    }
    // Mostrar dropdown al entrar el mouse en el enlace o el dropdown
    serviciosItem.addEventListener('mouseenter', showDropdown);
    dropdownContainer.addEventListener('mouseenter', showDropdown);
    // Ocultar dropdown solo si el mouse no está sobre el enlace ni el dropdown (con pequeño delay para evitar parpadeo)
    serviciosItem.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!isHovering()) closeDropdown();
      }, 100);
    });
    dropdownContainer.addEventListener('mouseleave', function() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!isHovering()) closeDropdown();
      }, 100);
    });
  }
});
