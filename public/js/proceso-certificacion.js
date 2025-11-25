// Guardias y fallback: si GSAP/ScrollTrigger no están cargados, mostrar todo sin animaciones
function showAllSteps() {
  document.querySelectorAll('.step').forEach(step => {
    step.style.opacity = '1';
    step.classList.add('active');
    step.style.transform = 'none';
    step.style.display = '';
  });
  document.querySelectorAll('.step-image').forEach(image => {
    image.style.width = '100%';
    image.style.height = 'auto';
    image.style.opacity = '1';
    image.style.transform = 'none';
    image.style.display = '';
  });
  document.querySelectorAll('.step h2').forEach(title => {
    title.style.fontSize = '1.2rem';
    title.style.opacity = '1';
    title.style.transform = 'none';
    title.style.display = '';
  });
  document.querySelectorAll('.step p').forEach(desc => {
    desc.style.fontSize = '1rem';
    desc.style.opacity = '1';
    desc.style.transform = 'none';
    desc.style.display = '';
  });
}

// Animaciones para cada paso del proceso de certificación
document.addEventListener('DOMContentLoaded', function () {
  const isMobile = window.innerWidth <= 768;

  // Si GSAP o ScrollTrigger no están disponibles -> fallback mostrando todo
  if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
    console.warn('GSAP o ScrollTrigger no están disponibles. Deshabilitando animaciones en proceso-certificacion.');
    showAllSteps();
    return;
  }

  // Registrar plugin de forma segura usando la referencia en window
  try {
    if (typeof window !== 'undefined' && window && window.gsap && typeof window.gsap.registerPlugin === 'function' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
    } else {
      console.warn('ScrollTrigger no disponible en este contexto; se deshabilitan animaciones avanzadas.');
      showAllSteps();
      return;
    }
  } catch (e) {
    console.warn('Error al registrar ScrollTrigger:', e);
    showAllSteps();
    return;
  }

  // Helper seguro para referenciar ScrollTrigger en el resto del archivo
  const ST = (typeof window !== 'undefined' && window && window.ScrollTrigger) ? window.ScrollTrigger : null;

  if (isMobile) {
    // Mostrar todo: pasos, imágenes, títulos y descripciones siempre visibles
    document.querySelectorAll('.step').forEach(step => {
      step.style.opacity = '1';
      step.classList.add('active');
      step.style.transform = 'none';
    });
    document.querySelectorAll('.step-image').forEach(image => {
      image.style.width = '100%';
      image.style.height = 'auto';
      image.style.opacity = '1';
      image.style.transform = 'none';
      image.style.display = '';
    });
    document.querySelectorAll('.step h2').forEach(title => {
      title.style.fontSize = '1.2rem';
      title.style.opacity = '1';
      title.style.transform = 'none';
      title.style.display = '';
    });
    document.querySelectorAll('.step p').forEach(desc => {
      desc.style.fontSize = '1rem';
      desc.style.opacity = '1';
      desc.style.transform = 'none';
      desc.style.display = '';
    });
    // Elimina cualquier animación previa
    gsap.globalTimeline.clear();
    // No ejecutar ninguna animación ni ScrollTrigger en mobile
    return;
  }

  // Animaciones para cada paso del proceso de certificación (desktop/tablet)
  const sections = document.querySelectorAll('.scroll-section');
  let stepIndex = 0;
  let allSteps = [];
  sections.forEach(section => {
    const steps = Array.from(section.querySelectorAll('.step'));
    steps.forEach(step => {
      step.dataset.stackIndex = stepIndex;
      allSteps.push(step);
      stepIndex++;
    });
  });

  // Oculta todos menos el primero
  allSteps.forEach((step, i) => {
    if (i !== 0) step.style.opacity = 0;
    else step.classList.add('active');
  });

  // Animación de entrada por dirección
  function getAnimProps(step) {
    if (step.classList.contains('from-left')) {
      return { x: -100, opacity: 0 };
    } else if (step.classList.contains('from-right')) {
      return { x: 100, opacity: 0 };
    } else if (step.classList.contains('from-up')) {
      return { y: -100, opacity: 0 };
    } else if (step.classList.contains('from-down')) {
      return { y: 100, opacity: 0 };
    }
    return { opacity: 0 };
  }

  allSteps.forEach((step, i) => {
    if (!ST || typeof ST.create !== 'function') return;
    ST.create({
      trigger: step,
      start: 'top 60%',
      onEnter: () => {
        allSteps.forEach((s, idx) => {
          if (idx !== i) {
            gsap.to(s, { opacity: 0, duration: 0.3 });
            s.classList.remove('active');
          }
        });
        step.classList.add('active');
        gsap.fromTo(
          step,
          getAnimProps(step),
          { x: 0, y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
      },
      onLeaveBack: () => {
        gsap.to(step, { opacity: 0, duration: 0.3 });
        step.classList.remove('active');
        if (i > 0) {
          allSteps[i - 1].classList.add('active');
          gsap.to(allSteps[i - 1], { opacity: 1, duration: 0.3 });
        }
      },
      markers: false
    });
  });

  // Animación para las imágenes de los pasos
  document.querySelectorAll('.step-image').forEach(image => {
    if (!ST) return;
    gsap.from(image, {
      scrollTrigger: {
        trigger: image,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power2.out'
    });
  });

  // Animación para los títulos
  document.querySelectorAll('.step h2').forEach(title => {
    if (!ST) return;
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: -40,
      duration: 1.2,
      ease: 'power2.out'
    });
  });

  // Animación para las descripciones
  document.querySelectorAll('.step p').forEach(desc => {
    if (!ST) return;
    gsap.from(desc, {
      scrollTrigger: {
        trigger: desc,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power2.out'
    });
  });

  // Animación de salida de las imágenes al salir de la sección
  document.querySelectorAll('.step-image').forEach(image => {
    if (!ST || typeof ST.create !== 'function') return;
    ST.create({
      trigger: image,
      start: 'bottom 20%',
      onLeave: () => {
        gsap.to(image, { opacity: 0, duration: 0.3 });
      },
      onEnterBack: () => {
        gsap.to(image, { opacity: 1, duration: 0.3 });
      },
      markers: false
    });
  });

  // Animación de salida de los títulos al salir de la sección
  document.querySelectorAll('.step h2').forEach(title => {
    if (!ST || typeof ST.create !== 'function') return;
    ST.create({
      trigger: title,
      start: 'bottom 20%',
      onLeave: () => {
        gsap.to(title, { opacity: 0, duration: 0.3 });
      },
      onEnterBack: () => {
        gsap.to(title, { opacity: 1, duration: 0.3 });
      },
      markers: false
    });
  });

  // Animación de salida de las descripciones al salir de la sección
  document.querySelectorAll('.step p').forEach(desc => {
    if (!ST || typeof ST.create !== 'function') return;
    ST.create({
      trigger: desc,
      start: 'bottom 20%',
      onLeave: () => {
        gsap.to(desc, { opacity: 0, duration: 0.3 });
      },
      onEnterBack: () => {
        gsap.to(desc, { opacity: 1, duration: 0.3 });
      },
      markers: false
    });
  });
});