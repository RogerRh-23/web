// navbar-dropdown.js - Nueva implementación funcional

// Traducción y configuración de menús
function getDropdownConfig() {
  const t = window.i18next ? window.i18next.t.bind(window.i18next) : (k) => k;
  return [
    {
      label: t('dropdown.services.label'),
      items: [
        { name: t('dropdown.services.items.0'), path: 'Servicios/Certificación de Sistemas de Gestión.html' },
        { name: t('dropdown.services.items.1'), path: 'Servicios/Capacitación.html' },
        { name: t('dropdown.services.items.2'), path: 'Servicios/Sorteo y Retrabajo.html' }
      ]
    },
    {
      label: t('dropdown.processes.label'),
      items: [
        { name: t('dropdown.processes.items.0'), path: 'Procesos/Proceso de Certificación.html' },
        { name: t('dropdown.processes.items.1'), path: 'Procesos/Vigencia de la Certificación.html' },
        { name: t('dropdown.processes.items.2'), path: 'Procesos/Procedimiento de atención de quejas.html' }
      ]
    },
    {
      label: t('dropdown.training.label'),
      items: [
        { name: t('dropdown.training.items.0'), path: 'Centro de formación/Cursos.html' },
        { name: t('dropdown.training.items.1'), path: 'Centro de formación/Webinars.html' }
      ]
    }
  ];
}

function createDropdownMenu(drop) {
  const ul = document.createElement('ul');
  ul.className = 'dropdown-gsap';
  ul.style.background = '#fff';
  ul.style.border = '1px solid #222';
  ul.style.boxShadow = '0 8px 32px 8px #0008';
  ul.style.borderRadius = '10px';
  ul.style.padding = '8px 0';
  ul.style.margin = '0';
  ul.style.listStyle = 'none';
  ul.style.minWidth = '220px';
  ul.style.zIndex = '2147483647';
  drop.items.forEach(item => {
    const li = document.createElement('li');
    li.style.padding = '0';
    const a = document.createElement('a');
    a.href = `/public/components/${item.path}`;
    a.textContent = item.name;
    a.style.display = 'block';
    a.style.padding = '8px 24px';
    a.style.color = '#222';
    a.style.textDecoration = 'none';
    a.style.fontSize = '1rem';
    a.onmouseover = () => a.style.background = '#f0f0f0';
    a.onmouseout = () => a.style.background = 'none';
    li.appendChild(a);
    ul.appendChild(li);
  });
  return ul;
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-gsap-container').forEach(el => {
    el.style.display = 'none';
  });
}

