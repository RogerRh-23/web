// JS para crear administradores desde el panel dev
const form = document.getElementById('create-admin-form');
const msg = document.getElementById('msg-create-admin');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'msg';
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const devToken = localStorage.getItem('dev_token');
    if (!devToken) {
      msg.textContent = 'No hay token de desarrollador. Inicia sesión como dev.';
      msg.classList.add('error');
      return;
    }
    if (!username || !email || !password) {
      msg.textContent = 'Por favor completa todos los campos.';
      msg.classList.add('error');
      return;
    }
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + devToken
        },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        msg.textContent = data.msg || 'Administrador creado correctamente.';
        msg.classList.add('success');
        form.reset();
        if (window.snackbarUsuarioCreado) window.snackbarUsuarioCreado();
      } else {
        msg.textContent = data.detail || 'Error al crear administrador.';
        msg.classList.add('error');
        if (window.snackbarUsuarioError) window.snackbarUsuarioError();
      }
    } catch (err) {
      msg.textContent = 'Error de red o servidor.';
      msg.classList.add('error');
      if (window.snackbarUsuarioError) window.snackbarUsuarioError();
    }
  });
}
