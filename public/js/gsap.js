gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  let lastTouchY = 0;
  let navbarShown = false;

  // --- Lógica de menú hamburguesa móvil AJUSTADA ---
  function initMobileMenuDropdown() {
    const mobileMenuBtn = document.querySelector('.navbar-mobile-menu[aria-label="Menú"]');
    const mobileDropdown = document.querySelector('.navbar-mobile-dropdown');
    const mobileDropdownMenu = document.querySelector('.navbar-mobile-dropdown-menu');
    let mobileMenuOpen = false;

    function openMobileMenu() {
      if (!mobileDropdownMenu || !mobileDropdown) return;
      mobileDropdown.classList.add('expanded');
      mobileDropdownMenu.classList.add('expanded');
      if (window.gsap) {
        window.gsap.fromTo(mobileDropdownMenu, { maxHeight: 0, opacity: 0 }, { maxHeight: '80vh', opacity: 1, duration: 0.35, ease: 'power2.out' });
      }
      mobileMenuOpen = true;
      document.body.classList.add('mobile-menu-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
      if (!mobileDropdownMenu || !mobileDropdown) return;
      if (window.gsap) {
        window.gsap.to(mobileDropdownMenu, {
          maxHeight: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
            mobileDropdown.classList.remove('expanded');
            mobileDropdownMenu.classList.remove('expanded');
          }
        });
      } else {
        mobileDropdown.classList.remove('expanded');
        mobileDropdownMenu.classList.remove('expanded');
      }
      mobileMenuOpen = false;
      document.body.classList.remove('mobile-menu-open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    if (mobileMenuBtn && mobileDropdownMenu && mobileDropdown) {
      mobileMenuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (mobileMenuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
      // Cerrar al hacer click fuera
      document.addEventListener('mousedown', function (e) {
        if (mobileMenuOpen && !e.target.closest('.navbar-mobile-dropdown-menu') && !e.target.closest('.navbar-mobile-menu[aria-label="Menú"]')) {
          closeMobileMenu();
        }
      });
      // Cerrar al seleccionar un enlace
      mobileDropdownMenu.querySelectorAll('a,button').forEach(link => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });
    }
  }

  window.initMobileMenuDropdown = initMobileMenuDropdown;
});
