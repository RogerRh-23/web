// Snackbars JS para certificados y login
// Inserta el HTML de snackbars si no existe

function getSnackbarsContainer() {
    // Busca el contenedor de snackbars en el DOM
    let container = document.getElementById('snackbars-container');
    if (!container) {
        // Si no tiene id, busca por clase .container que tenga notificaciones
        const candidates = document.querySelectorAll('.container');
        for (const c of candidates) {
            if (c.querySelector('.notification')) {
                container = c;
                break;
            }
        }
    }
    return container;
}

function showSnackbar(type, customMessage) {
    const container = getSnackbarsContainer();
    if (!container) return;
    const notif = container.querySelector(`.notification--${type}`);
    if (!notif) return;
    // Cambia el mensaje si se proporciona
    if (customMessage) {
        const msgSpan = notif.querySelector('.notification__message');
        if (msgSpan) msgSpan.textContent = customMessage;
    } else {
        // Si usas i18n, actualiza el texto
        if (window.updateI18nContent) window.updateI18nContent();
    }
    notif.classList.add('active');
    notif.style.display = 'block';
    // Animación de barra de progreso
    const progress = notif.querySelector('.notification__progress');
    if (progress) {
        progress.style.width = '100%';
        progress.style.transition = 'width 3s linear';
        setTimeout(() => { progress.style.width = '0%'; }, 50);
    }
    // Oculta después de 3s
    setTimeout(() => {
        notif.classList.remove('active');
        notif.style.display = 'none';
        if (progress) progress.style.width = '100%';
    }, 3000);
}

// Casos para certificados.html
window.snackbarCertificadoAgregado = function () {
    showSnackbar('success');
};
window.snackbarCertificadoError = function () {
    showSnackbar('error');
};
window.snackbarCambiosGuardados = function () {
    showSnackbar('info');
};
window.snackbarAdvertencia = function () {
    showSnackbar('warning');
};
window.snackbarArchivoCargado = function () {
    showSnackbar('file');
};
window.snackbarArchivoError = function () {
    showSnackbar('file-error');
};

// Casos para login.html
window.snackbarLoginError = function () {
    showSnackbar('error', 'Error al iniciar sesión. Verifica tus credenciales.');
};
window.snackbarLoginSuccess = function () {
    showSnackbar('login-success', '¡Bienvenido de nuevo!');
};
// Snackbar para registro exitoso (sign up)
window.snackbarSignupSuccess = function () {
    showSnackbar('signup-success', 'Usuario registrado exitosamente!');
};

// Casos para dev-panel.html
window.snackbarUsuarioCreado = function () {
    showSnackbar('user-created');
};
window.snackbarUsuarioError = function () {
    showSnackbar('user-error');
};

// Ejemplo de uso en dev-panel.html:
// window.snackbarUsuarioCreado();
// window.snackbarUsuarioError();
