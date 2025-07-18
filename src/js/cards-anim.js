// Animación de entrada y flip para cartas tipo baraja

document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que las cards se carguen dinámicamente
  const observer = new MutationObserver(() => {
    const cards = document.querySelectorAll('.playing-card');
    if (cards.length) {
      observer.disconnect();
      animateCards(cards);
      setupFlip(cards);
      setupHoverAnimation(cards);
    }
  });
  observer.observe(document.getElementById('cards'), { childList: true, subtree: true });
});

function animateCards(cards) {
  gsap.set(cards, { opacity: 0, y: 80, rotate: (i) => [-16, -6, 8, 14][i] });
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    rotate: (i) => [-8, -2, 4, 10][i],
    stagger: 0.18,
    duration: 1.1,
    ease: 'power3.out',
  });
}

function setupFlip(cards) {
  cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    card.addEventListener('click', () => {
      // Resetea cualquier animación de hover antes del flip
      gsap.to(inner, {
        y: 0,
        scale: 1,
        rotateZ: 0,
        boxShadow: '',
        duration: 0.18,
        overwrite: true
      });
      // Desactiva hover temporalmente durante el flip
      card.classList.add('no-hover-anim');
      card.classList.toggle('flipped');
      setTimeout(() => {
        card.classList.remove('no-hover-anim');
      }, 700); // igual a la duración del flip
    });
  });
}

// Modifica la animación hover para ignorar cartas con .no-hover-anim o .flipped
function setupHoverAnimation(cards) {
  cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    card.addEventListener('mouseenter', () => {
      if (card.classList.contains('flipped') || card.classList.contains('no-hover-anim')) return;
      gsap.to(inner, {
        y: -32,
        scale: 1.12,
        rotateZ: -3,
        boxShadow: '0 20px 48px -6px rgba(20,30,60,0.45), 0 4px 16px -2px rgba(20,30,60,0.25)',
        duration: 0.32,
        ease: 'power2.out',
        overwrite: true
      });
    });
    card.addEventListener('mouseleave', () => {
      if (card.classList.contains('flipped') || card.classList.contains('no-hover-anim')) return;
      gsap.to(inner, {
        y: 0,
        scale: 1,
        rotateZ: 0,
        boxShadow: '',
        duration: 0.32,
        ease: 'power2.inOut',
        overwrite: true
      });
    });
  });
}
