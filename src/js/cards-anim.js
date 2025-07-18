// Animación de entrada y flip para cartas tipo baraja


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
  cards.forEach((card, i) => {
    let xFrom = card.classList.contains('from-left') ? '-100vw' : '100vw';
    gsap.set(card, { opacity: 0, x: xFrom });
    const content = card.querySelector('.info-card-content');
    // Parallax para el contenido
    gsap.set(content, { y: 60 });
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(card, {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        });
        gsap.to(content, {
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
        });
      },
      onLeave: () => {
        gsap.to(card, {
          opacity: 0,
          x: xFrom,
          duration: 0.7,
          ease: 'power2.in',
        });
        gsap.to(content, {
          y: 60,
          duration: 0.7,
          ease: 'power2.in',
        });
      },
      onEnterBack: () => {
        gsap.to(content, {
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
        });
        gsap.to(card, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      },
      onLeaveBack: () => {
        gsap.to(content, {
          y: 60,
          duration: 0.7,
          ease: 'power2.in',
        });
        gsap.to(card, {
          opacity: 0,
          x: xFrom,
          duration: 0.7,
          ease: 'power2.in',
        });
      },
      scrub: false
    });
    // Parallax suave al hacer scroll
    gsap.to(content, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  });
}