function initDropdowns() {
  // Elimina dropdowns previos para evitar duplicados al navegar entre HTMLs
  document.querySelectorAll('.dropdown-gsap-container').forEach(el => el.remove());
  closeAllDropdowns();
  const dropdowns = getDropdownConfig();
  // Desktop
  if (!window.matchMedia('(max-width: 991px)').matches) {
    dropdowns.forEach(drop => {
      // Buscar el navItem en todo el documento, no solo en la página principal
      const navItem = document.querySelector('.nav-link[data-dropdown="' + drop.label + '"]');
      if (navItem) {
        let dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-gsap-container';
        dropdownContainer.style.position = 'fixed';
        dropdownContainer.style.display = 'none';
        dropdownContainer.style.zIndex = '999999999';
        dropdownContainer.appendChild(createDropdownMenu(drop));
        document.body.appendChild(dropdownContainer);
        let open = false;
        function showDropdown() {
          closeAllDropdowns();
          const rect = navItem.getBoundingClientRect();
          dropdownContainer.style.left = rect.left + 'px';
          dropdownContainer.style.top = (rect.bottom + 6) + 'px';
          dropdownContainer.style.minWidth = rect.width + 'px';
          dropdownContainer.style.display = 'block';
          dropdownContainer.style.opacity = '0';
          if (window.gsap) {
            window.gsap.set(dropdownContainer, { x: -40, opacity: 0, rotateY: -70, height: 0 });
            window.gsap.to(dropdownContainer, {
              x: 0,
              opacity: 1,
              rotateY: 0,
              height: 'auto',
              duration: 0.48,
              ease: 'power2.out',
              transformOrigin: 'left center',
              onStart: () => { dropdownContainer.style.opacity = '1'; },
              onComplete: () => { open = true; }
            });
          } else {
            dropdownContainer.style.opacity = '1';
            open = true;
          }
        }
        function closeDropdown() {
          if (open || dropdownContainer.style.display === 'block') {
            if (window.gsap) {
              window.gsap.to(dropdownContainer, {
                x: -40,
                opacity: 0,
                rotateY: -70,
                height: 0,
                duration: 0.32,
                ease: 'power2.in',
                transformOrigin: 'left center',
                onComplete: () => {
                  dropdownContainer.style.display = 'none';
                  dropdownContainer.style.opacity = '0';
                  open = false;
                }
              });
            } else {
              dropdownContainer.style.display = 'none';
              dropdownContainer.style.opacity = '0';
              open = false;
            }
          }
        }
        navItem.addEventListener('click', function (e) {
          e.preventDefault();
          if (dropdownContainer.style.display === 'block') {
            closeDropdown();
          } else {
            showDropdown();
          }
        });
      }
    });
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('.dropdown-gsap-container') && !e.target.closest('.nav-link[data-dropdown]')) {
        closeAllDropdowns();
      }
    });
  }
  // Mobile
  if (window.matchMedia('(max-width: 991px)').matches) {
    dropdowns.forEach(drop => {
      // Buscar el icono en todo el documento
      const mobileIcon = document.querySelector('.navbar-mobile-link[aria-label="' + drop.label + '"]');
      if (mobileIcon) {
        let mobileDropdownContainer = document.createElement('div');
        mobileDropdownContainer.className = 'dropdown-gsap-container dropdown-gsap-mobile';
        mobileDropdownContainer.style.position = 'fixed';
        mobileDropdownContainer.style.display = 'none';
        mobileDropdownContainer.style.zIndex = '999999999';
        mobileDropdownContainer.appendChild(createDropdownMenu(drop));
        document.body.appendChild(mobileDropdownContainer);
        let mobileOpen = false;
        function showMobileDropdown() {
          closeAllDropdowns();
          const rect = mobileIcon.getBoundingClientRect();
          const minWidth = Math.max(rect.width, 220);
          // La navbar está abajo, así que el dropdown debe ir hacia arriba y ser completamente visible
          // Calcula la altura del dropdown antes de mostrarlo
          mobileDropdownContainer.style.display = 'block';
          mobileDropdownContainer.style.opacity = '0';
          // Espera a que el DOM actualice el tamaño
          setTimeout(() => {
            const dropdownHeight = mobileDropdownContainer.offsetHeight;
            mobileDropdownContainer.style.left = rect.left + 'px';
            // Si el dropdown se sale de la pantalla, ajusta la posición
            let top = rect.top - dropdownHeight - 40;
            if (top < 0) top = 8;
            mobileDropdownContainer.style.top = top + 'px';
            mobileDropdownContainer.style.minWidth = minWidth + 'px';
            mobileDropdownContainer.style.opacity = '1';
            mobileOpen = true;
          }, 0);
        }
        function closeMobileDropdown() {
          mobileDropdownContainer.style.display = 'none';
          mobileDropdownContainer.style.opacity = '0';
          mobileOpen = false;
        }
        mobileIcon.addEventListener('click', function (e) {
          e.preventDefault();
          if (mobileDropdownContainer.style.display === 'block') {
            closeMobileDropdown();
          } else {
            showMobileDropdown();
          }
        });
      }
    });
    document.addEventListener('mousedown', function (e) {
      if (!e.target.closest('.dropdown-gsap-container') && !e.target.closest('.navbar-mobile-link[aria-label]')) {
        closeAllDropdowns();
      }
    });
  }
}

// Inicialización robusta para SPA y recarga
function robustInitDropdowns() {
  let tries = 0;
  function tryInit() {
    // Verifica si existen los elementos de la navbar antes de inicializar
    const hasDesktopNav = document.querySelector('.nav-link[data-dropdown]');
    const hasMobileNav = document.querySelector('.navbar-mobile-link[aria-label]');
    if ((hasDesktopNav || hasMobileNav)) {
      initDropdowns();
    } else if (tries < 20) {
      tries++;
      setTimeout(tryInit, 200);
    }
  }
  tryInit();
}

// Inicialización reactiva usando MutationObserver para SPA y recarga parcial
function startDropdownObserver() {
  robustInitDropdowns();
  const observer = new MutationObserver(() => {
    const hasDesktopNav = document.querySelector('.nav-link[data-dropdown]');
    const hasMobileNav = document.querySelector('.navbar-mobile-link[aria-label]');
    if (hasDesktopNav || hasMobileNav) {
      robustInitDropdowns();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(startDropdownObserver, 0);
} else {
  document.addEventListener('DOMContentLoaded', startDropdownObserver);
}
