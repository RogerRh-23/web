document.addEventListener('DOMContentLoaded', function () {
  const infoBox = document.querySelector('.info-box');

  // Simulación de lista de certificados
  const certificados = [
    {
      org: 'LACS S.A. de C.V.',
      estandar: 'ISO 9001',
      estado: 'Vigente',
      num: '2024-0123',
      inicio: '2024-01-01',
      fin: '2025-01-01',
      alcance: 'Certificación de sistemas de gestión de calidad',
      sitio: 'CDMX, México',
      sectores: 'Servicios, Manufactura'
    },
    {
      org: 'Empresa XYZ',
      estandar: 'ISO 27001',
      estado: 'Suspendido',
      num: '2023-00077',
      inicio: '2024-01-01',
      fin: '2025-01-01',
      alcance: 'Gestión de seguridad de la información',
      sitio: 'Guadalajara, México',
      sectores: 'TI, Servicios'
    }
  ];

  function renderCertificados() {
    // Animaciones GSAP para botones de detalle
    function animateButton(btn) {
      btn.addEventListener('mouseenter', function() {
        if (window.gsap) {
          gsap.to(btn, {scale: 1.08, boxShadow: '0 6px 18px rgba(20,30,60,0.18)', duration: 0.18, ease: 'power2.out'});
        }
      });
      btn.addEventListener('mouseleave', function() {
        if (window.gsap) {
          gsap.to(btn, {scale: 1, boxShadow: '0 2px 8px rgba(20,30,60,0.10)', duration: 0.18, ease: 'power2.out'});
        }
      });
      btn.addEventListener('mousedown', function() {
        if (window.gsap) {
          gsap.to(btn, {scale: 0.93, duration: 0.12, ease: 'power2.in'});
        }
      });
      btn.addEventListener('mouseup', function() {
        if (window.gsap) {
          gsap.to(btn, {scale: 1.08, duration: 0.12, ease: 'power2.out'});
        }
      });
    }
    infoBox.innerHTML = `
      <div class="admin-certificados-header">
        <h2><i class="bi bi-shield-lock-fill" style="color:#1976a5"></i> Administración de Certificados</h2>
        <div class="admin-certificados-actions">
          <button class="btn btn-success" id="btn-add"><i class="bi bi-plus-lg"></i> Agregar nuevo certificado</button>
        </div>
      </div>
      <div class="admin-certificados-list">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Organización</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${certificados.map((c, i) => `
              <tr class="cert-row" data-index="${i}" style="cursor:pointer;">
                <td>${c.org}</td>
                <td>${c.estado}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="admin-certificados-detalle" style="display:none;"></div>
      </div>
    `;
    // Animación GSAP
    if (window.gsap) {
      gsap.from('.admin-certificados-header', {opacity: 0, y: 40, duration: 0.7, ease: 'power2.out'});
      gsap.from('.admin-certificados-list', {opacity: 0, y: 40, duration: 0.7, delay: 0.2, ease: 'power2.out'});
    }

    // Interacción para mostrar detalle y botones
    const rows = document.querySelectorAll('.cert-row');
    let detalleRow = null;
    let detalleIdx = null;
    rows.forEach(row => {
      row.addEventListener('click', function(e) {
        const idx = row.getAttribute('data-index');
        // Si ya está abierto y se hace clic en la misma fila, ocultar
        if (detalleRow && detalleIdx === idx) {
          detalleRow.remove();
          detalleRow = null;
          detalleIdx = null;
          return;
        }
        // Elimina cualquier detalle abierto
        if (detalleRow) {
          detalleRow.remove();
          detalleRow = null;
          detalleIdx = null;
        }
        const c = certificados[idx];
        // Crea la fila de detalle justo debajo de la seleccionada
        detalleRow = document.createElement('tr');
        detalleRow.className = 'admin-certificados-detalle-row';
        detalleRow.innerHTML = `<td colspan="2">
          <div class="admin-certificados-detalle-box">
            <h3><i class="bi bi-building"></i> ${c.org}</h3>
            <div><strong>Estándar:</strong> ${c.estandar}</div>
            <div><strong>Estatus:</strong> ${c.estado}</div>
            <div><strong>No. Certificado:</strong> ${c.num}</div>
            <div><strong>Fecha de inicio:</strong> ${c.inicio}</div>
            <div><strong>Fecha de finalización:</strong> ${c.fin}</div>
            <div><strong>Alcance:</strong> ${c.alcance}</div>
            <div><strong>Sitio:</strong> ${c.sitio}</div>
            <div><strong>Sectores:</strong> ${c.sectores}</div>
            <div class="admin-certificados-actions">
              <button class="btn btn-warning" id="btn-edit"><i class="bi bi-pencil-square"></i> Editar</button>
              <button class="btn btn-danger" id="btn-delete"><i class="bi bi-trash"></i> Eliminar</button>
            </div>
          </div>
        </td>`;
        // Animar botones de detalle
        const btnEdit = detalleRow.querySelector('#btn-edit');
        const btnDelete = detalleRow.querySelector('#btn-delete');
        animateButton(btnEdit);
        animateButton(btnDelete);
        row.parentNode.insertBefore(detalleRow, row.nextSibling);
        detalleIdx = idx;
        if (window.gsap && window.CSSRulePlugin) {
          const rule = CSSRulePlugin.getRule('.admin-certificados-detalle-box');
          gsap.from('.admin-certificados-detalle-box', {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: 'power2.out'
          });
          gsap.from(rule, {
            cssRule: {borderRadius: '2.5rem', boxShadow: '0 0 0 rgba(0,0,0,0)'},
            duration: 0.5,
            ease: 'power2.out'
          });
        } else if (window.gsap) {
          gsap.from('.admin-certificados-detalle-box', {opacity: 0, y: 30, duration: 0.5, ease: 'power2.out'});
        }
        // Lógica para mostrar el modal de edición
        if (btnEdit) {
          btnEdit.onclick = function(e) {
            e.preventDefault();
            mostrarModalEditar(idx);
          };
        }
      });
    });
  // Modal editar certificado
  const modalEditar = document.getElementById('modalEditarCertificado');
  const cerrarModalEditar = document.getElementById('cerrarModalEditar');
  const formEditar = document.getElementById('formEditarCertificado');
  let editIdx = null;

  function mostrarModalEditar(idx) {
    if (!modalEditar || !formEditar) return;
    const cert = certificados[idx];
    editIdx = idx;
    // Rellenar campos
    formEditar['edit-nombreOrg'].value = cert.org;
    formEditar['edit-estandar'].value = cert.estandar;
    formEditar['edit-estatus'].value = cert.estado;
    formEditar['edit-numeroCertificado'].value = cert.num;
    formEditar['edit-fechaInicio'].value = cert.inicio;
    formEditar['edit-fechaFin'].value = cert.fin;
    formEditar['edit-alcance'].value = cert.alcance;
    formEditar['edit-sitio'].value = cert.sitio;
    formEditar['edit-sectores'].value = cert.sectores;
    modalEditar.style.display = 'flex';
    setTimeout(() => { modalEditar.style.opacity = '1'; }, 10);
  }
  function ocultarModalEditar() {
    if (modalEditar) {
      modalEditar.style.opacity = '0';
      setTimeout(() => { modalEditar.style.display = 'none'; }, 300);
    }
    if (formEditar) formEditar.reset();
    editIdx = null;
  }
  if (cerrarModalEditar) {
    cerrarModalEditar.addEventListener('click', ocultarModalEditar);
  }
  if (modalEditar) {
    modalEditar.addEventListener('click', function(e) {
      if (e.target === modalEditar) ocultarModalEditar();
    });
  }
  if (formEditar) {
    formEditar.addEventListener('submit', function(e) {
      e.preventDefault();
      if (editIdx === null) return;
      // Validación simple
      const certEditado = {
        org: formEditar['edit-nombreOrg'].value.trim(),
        estandar: formEditar['edit-estandar'].value.trim(),
        estado: formEditar['edit-estatus'].value,
        num: formEditar['edit-numeroCertificado'].value.trim(),
        inicio: formEditar['edit-fechaInicio'].value,
        fin: formEditar['edit-fechaFin'].value,
        alcance: formEditar['edit-alcance'].value.trim(),
        sitio: formEditar['edit-sitio'].value.trim(),
        sectores: formEditar['edit-sectores'].value.trim()
      };
      for (const key in certEditado) {
        if (!certEditado[key]) {
          alert('Por favor completa todos los campos.');
          return;
        }
      }
      certificados[editIdx] = certEditado;
      ocultarModalEditar();
      renderCertificados();
    });
  }

    // Ocultar detalle al hacer clic fuera de la tabla
    document.addEventListener('click', function(e) {
      const isRow = e.target.closest('.cert-row');
      const isDetalle = e.target.closest('.admin-certificados-detalle-row');
      if (!isRow && !isDetalle && detalleRow) {
        detalleRow.remove();
        detalleRow = null;
        detalleIdx = null;
      }
    });
  }

  renderCertificados();
  // Asignar evento al botón agregar después de renderizar
  setTimeout(() => {
    const btnAgregar = document.getElementById('btn-add');
    if (btnAgregar) {
      btnAgregar.onclick = function(e) {
        e.preventDefault();
        mostrarModal();
      };
    }
  }, 0);

   // Modal agregar certificado
  const modal = document.getElementById('modalAgregarCertificado');
  const cerrarModal = document.getElementById('cerrarModalCertificado');
  const formAgregar = document.getElementById('formAgregarCertificado');
  let btnAgregar = null;

  function mostrarModal() {
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => { modal.style.opacity = '1'; }, 10);
    }
  }
  function ocultarModal() {
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    if (formAgregar) formAgregar.reset();
  }
  if (cerrarModal) {
    cerrarModal.addEventListener('click', ocultarModal);
  }
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) ocultarModal();
    });
  }

  if (formAgregar) {
    formAgregar.addEventListener('submit', function(e) {
      e.preventDefault();
      // Validación simple
      const nuevoCert = {
        org: formAgregar.nombreOrg.value.trim(),
        estandar: formAgregar.estandar.value.trim(),
        estado: formAgregar.estatus.value,
        num: formAgregar.numeroCertificado.value.trim(),
        inicio: formAgregar.fechaInicio.value,
        fin: formAgregar.fechaFin.value,
        alcance: formAgregar.alcance.value.trim(),
        sitio: formAgregar.sitio.value.trim(),
        sectores: formAgregar.sectores.value.trim()
      };
      // Validar campos obligatorios
      for (const key in nuevoCert) {
        if (!nuevoCert[key]) {
          alert('Por favor completa todos los campos.');
          return;
        }
      }
      certificados.push(nuevoCert);
      ocultarModal();
      renderCertificados();
    });
  }

  // Aquí puedes agregar lógica para los botones (Agregar, Editar, Eliminar)
  // Por ahora solo muestra la interfaz
});
