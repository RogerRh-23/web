// Carousel automático con GSAP para .carousel-inner y .carousel-item
// Requiere GSAP (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js)

const carouselInner = document.querySelector('.carousel-inner');
const items = Array.from(document.querySelectorAll('.carousel-item'));
let autoIndex = 0;
let autoInterval = null;
const AUTO_DELAY = 4000; // ms

function showAutoItem(index) {
    items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.style.zIndex = i === index ? 2 : 1;
        gsap.to(item, {
            x: `${(i - index) * 100}%`,
            opacity: i === index ? 1 : 0,
            duration: 0.7,
            ease: 'power2.inOut',
            onStart: () => {
                if (i === index) item.style.display = 'block';
            },
            onComplete: () => {
                if (i !== index) item.style.display = 'none';
            }
        });
    });
}

function nextAutoItem() {
    autoIndex = (autoIndex + 1) % items.length;
    showAutoItem(autoIndex);
}

function startAutoCarousel() {
    showAutoItem(autoIndex);
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(nextAutoItem, AUTO_DELAY);
}

// Iniciar automáticamente cuando el DOM esté listo
if (carouselInner && items.length > 1) {
    document.addEventListener('DOMContentLoaded', startAutoCarousel);
}
