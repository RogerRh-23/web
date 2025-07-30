// Carousel GSAP animation using the Draggable plugin
// Requires GSAP and Draggable (https://greensock.com/draggable/)

// Make sure GSAP and Draggable are loaded in your HTML before this script
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"></script>

const carouselTrack = document.querySelector('.carousel-track');
const cards = Array.from(document.querySelectorAll('.card-certificacion'));
let currentIndex = 0;

function showCard(index) {
  cards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
    // Posiciona cada card horizontalmente
    card.style.transform = `translateX(${(i - index) * 100}%)`;
    card.style.transition = 'transform 0.6s cubic-bezier(.77,.2,.32,1)';
  });
}

function animateToCard(index) {
  const prevIndex = currentIndex;
  const direction = index > prevIndex ? 1 : -1;
  const prevCard = cards[prevIndex];
  const nextCard = cards[index];

  // Fade out la card actual
  gsap.to(prevCard, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      prevCard.classList.remove('active');
      // Posiciona la siguiente card y la muestra
      nextCard.classList.add('active');
      nextCard.style.transform = `translateX(0)`;
      nextCard.style.transition = 'transform 0.6s cubic-bezier(.77,.2,.32,1)';
      gsap.fromTo(nextCard, {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      });
      // Reposiciona el resto de las cards
      cards.forEach((card, i) => {
        if (card !== nextCard && card !== prevCard) {
          card.classList.remove('active');
          card.style.opacity = 0;
          card.style.transform = `translateX(${(i - index) * 100}%)`;
        }
      });
    }
  });
  currentIndex = index;
}

// Arrow navigation
const prevArrow = document.querySelector('.carousel-arrow.prev');
const nextArrow = document.querySelector('.carousel-arrow.next');

if (prevArrow && nextArrow) {
  prevArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      animateToCard(currentIndex);
    }
  });
  nextArrow.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      animateToCard(currentIndex);
    }
  });
}

// Draggable carousel

// Init
showCard(currentIndex);
