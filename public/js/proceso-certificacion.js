gsap.registerPlugin(ScrollTrigger);

// Animaciones para cada paso del proceso de certificación

document.addEventListener('DOMContentLoaded', function () {
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
    ScrollTrigger.create({
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
});

// Animación para las imágenes de los pasos
document.querySelectorAll('.step-image').forEach(image => {
  gsap.from(image, {
    scrollTrigger: {
      trigger: image,
      start: 'top 80%',
      toggleActions: 'play reverse play reverse'
    },
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: 'power2.out'
  });
});

// Animación para los títulos
document.querySelectorAll('.step h2').forEach(title => {
  gsap.from(title, {
    scrollTrigger: {
      trigger: title,
      start: 'top 80%',
      toggleActions: 'play reverse play reverse'
    },
    opacity: 0,
    y: -40,
    duration: 1.2,
    ease: 'power2.out'
  });
});

// Animación para las descripciones
document.querySelectorAll('.step p').forEach(desc => {
  gsap.from(desc, {
    scrollTrigger: {
      trigger: desc,
      start: 'top 80%',
      toggleActions: 'play reverse play reverse'
    },
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: 'power2.out'
  });
});

// Animación de salida de las imágenes al salir de la sección
document.querySelectorAll('.step-image').forEach(image => {
  ScrollTrigger.create({
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
  ScrollTrigger.create({
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
  ScrollTrigger.create({
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