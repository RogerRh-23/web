// Animación GSAP para hover en bloques de acreditación EMA
// Requiere GSAP (https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js)
document.addEventListener('DOMContentLoaded', function () {
  const blocks = Array.from(document.querySelectorAll('.ema-96-13, .ema-96-20, .ema-96-2IAF'));
  const parent = document.querySelector('.section-content');
  if (!blocks.length || !parent) return;

  // Requiere MotionPathPlugin
  if (typeof MotionPathPlugin !== 'undefined') {
    gsap.registerPlugin(MotionPathPlugin);
  }

  let hoveredBlock = null;
  blocks.forEach(block => {
    block.addEventListener('mouseenter', () => {
      if (hoveredBlock === block) return;
      hoveredBlock = block;
      
      // Eleva el bloque activo siguiendo una pequeña curva (efecto ola)
      gsap.to(block, {
        duration: 0.5,
        scale: 1.04,
        boxShadow: '0 8px 32px rgba(51,145,170,0.18)',
        zIndex: 2,
        filter: 'none',
        overwrite: 'auto',
        motionPath: {
          path: [
            { x: 0, y: 0 },
            { x: 18, y: -24 },
            { x: 0, y: -16 }
          ],
          curviness: 1.2,
          autoRotate: false
        },
        ease: 'power2.out'
      });
    });
    block.addEventListener('mouseleave', () => {
      hoveredBlock = null;
      // Restaura todos los bloques
      gsap.to(blocks, {
        x: 0,
        y: 0,
        scale: 1,
        boxShadow: 'none',
        zIndex: 1,
        filter: 'none',
        opacity: 1,
        duration: 0.28,
        ease: 'power2.inOut',
        overwrite: 'auto',
        clearProps: 'filter,opacity'
      });
    });
  });

  // Si el mouse sale del contenedor, restaura todo
  parent.addEventListener('mouseleave', () => {
    hoveredBlock = null;
    gsap.to(blocks, {
      x: 0,
      y: 0,
      scale: 1,
      boxShadow: 'none',
      zIndex: 1,
      filter: 'none',
      opacity: 1,
      duration: 0.28,
      ease: 'power2.inOut',
      overwrite: 'auto',
      clearProps: 'filter,opacity'
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const blocks = Array.from(document.querySelectorAll('.ema-96-13, .ema-96-20, .ema-96-2IAF'));
  if (!blocks.length) return;

  gsap.set(blocks, { y: 0 });

  gsap.timeline({
    scrollTrigger: {
      trigger: '.section-content',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
      once: false
    }
  })
  .to(blocks, {
    y: -40,
    stagger: 0.15,
    duration: 0.45,
    ease: 'power2.out',
  })
  .to(blocks, {
    y: 0,
    stagger: 0.15,
    duration: 0.45,
    ease: 'elastic.out(1, 0.5)',
  });
});