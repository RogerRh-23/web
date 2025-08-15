function preventScreenshot() {
    document.addEventListener('keydown', function (e) {
        // Bloquea PrintScreen y combinaciones comunes
        if (
            e.key === 'PrintScreen' ||
            (e.ctrlKey && e.key === 'p') ||
            (e.metaKey && e.key === 'p')
        ) {
            e.preventDefault();
            alert('Las capturas de pantalla están deshabilitadas en este sitio.');
        }
    });

    // Intenta borrar el portapapeles si se presiona PrintScreen
    window.addEventListener('keyup', function (e) {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
        }
    });
}

