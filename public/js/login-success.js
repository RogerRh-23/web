// Animación de login exitoso con círculos y mensaje personalizado
function animateLoginSuccess(username) {
  const card = document.querySelector('.login-card');
  const header = document.querySelector('.login-header');
  const form = document.getElementById('login-form');
  const btn = document.querySelector('.login-btn');
  const circles = document.querySelectorAll('.login-success-circles .circle');
  const message = document.querySelector('.login-success-message');
  const logo = document.querySelector('.login-success-logo');
  const headerTitle = document.querySelector('.login-header-title');
  const headerDesc = document.querySelector('.login-header-desc');
  // Ocultar campos y texto con animación
  if (header) {
    header.style.transition = 'opacity 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
    header.style.opacity = '0';
    setTimeout(() => { header.style.display = 'none'; }, 500);
  }
  if (form) {
    form.style.transition = 'opacity 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
    form.style.opacity = '0';
    setTimeout(() => { form.style.display = 'none'; }, 500);
  }
  if (btn) {
    btn.style.transition = 'opacity 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
    btn.style.opacity = '0';
    setTimeout(() => { btn.style.display = 'none'; }, 500);
  }
  // Mostrar logo con animación
  setTimeout(() => {
    if (logo) {
      logo.style.display = 'flex';
      setTimeout(() => {
        const img = logo.querySelector('img');
        if (img) img.style.transform = 'scale(1.15)';
      }, 50);
    }
  }, 400);
  // Cambiar color de la card
  if (card) card.classList.add('success');
  // Animar círculos
  setTimeout(() => {
    if (circles[0]) {
      circles[0].style.opacity = '1';
      circles[0].style.transform = 'scale(1.5)';
    }
  }, 600);
  setTimeout(() => {
    if (circles[1]) {
      circles[1].style.opacity = '1';
      circles[1].style.transform = 'scale(1.3)';
    }
  }, 900);
  // Animar mensaje de éxito
  setTimeout(() => {
    if (message) {
      message.style.display = 'block';
      message.style.opacity = '0';
      message.textContent = `¡Bienvenido ${username}! Redirigiendo...`;
      message.style.transition = 'opacity 0.7s cubic-bezier(.68,-0.55,.27,1.55), transform 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
      setTimeout(() => {
        message.style.opacity = '1';
        message.style.transform = 'translateY(0) scale(1.08)';
      }, 50);
    }
  }, 1400);
  // Animar textos de bienvenida (header)
  if (headerTitle) headerTitle.style.transition = 'color 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
  if (headerDesc) headerDesc.style.transition = 'color 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
}

// Ejemplo de uso: llamar esta función cuando el login sea exitoso
// animateLoginSuccess('Roberto');

// Puedes conectar esto con tu lógica de login real
