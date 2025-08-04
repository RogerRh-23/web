function showDevPanelLinkMobileIfAuthorized() {
  const devLinkId = 'dev-panel-link-mobile';
  let devLink = document.getElementById(devLinkId);
  if (!devLink) {
    // Insertar el enlace al final de la navbar móvil solo si no existe
    const nav = document.querySelector('.navbar-mobile ul');
    if (nav) {
      devLink = document.createElement('li');
      devLink.className = 'nav-item';
      devLink.id = devLinkId;
      devLink.innerHTML = '<a class="nav-link" href="/public/components/dev-panel.html"><i class="bi bi-tools"></i> Panel Dev</a>';
      nav.appendChild(devLink);
    }
  }
  // Por defecto oculto
  if (devLink) devLink.style.display = 'none';
  // Verificar token y rol
  const token = localStorage.getItem('dev_token') || localStorage.getItem('admin_token');
  if (!token) return;
  fetch('/auth/me', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => res.json())
    .then(data => {
      if (data && (data.role === 'dev' || data.role === 'admin')) {
        if (devLink) devLink.style.display = '';
      }
    })
    .catch(() => { });
}
// Mostrar enlace a dev-panel solo si el usuario es dev o admin
function showDevPanelLinkIfAuthorized() {
  const devLinkId = 'dev-panel-link';
  let devLink = document.getElementById(devLinkId);
  if (!devLink) {
    // Insertar el enlace al final de la navbar solo si no existe
    const nav = document.querySelector('.navbar-nav');
    if (nav) {
      devLink = document.createElement('li');
      devLink.className = 'nav-item';
      devLink.id = devLinkId;
      devLink.innerHTML = '<a class="nav-link" href="/public/components/dev-panel.html"><i class="bi bi-tools"></i> Panel Dev</a>';
      nav.appendChild(devLink);
    }
  }
  // Por defecto oculto
  if (devLink) devLink.style.display = 'none';
  // Verificar token y rol
  const token = localStorage.getItem('dev_token') || localStorage.getItem('admin_token');
  if (!token) return;
  fetch('/auth/me', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => res.json())
    .then(data => {
      if (data && (data.role === 'dev' || data.role === 'admin')) {
        if (devLink) devLink.style.display = '';
      }
    })
    .catch(() => { });
}

