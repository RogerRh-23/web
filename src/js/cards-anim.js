document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que las nuevas cards se carguen dinámicamente
  const observer = new MutationObserver(() => {
    const cards = document.querySelectorAll('.info-card');
    if (cards.length) {
      observer.disconnect();
      animateInfoCards(cards);
    }
  });
  observer.observe(document.getElementById('cards'), { childList: true, subtree: true });
});


function animateInfoCards(cards) {
  const isMobile = window.innerWidth <= 991;
  cards.forEach((card, i) => {
    let xFrom = card.classList.contains('from-left')
      ? (isMobile ? '-60vw' : '-100vw')
      : (isMobile ? '60vw' : '100vw');
    let durationIn = isMobile ? 0.5 : 0.8;
    let durationOut = isMobile ? 0.4 : 0.7;
    gsap.set(card, { opacity: 0, x: xFrom, scale: isMobile ? 0.98 : 1 });
    const content = card.querySelector('.info-card-content');
    gsap.set(content, { y: 0 });
    ScrollTrigger.create({
      trigger: card,
      start: 'top 95%',
      end: 'bottom 5%',
      onEnter: () => {
        gsap.to(card, {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: durationIn,
          ease: 'power3.out',
        });
      },
      onLeave: () => {
        gsap.to(card, {
          opacity: 0,
          x: xFrom,
          scale: isMobile ? 0.98 : 1,
          duration: durationOut,
          ease: 'power2.in',
        });
      },
      onEnterBack: () => {
        gsap.to(card, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: durationIn,
          ease: 'power3.out',
        });
      },
      onLeaveBack: () => {
        gsap.to(card, {
          opacity: 0,
          x: xFrom,
          scale: isMobile ? 0.98 : 1,
          duration: durationOut,
          ease: 'power2.in',
        });
      },
      scrub: false
    });
  });
}

// Animación de valores en la Card 4 usando GSAP
// Requiere GSAP 3.x
document.addEventListener('DOMContentLoaded', function () {
  // Esperar a que las cards estén en el DOM
  const waitForValores = setInterval(() => {
    const card = document.querySelector('.info-card-bar.left-bar + .info-card-content .valores-list')?.closest('.info-card');
    if (!card) return;
    clearInterval(waitForValores);
    const rows = card.querySelectorAll('.valor-row');

    rows.forEach(row => {
      const btn = row.querySelector('.valor-label');
      const desc = row.querySelector('.valor-desc');
      // Si el icono ya existe, no lo agregues de nuevo
      if (!btn.querySelector('.valor-icon')) {
        let icon = document.createElement('span');
        icon.className = 'valor-icon';
        icon.innerHTML = '<i class="bi bi-plus"></i>';
        btn.prepend(icon);
      }
      // Ocultar descripción
      desc.style.display = 'none';
      desc.style.opacity = 0;
      desc.style.height = 'auto';
      desc.style.overflow = 'hidden';
      desc.style.willChange = 'opacity, height';
    });

    function closeAllExcept(exceptBtn) {
      rows.forEach(row => {
        const btn = row.querySelector('.valor-label');
        const desc = row.querySelector('.valor-desc');
        const icon = btn.querySelector('.valor-icon i');
        if (btn !== exceptBtn && btn.getAttribute('aria-expanded') === 'true') {
          btn.setAttribute('aria-expanded', 'false');
          // Icono gira a +
          gsap.to(icon, {rotate: 0, duration: 0.3, ease: 'power2.inOut', onComplete: () => {
            icon.className = 'bi bi-plus';
          }});
          // Oculta descripción con animación
          gsap.to(desc, {
            height: 0,
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
              desc.style.display = 'none';
              desc.hidden = true;
            }
          });
        }
      });
    }

    rows.forEach(row => {
      const btn = row.querySelector('.valor-label');
      const desc = row.querySelector('.valor-desc');
      const icon = btn.querySelector('.valor-icon i');
      btn.addEventListener('click', function () {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
          closeAllExcept(btn);
          btn.setAttribute('aria-expanded', 'true');
          // Icono gira a -
          gsap.to(icon, {rotate: 180, duration: 0.3, ease: 'power2.inOut', onComplete: () => {
            icon.className = 'bi bi-dash';
          }});
          // Mostrar descripción con animación de altura y text reveal
          desc.style.display = 'block';
          desc.hidden = false;
          desc.style.height = 'auto';
          const h = desc.scrollHeight;
          desc.style.height = '0px';
          gsap.to(desc, {
            height: h,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => {
              // Text reveal
              gsap.fromTo(desc, {clipPath: 'inset(0 0 100% 0)'}, {clipPath: 'inset(0 0 0% 0)', duration: 0.4, ease: 'power2.out'});
            },
            onComplete: () => {
              desc.style.height = 'auto';
            }
          });
          // Adaptar la card al nuevo tamaño
          gsap.to(card, {height: 'auto', duration: 0.4, ease: 'power2.out'});
        } else {
          btn.setAttribute('aria-expanded', 'false');
          // Icono gira a +
          gsap.to(icon, {rotate: 0, duration: 0.3, ease: 'power2.inOut', onComplete: () => {
            icon.className = 'bi bi-plus';
          }});
          // Oculta descripción con animación
          gsap.to(desc, {
            height: 0,
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
              desc.style.display = 'none';
              desc.hidden = true;
            }
          });
          // Adaptar la card al nuevo tamaño
          gsap.to(card, {height: 'auto', duration: 0.4, ease: 'power2.out'});
        }
      });
    });
  }, 100);
});
