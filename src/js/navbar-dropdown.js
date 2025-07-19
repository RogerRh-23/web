// Dropdown animado con GSAP para la navbar
// Estructura y lógica de los dropdowns

// Dropdown animado con GSAP para la navbar
// Estructura y lógica de los dropdowns

function initDropdowns() {
  // Utilidad para obtener el enlace de la navbar por texto
  function getDropdownLink(texto) {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    for (let link of navLinks) {
      if (link.textContent.trim().includes(texto)) {
        link.setAttribute('href', 'javascript:void(0)');
        return link;
      }
    }
    return null;
  }

  // Estructura de los dropdowns
  const dropdowns = [
    {
      label: 'Servicios',
      items: ['Certificación de Sistemas de Gestión', 'Capacitación', 'Sorteo y Retrabajo']
    },
    {
      label: 'Procesos',
      items: ['Proceso de Certificación', 'Vigencia de la Certificación', 'Política de Imparcialidad']
    },
    {
      label: 'Centro de formación',
      items: ['Cursos', 'Webinars']
    }
  ];

  // Lógica para crear y animar los dropdowns
  dropdowns.forEach(drop => {
    const navItem = getDropdownLink(drop.label);
    if (!navItem) return;
    let dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown-gsap-container';
    let dropdown = document.createElement('ul');
    dropdown.className = 'dropdown-gsap';
    // Generar el href según el label y el nombre del item
    dropdown.innerHTML = drop.items.map(item => {
      // Carpeta y archivo: usar el nombre original tal como está en el sistema de archivos
      const folder = drop.label;
      const file = item;
      const href = `./components/${folder}/${file}.html`;
      return `<li><a href="#" data-href="${href}">${item}</a></li>`;
    }).join('');

    dropdownContainer.appendChild(dropdown);
    document.body.appendChild(dropdownContainer);
    gsap.set(dropdownContainer, { height: 0, opacity: 0, display: 'none' });

    // Delegación de eventos para cargar dinámicamente el contenido
    dropdown.addEventListener('click', function(e) {
      const target = e.target.closest('a[data-href]');
      if (target) {
        e.preventDefault();
        const href = target.getAttribute('data-href');
        // Ocultar secciones principales y mostrar el contenedor dinámico
        const headImg = document.querySelector('.head-img-container');
        const cards = document.getElementById('cards');
        const dynamicContent = document.getElementById('dynamic-content');
        if (headImg) headImg.style.display = 'none';
        if (cards) cards.style.display = 'none';
        if (dynamicContent) {
          dynamicContent.style.display = 'block';
          fetch(href)
            .then(res => res.text())
            .then(html => {
              dynamicContent.innerHTML = html;
            });
        }
        closeDropdown();
      }
    });

    let open = false;
    function isHovering() {
      return navItem.matches(':hover') || dropdownContainer.matches(':hover');
    }
    let hoverTimeout;
    function showDropdown() {
      if (!open) {
        open = true;
        const rect = navItem.getBoundingClientRect();
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
    // Eventos para mostrar y ocultar el dropdown
    navItem.addEventListener('mouseenter', showDropdown);
    navItem.addEventListener('focus', showDropdown);
    dropdownContainer.addEventListener('mouseenter', showDropdown);
    dropdownContainer.addEventListener('focus', showDropdown);
    function handleMouseLeave() {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        if (!isHovering()) closeDropdown();
      }, 100);
    }
    navItem.addEventListener('mouseleave', handleMouseLeave);
    navItem.addEventListener('blur', handleMouseLeave);
    dropdownContainer.addEventListener('mouseleave', handleMouseLeave);
    dropdownContainer.addEventListener('blur', handleMouseLeave);
  });
}

// Esperar a que la navbar esté en el DOM
const navbarPlaceholder = document.getElementById('navbar-placeholder');
if (navbarPlaceholder) {
  const observer = new MutationObserver((mutations, obs) => {
    if (navbarPlaceholder.querySelector('.navbar-nav')) {
      initDropdowns();
      obs.disconnect();
    }
  });
  observer.observe(navbarPlaceholder, { childList: true, subtree: true });
}
// ...estilos y animaciones en CSS/scss para .dropdown-gsap-container y .dropdown-gsap...
