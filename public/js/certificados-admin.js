document.addEventListener('DOMContentLoaded', function () {
  const infoBox = document.querySelector('.info-box');

  let certificados = [];

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

  function renderCertificadosUI() {
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
    if (window.gsap) {
      gsap.from('.admin-certificados-header', {opacity: 0, y: 40, duration: 0.7, ease: 'power2.out'});
      gsap.from('.admin-certificados-list', {opacity: 0, y: 40, duration: 0.7, delay: 0.2, ease: 'power2.out'});
    }

    const rows = document.querySelectorAll('.cert-row');
    let detalleRow = null;
    let detalleIdx = null;
    rows.forEach(row => {
      row.addEventListener('click', function(e) {
        const idx = row.getAttribute('data-index');
        if (detalleRow && detalleIdx === idx) {
          detalleRow.remove();
          detalleRow = null;
          detalleIdx = null;
          return;
        }
        if (detalleRow) {
          detalleRow.remove();
          detalleRow = null;
          detalleIdx = null;
        }
        const c = certificados[idx];
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
            <div><strong>Documento cargado:</strong> ${c.archivoNombre ? `<a href="https://drive.google.com/file/d/${c.archivoId}" target="_blank">${c.archivoNombre}</a>` : 'No disponible'}</div>
            <div class="admin-certificados-actions">
              <button class="btn btn-warning" id="btn-edit"><i class="bi bi-pencil-square"></i> Editar</button>
              <button class="btn btn-danger" id="btn-delete"><i class="bi bi-trash"></i> Eliminar</button>
            </div>
          </div>
        </td>`;
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
        if (btnEdit) {
          btnEdit.onclick = function(e) {
            e.preventDefault();
            mostrarModalEditar(idx);
          };
        }
      });
    });

    document.addEventListener('click', function(e) {
      const isRow = e.target.closest('.cert-row');
      const isDetalle = e.target.closest('.admin-certificados-detalle-row');
      if (!isRow && !isDetalle && detalleRow) {
        detalleRow.remove();
        detalleRow = null;
        detalleIdx = null;
      }
    });

    setTimeout(() => {
      const btnAgregar = document.getElementById('btn-add');
      if (btnAgregar) {
        btnAgregar.onclick = function(e) {
          e.preventDefault();
          mostrarModal();
        };
      }
    }, 0);
  }

  function renderCertificados() {
    fetch('/api/certificados', {
      headers: {
        'Authorization': 'Bearer admin-token'
      }
    })
      .then(res => res.json())
      .then(data => {
        certificados = data;
        renderCertificadosUI();
      })
      .catch(() => {
        infoBox.innerHTML = '<div class="admin-certificados-error">No se pudo cargar la lista de certificados.</div>';
      });
  }

  // Inicializar renderizado con datos del backend
  renderCertificados();
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
    // Mostrar nombre del archivo cargado si existe
    let archivoLabel = formEditar.querySelector('#archivoCertificadoLabel');
    if (!archivoLabel) {
      archivoLabel = document.createElement('div');
      archivoLabel.id = 'archivoCertificadoLabel';
      archivoLabel.style.marginTop = '10px';
      formEditar.appendChild(archivoLabel);
    }
    archivoLabel.textContent = cert.archivoNombre ? `Documento cargado: ${cert.archivoNombre}` : 'No hay documento cargado';
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
      const certEditado = {
        org: formEditar['edit-nombreOrg'].value.trim(),
        estandar: formEditar['edit-estandar'].value.trim(),
        estado: formEditar['edit-estatus'].value,
        num: formEditar['edit-numeroCertificado'].value.trim(),
        inicio: formEditar['edit-fechaInicio'].value,
        fin: formEditar['edit-fechaFin'].value
      };
      for (const key in certEditado) {
        if (!certEditado[key]) {
          alert('Por favor completa todos los campos.');
          return;
        }
      }
      fetch(`/api/certificados/${certEditado.num}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify(certEditado)
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al actualizar certificado');
        return res.json();
      })
      .then(() => {
        ocultarModalEditar();
        renderCertificados();
      })
      .catch(err => {
        alert(err.message);
      });
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
      const archivoInput = formAgregar.archivoCertificado;
      const archivo = archivoInput && archivoInput.files[0];
      const formData = new FormData();
      formData.append('nombreOrg', formAgregar.nombreOrg.value.trim());
      formData.append('estandar', formAgregar.estandar.value.trim());
      formData.append('estatus', formAgregar.estatus.value);
      formData.append('numeroCertificado', formAgregar.numeroCertificado.value.trim());
      formData.append('fechaInicio', formAgregar.fechaInicio.value);
      formData.append('fechaFin', formAgregar.fechaFin.value);
      if (archivo) {
        formData.append('archivoCertificado', archivo);
      } else {
        alert('Por favor selecciona un archivo de certificado.');
        return;
      }
      fetch('/api/certificados', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token'
        },
        body: formData
      })
      .then(res => {
        if (!res.ok) throw new Error('Error al agregar certificado');
        return res.json();
      })
      .then(() => {
        ocultarModal();
        renderCertificados();
      })
      .catch(err => {
        alert(err.message);
      });
    });
  }

});
