// Dropdown animado con GSAP para la navbar
// Estructura y lógica de los dropdowns

// Dropdown animado con GSAP para la navbar
// Estructura y lógica de los dropdowns

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
      items: ['Certificación de Sistemas de Gestión', 'Capacitación', 'Sorteo y Retrabajo']
    },
    {
      label: 'Procesos',
      items: ['Proceso de Certificación', 'Vigencia de la Certificación', 'Proceso de atención de quejas']
    },
    {
      label: 'Centro de formación',
      items: ['Cursos', 'Webinars']
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
        const folder = drop.label;
        const file = item;
        // Generar path relativo según ubicación actual
        let href = '';
        const currentPath = window.location.pathname;
        if (currentPath.match(/\/components\//)) {
          href = `../components/${folder}/${file}.html`;
        } else {
          href = `./components/${folder}/${file}.html`;
        }
        return `<li><a href="#" data-href="${href}">${item}</a></li>`;
      }).join('');
      dropdownContainer.appendChild(dropdown);
      document.body.appendChild(dropdownContainer);
      gsap.set(dropdownContainer, { height: 0, opacity: 0, display: 'none' });
      // Delegación de eventos para cargar dinámicamente el contenido
      dropdown.addEventListener('click', function(e) {
        const target = e.target.closest('a[data-href]');
        if (target) {
          // Permitir abrir en nueva pestaña/ventana con Ctrl, Shift o botón medio
          if (e.ctrlKey || e.shiftKey || e.metaKey || e.button === 1) {
            window.open(target.getAttribute('data-href'), '_blank');
            setTimeout(closeDropdown, 200);
            return;
          }
          e.preventDefault();
          let href = target.getAttribute('data-href');
          const headImg = document.querySelector('.head-img-container');
          const cards = document.getElementById('cards');
          const dynamicContent = document.getElementById('dynamic-content');
          if (dynamicContent) {
            if (headImg) headImg.style.display = 'none';
            if (cards) cards.style.display = 'none';
            dynamicContent.style.display = 'block';
            fetch(href)
              .then(res => {
                if (!res.ok) {
                  setTimeout(() => { window.location.href = href; }, 180);
                  closeDropdown();
                  return Promise.reject();
                }
                return res.text();
              })
              .then(html => {
                if (html) dynamicContent.innerHTML = html;
              })
              .catch(() => {});
            setTimeout(closeDropdown, 180);
          } else {
            // Cerrar dropdown, esperar el delay y luego redirigir
            closeDropdown();
            setTimeout(() => { window.location.href = href; }, 180);
          }
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
    }
    // Mobile
    const mobileIcon = getMobileIcon(drop.label);
    if (mobileIcon) {
      let mobileDropdownContainer = document.createElement('div');
      mobileDropdownContainer.className = 'dropdown-gsap-container dropdown-gsap-mobile';
      let mobileDropdown = document.createElement('ul');
      mobileDropdown.className = 'dropdown-gsap';
      mobileDropdown.innerHTML = drop.items.map(item => {
        const folder = drop.label;
        const file = item;
        let href = '';
        const currentPath = window.location.pathname;
        if (currentPath.match(/\/components\//)) {
          href = `../components/${folder}/${file}.html`;
        } else {
          href = `./components/${folder}/${file}.html`;
        }
        return `<li><a href="#" data-href="${href}">${item}</a></li>`;
      }).join('');
      mobileDropdownContainer.appendChild(mobileDropdown);
      // Append to the mobile dropdown placeholder for correct positioning
      const mobileDropdownPlaceholder = document.getElementById('navbar-mobile-dropdown-placeholder');
      if (mobileDropdownPlaceholder) {
        mobileDropdownPlaceholder.appendChild(mobileDropdownContainer);
      } else {
        document.body.appendChild(mobileDropdownContainer);
      }
      gsap.set(mobileDropdownContainer, { y: 60, opacity: 0, display: 'none' });
      // Mostrar dropdown al hacer click en el icono
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
          // Esperar a que el dropdown esté en el DOM para calcular el alto
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
          // Cerrar si se hace click fuera
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
      // Cargar contenido y cerrar al hacer click en una opción
      mobileDropdown.addEventListener('click', function(e) {
        const target = e.target.closest('a[data-href]');
        if (target) {
          e.preventDefault();
          const href = target.getAttribute('data-href');
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
          closeMobileDropdown();
        }
      });
    }
  });
}

// Esperar a que la navbar esté en el DOM
// La inicialización de los dropdowns se hace explícitamente tras cargar la navbar en cada HTML.
// ...estilos y animaciones en CSS/scss para .dropdown-gsap-container y .dropdown-gsap...
