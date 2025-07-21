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
      start: 'top 80%',
      end: 'bottom 20%',
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
