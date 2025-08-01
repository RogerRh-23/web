// Diagrama interactivo del Proceso de Certificación con GSAP
// Requiere GSAP y DrawSVGPlugin

document.addEventListener('DOMContentLoaded', function() {
  const steps = [
    {
      id: 'solicitud',
      title: 'Solicitud de información',
      desc: 'La organización solicita por medio de página web, teléfono o vía correo electrónico información del servicio de certificación en la normativa aplicable.'
    },
    {
      id: 'propuesta',
      title: 'Propuesta de servicios',
      desc: 'El ejecutivo de ventas se contacta con el prospecto enviando el formato de Cuestionario y solicitud de servicios y Anexo de cotización para obtener la información de la organización solicitante. Con la información obtenida se realiza la Propuesta de servicios para el ciclo de certificación inicial, se envía para aprobación y firmas tanto de LACS como de la Organización solicitante.'
    },
    {
      id: 'contrato',
      title: 'Contrato',
      desc: 'Aceptada la Propuesta de servicios, se realiza la firma del Acuerdo legal de la prestación de servicios por parte del Organismo de Certificación (LACS) y la Organización solicitante.'
    },
    {
      id: 'etapa1',
      title: 'Auditoría Etapa 1',
      desc: 'El personal de LACS programa la Etapa 1, asigna el equipo auditor y notifica a la organización. El equipo auditor realiza revisión documental, evaluación inicial y detecta posibles incumplimientos para Etapa 2. Hallazgos deben atenderse en máximo 45 días naturales (plan de acción). La implementación se revisa en Etapa 2.'
    },
    {
      id: 'etapa2',
      title: 'Auditoría Etapa 2',
      desc: 'LACS programa la Etapa 2 dentro de los 120 días de la Etapa 1. El equipo auditor evalúa la implementación, eficacia y cumplimiento de la norma.'
    },
    {
      id: 'hallazgos',
      title: 'Hallazgos',
      desc: 'Si hay hallazgos tras Etapa 2, la organización presenta plan de acción en 15 días y acciones implementadas en 40 días para cierre.'
    },
    {
      id: 'decision',
      title: 'Toma de decisión',
      desc: 'El Comité Técnico de LACS revisa el expediente y la recomendación del equipo auditor para decidir sobre la certificación.'
    },
    {
      id: 'otorgamiento',
      title: 'Otorgamiento de la certificación',
      desc: 'LACS emite el certificado con vigencia de 3 años.'
    },
    {
      id: 'mantenimiento',
      title: 'Auditorías de mantenimiento',
      desc: 'Se realizan 2 auditorías de vigilancia: la 1ra antes de 12 meses y la 2da antes de 24-26 meses. La toma de decisión es igual que en Etapa 2.'
    },
    {
      id: 'renovacion',
      title: 'Auditorías de Renovación',
      desc: 'La organización puede renovar por 3 años más. Se recomienda auditar 3 meses antes del vencimiento. Se realiza auditoría, atención de hallazgos, revisión y decisión de renovar.'
    },
    {
      id: 'restauracion',
      title: 'Auditoría de Restauración',
      desc: 'Si no se renueva a tiempo o hay suspensión/cancelación, la certificación puede restaurarse en 6 meses: auditoría, atención de hallazgos, revisión y decisión de restaurar.'
    }
  ];

  // Solo lógica de flechas: asume estructura HTML ya existe
  const main = document.querySelector('.proceso-main-v4');
  const arrowsLayer = document.querySelector('.proceso-arrows-layer-v4');
  const stepsBox = document.querySelector('.proceso-diagrama-steps-v4');
  if (!main || !arrowsLayer || !stepsBox) return;
  // SVG marker global (solo una vez)
  if (!document.getElementById('arrowhead')) {
    const svgDefs = document.createElement('div');
    svgDefs.innerHTML = `<svg width="0" height="0"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#1877f3"/></marker></defs></svg>`;
    document.body.appendChild(svgDefs);
  }

  // Flechas con ScrollTrigger: solo se dibuja la flecha activa
  let arrowTriggers = [];
  function drawArrow(i) {
    arrowsLayer.innerHTML = '';
    const fromCircle = stepsBox.children[i].querySelector('.proceso-step-circle');
    const toCircle = stepsBox.children[i+1].querySelector('.proceso-step-circle');
    const mainRect = main.getBoundingClientRect();
    const fromRect = fromCircle.getBoundingClientRect();
    const toRect = toCircle.getBoundingClientRect();
    const svgWidth = mainRect.width;
    const svgHeight = mainRect.height;
    const startX = (fromRect.left + fromRect.width/2) - mainRect.left;
    const startY = (fromRect.bottom) - mainRect.top;
    const endX = (toRect.left + toRect.width/2) - mainRect.left;
    const endY = (toRect.top) - mainRect.top;
    const midX = (startX + endX) / 2;
    let curve = Math.max(60, Math.abs(endY - startY) * 0.4);
    let midY;
    // Personalización de curvatura por flecha
    if (i === 0) { // 1-2
      // Curva baja y desplazada hacia abajo para no cruzar el texto
      curve = Math.max(120, Math.abs(endY - startY) * 0.7);
      midY = Math.max(startY, endY) + 60; // fuerza la curva por debajo de ambos círculos
    } else if (i === 1) { // 2-3
      curve = Math.max(30, Math.abs(endY - startY) * 0.18);
      midY = startY + (endY - startY) / 2 - curve;
    } else if (i === 2) { // 3-4
      curve = Math.max(120, Math.abs(endY - startY) * 0.7);
      midY = Math.max(startY, endY) + 60;
    } else if (i === 6) { // 7-8
      curve = Math.max(60, Math.abs(endY - startY) * 0.45);
      midY = startY + (endY - startY) / 2 + curve;
    } else if (i === 7) { // 8-9
      curve = Math.max(60, Math.abs(endY - startY) * 0.55);
      midY = startY + (endY - startY) / 2 - curve;
    } else if (i === 8) { // 9-10
      curve = Math.max(60, Math.abs(endY - startY) * 0.45);
      midY = startY + (endY - startY) / 2 + curve;
    } else {
      midY = startY + (endY - startY) / 2 + (i % 2 === 0 ? -curve : curve);
    }
    // Oculta la punta de la flecha durante la animación y la anima con escala
    const path = `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'proceso-arrow-svg-v4');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('style', `overflow:visible; position:absolute; left:0; top:0; z-index:10; pointer-events:none;`);
    // marker-end solo se agrega al final de la animación
    svg.innerHTML = `<path d="${path}" stroke="#1877f3" stroke-width="5" fill="none" marker-end="url(#arrowhead)"/>`;
    arrowsLayer.appendChild(svg);
    const pathEl = svg.querySelector('path');
    gsap.set(pathEl, {drawSVG: '0%'});
    // Oculta la punta al inicio y la muestra con opacidad al final
    const markerPath = document.querySelector('marker#arrowhead path');
    if (markerPath) {
      markerPath.style.opacity = '0';
    }
    gsap.to(pathEl, {
      drawSVG: '100%',
      duration: 1.1,
      ease: 'power1.inOut',
      onComplete: () => {
        if (markerPath) {
          gsap.to(markerPath, {opacity: 1, duration: 0.35, ease: 'power1.out'});
        }
      }
    });
  }
  function clearArrow() {
    arrowsLayer.innerHTML = '';
  }
  function setupArrowScrollTriggers() {
    arrowTriggers.forEach(t => t.kill());
    arrowTriggers = [];
    for (let i = 0; i < stepsBox.children.length - 1; i++) {
      arrowTriggers.push(ScrollTrigger.create({
        trigger: stepsBox.children[i],
        start: 'bottom 60%',
        end: 'bottom 50%',
        onEnter: () => drawArrow(i),
        onEnterBack: () => clearArrow()
      }));
    }
    ScrollTrigger.refresh();
  }
  setupArrowScrollTriggers();
  window.addEventListener('resize', setupArrowScrollTriggers);

  // No hay stepper central, solo bloques distribuidos
});
