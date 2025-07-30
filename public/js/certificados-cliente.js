// certificados-cliente.js
// Muestra la información del certificado en la vista cliente

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.certificados-search-form');
  const infoBox = document.querySelector('.info-box');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchValue = document.getElementById('search-cert').value.trim();
    if (!searchValue) return;

    fetch(`/api/certificados/buscar?num=${encodeURIComponent(searchValue)}`)
      .then(res => {
        if (!res.ok) throw new Error('Certificado no encontrado');
        return res.json();
      })
      .then(certificado => {
        infoBox.innerHTML = `
          <div class="certificado-info">
            <h2 class="certificado-titulo"><i class="bi bi-patch-check-fill" style="color:#1976a5"></i> Certificado</h2>
            <div class="certificado-datos">
              <div><strong>Nombre de la organización:</strong> <span id="cert-org">${certificado.org}</span></div>
              <div><strong>Estándar:</strong> <span id="cert-estandar">${certificado.estandar}</span></div>
              <div><strong>Estado/Estatus:</strong> <span id="cert-estado">${certificado.estado}</span></div>
              <div><strong>No. de certificado:</strong> <span id="cert-num">${certificado.num}</span></div>
              <div><strong>Fecha de inicio:</strong> <span id="cert-inicio">${certificado.inicio}</span></div>
              <div><strong>Fecha de finalización:</strong> <span id="cert-fin">${certificado.fin}</span></div>
              <div><strong>Documento cargado:</strong> ${certificado.archivoNombre ? `<a href="https://drive.google.com/file/d/${certificado.archivoId}" target="_blank">${certificado.archivoNombre}</a>` : 'No disponible'}</div>
            </div>
          </div>
        `;
        if (window.gsap) {
          gsap.from('.certificado-info', {opacity: 0, y: 40, duration: 0.7, ease: 'power2.out'});
        }
      })
      .catch(err => {
        infoBox.innerHTML = `<div class="certificado-info-error">${err.message}</div>`;
      });
  });
});
