// Carousel funcional, accesible y responsivo
document.addEventListener('DOMContentLoaded', function () {
  const carouselTrack = document.querySelector('.carousel-track');
  const cards = Array.from(document.querySelectorAll('.card-certificacion'));
  const prevArrow = document.querySelector('.carousel-arrow.prev');
  const nextArrow = document.querySelector('.carousel-arrow.next');
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  let currentIndex = 0;
  let isAnimating = false;

  function updateARIA(index) {
    cards.forEach((card, i) => {
      card.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      dot.classList.toggle('active', i === index);
    });
  }

  function showCard(index, animate = true) {
    if (isAnimating || index === currentIndex) return;
    isAnimating = true;
    cards.forEach((card, i) => {
      card.classList.remove('active');
      card.style.transform = `translateX(${(i - index) * 100}%)`;
      card.style.transition = 'transform 0.6s cubic-bezier(.77,.2,.32,1)';
      card.style.opacity = 0;
    });
    // Solo la card activa debe tener la clase y opacidad 1
    const activeCard = cards[index];
    activeCard.classList.add('active');
    gsap.fromTo(activeCard, {
      opacity: 0
    }, {
      opacity: 1,
      duration: animate ? 0.5 : 0,
      ease: 'power2.out',
      onComplete: () => {
        isAnimating = false;
      }
    });
    updateARIA(index);
    currentIndex = index;
  }

  // Inicializar posición de las cards
  cards.forEach((card, i) => {
    card.style.transform = `translateX(${(i - currentIndex) * 100}%)`;
    card.style.transition = 'transform 0.6s cubic-bezier(.77,.2,.32,1)';
    card.style.opacity = i === currentIndex ? 1 : 0;
    if (i === currentIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  updateARIA(currentIndex);

  // Flechas
  if (prevArrow && nextArrow) {
    prevArrow.addEventListener('click', () => {
      if (currentIndex > 0 && !isAnimating) {
        showCard(currentIndex - 1);
      }
    });
    nextArrow.addEventListener('click', () => {
      if (currentIndex < cards.length - 1 && !isAnimating) {
        showCard(currentIndex + 1);
      }
    });
    // Accesibilidad teclado
    [prevArrow, nextArrow].forEach(btn => {
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          btn.click();
        }
      });
    });
  }

  // Dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (!isAnimating) showCard(i);
    });
    dot.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !isAnimating) {
        showCard(i);
      }
    });
  });

  // Swipe para mobile
  let startX = null;
  carouselTrack.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
    }
  });
  carouselTrack.addEventListener('touchend', e => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (Math.abs(diff) > 40 && !isAnimating) {
      if (diff < 0 && currentIndex < cards.length - 1) {
        showCard(currentIndex + 1);
      } else if (diff > 0 && currentIndex > 0) {
        showCard(currentIndex - 1);
      }
    }
    startX = null;
  });

  // Accesibilidad: flechas izquierda/derecha
  document.addEventListener('keydown', e => {
    if (document.activeElement.closest('.carousel-track')) {
      if (e.key === 'ArrowLeft' && currentIndex > 0 && !isAnimating) {
        showCard(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < cards.length - 1 && !isAnimating) {
        showCard(currentIndex + 1);
      }
    }
  });
});
