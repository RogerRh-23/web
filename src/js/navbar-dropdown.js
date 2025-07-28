function initDropdowns() {
  // Utilidad para obtener el enlace de la navbar por texto (desktop)
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
  // Utilidad para obtener el icono de la navbar mobile por aria-label
  function getMobileIcon(label) {
    const mobileLinks = document.querySelectorAll('.navbar-mobile-link[aria-label]');
    for (let link of mobileLinks) {
      if (link.getAttribute('aria-label') === label) {
        return link;
      }
    }
    return null;
  }

  // Estructura de los dropdowns
  const dropdowns = [
    {
      label: 'Servicios',
      items: [
        { name: 'Certificación de Sistemas de Gestión', path: 'Servicios/Certificación de Sistemas de Gestión.html' },
        { name: 'Capacitación', path: 'Servicios/Capacitación.html' },
        { name: 'Sorteo y Retrabajo', path: 'Servicios/Sorteo y Retrabajo.html' }
      ]
    },
    {
      label: 'Procesos',
      items: [
        { name: 'Proceso de Certificación', path: 'Procesos/Proceso de Certificación.html' },
        { name: 'Vigencia de la Certificación', path: 'Procesos/Vigencia de la Certificación.html' },
        { name: 'Procedimiento de atención de quejas', path: 'Procesos/Procedimiento de atención de quejas.html' }
      ]
    },
    {
      label: 'Centro de formación',
      items: [
        { name: 'Cursos', path: 'Centro de formación/Cursos.html' },
        { name: 'Webinars', path: 'Centro de formación/Webinars.html' }
      ]
    }
  ];

  // Lógica para crear y animar los dropdowns para desktop y mobile
  dropdowns.forEach(drop => {
    // Desktop
    const navItem = getDropdownLink(drop.label);
    if (navItem) {
      let dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'dropdown-gsap-container';
      let dropdown = document.createElement('ul');
      dropdown.className = 'dropdown-gsap';
      dropdown.innerHTML = drop.items.map(item => {
        // Generar path relativo correcto según ubicación actual
        let href = '';
        const currentPath = window.location.pathname;
        // Elimina cualquier doble 'components/' en la ruta final
        if (currentPath.match(/\/components\//)) {
          // Si ya estamos en /components/, solo subimos un nivel si estamos en un subdirectorio
          const depth = currentPath.split('/components/')[1].split('/').length - 1;
          if (depth > 0) {
            href = `../${item.path}`;
          } else {
            href = `${item.path}`;
          }
        } else {
          href = `./components/${item.path}`;
        }
        // Normaliza la ruta para evitar doble 'components/'
        href = href.replace(/components\/components\//g, 'components/');
        return `<li><a href="${href}">${item.name}</a></li>`;
      }).join('');
      dropdownContainer.appendChild(dropdown);
      document.body.appendChild(dropdownContainer);
      gsap.set(dropdownContainer, { height: 0, opacity: 0, display: 'none' });
      let open = false;
      let mouseOverDropdown = false;
      let mouseOverNavItem = false;
      function isHovering() {
        return mouseOverDropdown || mouseOverNavItem;
      }
      let hoverTimeout;
      const CLOSE_DELAY = 50; // ms, aún más margen para elegir opción

      // --- NUEVO: Cerrar otros dropdowns antes de abrir este ---
      function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-gsap-container').forEach(el => {
          if (el !== dropdownContainer && el.style.display === 'block') {
            gsap.to(el, {
              x: -40,
              opacity: 0,
              rotateY: -70,
              height: 0,
              duration: 0.32,
              ease: 'power2.in',
              transformOrigin: 'left center',
              onComplete: () => {
                el.style.display = 'none';
              }
            });
          }
        });
      }

      function showDropdown() {
        // Listeners para detectar si el mouse está sobre el navItem o el dropdownContainer
        navItem.addEventListener('mouseenter', () => { mouseOverNavItem = true; });
        navItem.addEventListener('mouseleave', () => { mouseOverNavItem = false; });
        dropdownContainer.addEventListener('mouseenter', () => { mouseOverDropdown = true; });
        dropdownContainer.addEventListener('mouseleave', () => { mouseOverDropdown = false; });
        if (!open) {
          closeAllDropdowns(); // Cierra otros antes de abrir
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
      navItem.addEventListener('mouseenter', showDropdown);
      navItem.addEventListener('focus', showDropdown);
      dropdownContainer.addEventListener('mouseenter', showDropdown);
      dropdownContainer.addEventListener('focus', showDropdown);
      function handleMouseLeave() {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          if (!isHovering()) closeDropdown();
        }, CLOSE_DELAY);
      }
      navItem.addEventListener('mouseleave', handleMouseLeave);
      navItem.addEventListener('blur', handleMouseLeave);
      dropdownContainer.addEventListener('mouseleave', handleMouseLeave);
      dropdownContainer.addEventListener('blur', handleMouseLeave);
    }
    // Mobile
    const mobileIcon = getMobileIcon(drop.label);
    if (mobileIcon) {
      let mobileDropdownContainer = document.createElement('div');
      mobileDropdownContainer.className = 'dropdown-gsap-container dropdown-gsap-mobile';
      let mobileDropdown = document.createElement('ul');
      mobileDropdown.className = 'dropdown-gsap';
      mobileDropdown.innerHTML = drop.items.map(item => {
        let href = '';
        const currentPath = window.location.pathname;
        if (currentPath.match(/\/components\//)) {
          href = `../components/${item.path}`;
        } else {
          href = `./components/${item.path}`;
        }
        return `<li><a href="${href}">${item.name}</a></li>`;
      }).join('');
      mobileDropdownContainer.appendChild(mobileDropdown);
      const mobileDropdownPlaceholder = document.getElementById('navbar-mobile-dropdown-placeholder');
      if (mobileDropdownPlaceholder) {
        mobileDropdownPlaceholder.appendChild(mobileDropdownContainer);
      } else {
        document.body.appendChild(mobileDropdownContainer);
      }
      gsap.set(mobileDropdownContainer, { y: 60, opacity: 0, display: 'none' });
      let mobileOpen = false;
      function showMobileDropdown() {
        if (!mobileOpen) {
          mobileOpen = true;
          const rect = mobileIcon.getBoundingClientRect();
          mobileDropdownContainer.style.position = 'fixed';
          mobileDropdownContainer.style.left = rect.left + 'px';
          mobileDropdownContainer.style.zIndex = '99999';
          mobileDropdownContainer.style.visibility = 'visible';
          mobileDropdownContainer.style.display = 'block';
          setTimeout(() => {
            let dropdownHeight = mobileDropdownContainer.offsetHeight;
            if (!dropdownHeight || dropdownHeight < 40) dropdownHeight = 120;
            mobileDropdownContainer.style.top = (rect.top - dropdownHeight - 8) + 'px';
            mobileDropdownContainer.style.minWidth = rect.width + 'px';
            gsap.fromTo(
              mobileDropdownContainer,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.10, ease: 'power2.out' }
            );
          }, 0);
          setTimeout(() => {
            document.addEventListener('mousedown', handleOutsideClick);
          }, 0);
        }
      }
      function closeMobileDropdown() {
        if (mobileOpen) {
          mobileOpen = false;
          gsap.to(mobileDropdownContainer, {
            y: 60,
            opacity: 0,
            duration: 0.16,
            ease: 'power2.in',
            onComplete: () => {
              mobileDropdownContainer.style.display = 'none';
            }
          });
          document.removeEventListener('mousedown', handleOutsideClick);
        }
      }
      function handleOutsideClick(e) {
        if (!mobileDropdownContainer.contains(e.target) && !mobileIcon.contains(e.target)) {
          closeMobileDropdown();
        }
      }
      mobileIcon.addEventListener('click', function(e) {
        e.preventDefault();
        if (mobileOpen) {
          closeMobileDropdown();
        } else {
          showMobileDropdown();
        }
      });
    }
  });
}

// Esperar a que la navbar esté en el DOM
// La inicialización de los dropdowns se hace explícitamente tras cargar la navbar en cada HTML.
// ...estilos y animaciones en CSS/scss para .dropdown-gsap-container y .dropdown-gsap...