window.initDropdowns = function initDropdowns() {
  showDevPanelLinkIfAuthorized();
  showDevPanelLinkMobileIfAuthorized();
  // Confirmación inmediata de disponibilidad
  if (!window._initDropdownsDefined) {
    window._initDropdownsDefined = true;
    console.log('[Dropdown] window.initDropdowns is now defined');
  }
  console.log('[Dropdown] navbar-dropdown.js loaded');
  // Eliminar todos los dropdowns previos para evitar duplicados
  document.querySelectorAll('.dropdown-gsap-container').forEach(el => el.remove());

  // Cerrar todos los dropdowns si se hace clic fuera de ellos o de cualquier nav-link (solo un listener global)
  if (!window._dropdownsGlobalListener) {
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('.dropdown-gsap-container') && !e.target.closest('.nav-link')) {
        closeAllDropdownsGlobal();
      }
    });
    window._dropdownsGlobalListener = true;
  }
  // Utilidad para obtener el enlace de la navbar por texto (desktop)
  function getDropdownLink(label) {
    // Busca por atributo data-dropdown para ser robusto ante iconos o formato
    const link = document.querySelector('.navbar-nav .nav-link[data-dropdown="' + label + '"]');
    if (link) {
      link.setAttribute('href', 'javascript:void(0)');
      return link;
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
  // --- Cerrar todos los dropdowns al hacer scroll, resize o clic fuera ---
  function closeAllDropdownsGlobal() {
    document.querySelectorAll('.dropdown-gsap-container').forEach(el => {
      if (el.style.display === 'block') {
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
  window.addEventListener('scroll', closeAllDropdownsGlobal);
  window.addEventListener('resize', closeAllDropdownsGlobal);
  // (Eliminado: duplicado innecesario de event listener para cerrar dropdowns)

  dropdowns.forEach(drop => {
    // Desktop: solo si no es móvil
    if (!window.matchMedia('(max-width: 991px)').matches) {
      const navItem = getDropdownLink(drop.label);
      if (navItem) {
        let dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-gsap-container';
        let dropdown = document.createElement('ul');
        dropdown.className = 'dropdown-gsap';
        dropdown.innerHTML = drop.items.map(item => {
          const href = `/public/components/${item.path}`;
          return `<li><a href="${href}">${item.name}</a></li>`;
        }).join('');
        dropdownContainer.appendChild(dropdown);
        document.body.appendChild(dropdownContainer);
        gsap.set(dropdownContainer, { height: 0, opacity: 0, display: 'none' });
        let open = false;
        let mouseOverDropdown = false;
        function isHovering() {
          return mouseOverDropdown;
        }
        let hoverTimeout;
        const CLOSE_DELAY = 50;

        dropdownContainer._dropdownInstance = { closeDropdown: () => { if (open) closeDropdown(); } };

        navItem.addEventListener('click', function (e) {
          e.preventDefault();
          if (open) {
            closeDropdown();
          } else {
            document.querySelectorAll('.dropdown-gsap-container').forEach(el => {
              if (el !== dropdownContainer && el.style.display === 'block') {
                if (el._dropdownInstance && typeof el._dropdownInstance.closeDropdown === 'function') {
                  el._dropdownInstance.closeDropdown();
                } else {
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
              }
            });
            showDropdown();
          }
        });
        dropdownContainer.addEventListener('mouseenter', () => {
          mouseOverDropdown = true;
          clearTimeout(hoverTimeout);
        });
        dropdownContainer.addEventListener('mouseleave', () => {
          mouseOverDropdown = false;
          handleMouseLeave();
        });

        function showDropdown() {
          if (!open) {
            gsap.killTweensOf(dropdownContainer);
            open = true;
            dropdownContainer.dataset.open = 'true';
            const rect = navItem.getBoundingClientRect();
            dropdownContainer.style.display = 'block';
            dropdownContainer.style.visibility = 'hidden';
            dropdownContainer.style.position = 'fixed';
            dropdownContainer.style.minWidth = rect.width + 'px';
            dropdownContainer.style.zIndex = '99999';
            dropdownContainer.style.background = '';
            dropdownContainer.style.boxShadow = '';
            dropdownContainer.style.border = '';
            dropdownContainer.style.borderRadius = '';
            dropdownContainer.offsetHeight;
            let margin = 6;
            let top = rect.bottom + margin;
            let left = rect.left;
            dropdownContainer.style.left = left + 'px';
            dropdownContainer.style.top = top + 'px';
            dropdownContainer.style.visibility = 'visible';
            gsap.set(dropdownContainer, { x: -40, opacity: 0, rotateY: -70, height: 0 });
            gsap.to(dropdownContainer, {
              x: 0,
              opacity: 1,
              rotateY: 0,
              height: 'auto',
              duration: 0.48,
              ease: 'power2.out',
              transformOrigin: 'left center'
            });
          }
        }
        function closeDropdown() {
          if (open) {
            gsap.killTweensOf(dropdownContainer);
            open = false;
            dropdownContainer.dataset.open = 'false';
            gsap.set(dropdownContainer, { x: 0, opacity: 1, rotateY: 0, height: 'auto' });
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
        function handleMouseLeave() {
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            if (!isHovering()) closeDropdown();
          }, CLOSE_DELAY);
        }
      }
    }
    // Mobile
    // Solo si es móvil
    if (window.matchMedia('(max-width: 991px)').matches) {
      const mobileIcon = getMobileIcon(drop.label);
      if (mobileIcon) {
        let mobileDropdownContainer = document.createElement('div');
        mobileDropdownContainer.className = 'dropdown-gsap-container dropdown-gsap-mobile';
        let mobileDropdown = document.createElement('ul');
        mobileDropdown.className = 'dropdown-gsap';
        mobileDropdown.innerHTML = drop.items.map(item => {
          const href = `/public/components/${item.path}`;
          return `<li><a href="${href}">${item.name}</a></li>`;
        }).join('');
        mobileDropdownContainer.appendChild(mobileDropdown);
        // Siempre insertar en el placeholder, nunca en el body
        const mobileDropdownPlaceholder = document.getElementById('navbar-mobile-dropdown-placeholder');
        if (mobileDropdownPlaceholder) {
          mobileDropdownPlaceholder.appendChild(mobileDropdownContainer);
        } else {
          // Si no existe, crear el placeholder y agregarlo al navbar-mobile
          const navbarMobile = document.querySelector('.navbar-mobile');
          if (navbarMobile) {
            const placeholder = document.createElement('div');
            placeholder.id = 'navbar-mobile-dropdown-placeholder';
            navbarMobile.appendChild(placeholder);
            placeholder.appendChild(mobileDropdownContainer);
          } else {
            document.body.appendChild(mobileDropdownContainer);
          }
        }
        gsap.set(mobileDropdownContainer, { y: 60, opacity: 0, display: 'none' });
        let mobileOpen = false;
        function showMobileDropdown() {
          if (!mobileOpen) {
            mobileOpen = true;
            // Obtener rect y calcular minWidth solo al abrir
            const rect = mobileIcon.getBoundingClientRect();
            // Resetear estilos antes de mostrar
            mobileDropdownContainer.style.position = '';
            mobileDropdownContainer.style.minWidth = '';
            mobileDropdownContainer.style.maxWidth = '';
            mobileDropdownContainer.style.height = '';
            mobileDropdownContainer.style.overflow = '';
            mobileDropdownContainer.style.left = '';
            mobileDropdownContainer.style.top = '';
            mobileDropdownContainer.style.display = '';
            mobileDropdownContainer.style.visibility = '';
            // Aplicar estilos base y mostrar temporalmente para calcular tamaño real
            mobileDropdownContainer.style.position = 'fixed';
            mobileDropdownContainer.style.zIndex = '99999';
            mobileDropdownContainer.style.background = '#fff';
            mobileDropdownContainer.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
            mobileDropdownContainer.style.border = '1px solid #eee';
            mobileDropdownContainer.style.borderRadius = '8px';
            mobileDropdownContainer.style.left = '0px';
            mobileDropdownContainer.style.top = '0px';
            mobileDropdownContainer.style.display = 'block';
            mobileDropdownContainer.style.visibility = 'hidden';
            // Forzar ancho en el ul interno
            const dropdownUl = mobileDropdownContainer.querySelector('ul.dropdown-gsap');
            const minWidth = Math.max(rect.width, 220);
            if (dropdownUl) {
              dropdownUl.style.minWidth = minWidth + 'px';
              dropdownUl.style.maxWidth = '90vw';
              dropdownUl.style.boxSizing = 'border-box';
            }
            // Esperar a que se renderice para calcular tamaño real
            setTimeout(() => {
              const realHeight = dropdownUl ? dropdownUl.offsetHeight : mobileDropdownContainer.offsetHeight;
              let left = rect.left + (rect.width / 2) - (minWidth / 2);
              if (left < 8) left = 8;
              if (left + minWidth > window.innerWidth - 8) left = window.innerWidth - minWidth - 8;
              let top = rect.bottom + 8;
              if (top + realHeight > window.innerHeight) {
                top = rect.top - realHeight - 8;
                if (top < 8) top = 8;
              }
              mobileDropdownContainer.style.left = left + 'px';
              mobileDropdownContainer.style.top = top + 'px';
              mobileDropdownContainer.style.visibility = 'visible';
              gsap.set(mobileDropdownContainer, { y: 0, opacity: 0 });
              gsap.to(mobileDropdownContainer, { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' });
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
                // Resetear todos los estilos relevantes para evitar problemas en el próximo despliegue
                mobileDropdownContainer.style.visibility = 'hidden';
                mobileDropdownContainer.style.left = '';
                mobileDropdownContainer.style.top = '';
                mobileDropdownContainer.style.minWidth = '';
                mobileDropdownContainer.style.maxWidth = '';
                mobileDropdownContainer.style.height = '';
                mobileDropdownContainer.style.overflow = '';
                mobileDropdownContainer.style.display = 'none';
                // También limpiar estilos del ul interno
                const dropdownUl = mobileDropdownContainer.querySelector('ul.dropdown-gsap');
                if (dropdownUl) {
                  dropdownUl.style.minWidth = '';
                  dropdownUl.style.maxWidth = '';
                  dropdownUl.style.boxSizing = '';
                }
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
        mobileIcon.addEventListener('click', function (e) {
          e.preventDefault();
          if (mobileOpen) {
            closeMobileDropdown();
          } else {
            showMobileDropdown();
          }
        });
      }
    }
  });
  // Si la navbar no está en el DOM, esperar y reintentar SOLO si es desktop
  if (!window.matchMedia('(max-width: 991px)').matches) {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (!navLinks.length) {
      setTimeout(window.initDropdowns, 100);
      return;
    }
  }

  // SPA: Mostrar portada al volver a la home (solo una vez, no duplicar listener)
  if (!window._dropdownsLogoListener) {
    const logo = document.querySelector('.navbar-brand, .navbar-mobile-brand');
    if (logo) {
      logo.addEventListener('click', function (e) {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/public/' || window.location.pathname === '/public/index.html') {
          window.dispatchEvent(new CustomEvent('show-home-sections'));
        }
      });
      window._dropdownsLogoListener = true;
    }
  }
}
// Solo un log global
if (!window._dropdownsLoadedLog) {
  console.log('[Dropdown] navbar-dropdown.js loaded');
  window._dropdownsLoadedLog = true;
}