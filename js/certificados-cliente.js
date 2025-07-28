// certificados-cliente.js
// Muestra la información del certificado en la vista cliente

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.certificados-search-form');
  const infoBox = document.querySelector('.info-box');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchValue = document.getElementById('search-cert').value.trim();
    if (!searchValue) return;

    // Simulación de datos (reemplaza con tu fetch/consulta real)
    const certificado = {
      org: 'LACS S.A. de C.V.',
      estandar: 'ISO 9001',
      estado: 'Vigente',
      num: '2024-00123',
      inicio: '2024-01-01',
      fin: '2025-01-01',
      alcance: 'Certificación de sistemas de gestión de calidad',
      sitio: 'CDMX, México',
      sectores: 'Servicios, Manufactura'
    };

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
          <div><strong>Alcance:</strong> <span id="cert-alcance">${certificado.alcance}</span></div>
          <div><strong>Sitio (ubicación):</strong> <span id="cert-sitio">${certificado.sitio}</span></div>
          <div><strong>Sectores:</strong> <span id="cert-sectores">${certificado.sectores}</span></div>
        </div>
      </div>
    `;
    // Puedes agregar animación GSAP aquí si lo deseas
    if (window.gsap) {
      gsap.from('.certificado-info', {opacity: 0, y: 40, duration: 0.7, ease: 'power2.out'});
    }
  });
});
