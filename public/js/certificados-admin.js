document.addEventListener('DOMContentLoaded', function () {
  const infoBox = document.querySelector('.info-box');

  let certificados = [];

  function animateButton(btn) {
    btn.addEventListener('mouseenter', function () {
      if (window.gsap) {
        gsap.to(btn, { scale: 1.08, boxShadow: '0 6px 18px rgba(20,30,60,0.18)', duration: 0.18, ease: 'power2.out' });
      }
    });
    btn.addEventListener('mouseleave', function () {
      if (window.gsap) {
        gsap.to(btn, { scale: 1, boxShadow: '0 2px 8px rgba(20,30,60,0.10)', duration: 0.18, ease: 'power2.out' });
      }
    });
    btn.addEventListener('mousedown', function () {
      if (window.gsap) {
        gsap.to(btn, { scale: 0.93, duration: 0.12, ease: 'power2.in' });
      }
    });
    btn.addEventListener('mouseup', function () {
      if (window.gsap) {
        gsap.to(btn, { scale: 1.08, duration: 0.12, ease: 'power2.out' });
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
      gsap.from('.admin-certificados-header', { opacity: 0, y: 40, duration: 0.7, ease: 'power2.out' });
      gsap.from('.admin-certificados-list', { opacity: 0, y: 40, duration: 0.7, delay: 0.2, ease: 'power2.out' });
    }

    const rows = document.querySelectorAll('.cert-row');
    let detalleRow = null;
    let detalleIdx = null;
    rows.forEach(row => {
      row.addEventListener('click', function (e) {
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
            cssRule: { borderRadius: '2.5rem', boxShadow: '0 0 0 rgba(0,0,0,0)' },
            duration: 0.5,
            ease: 'power2.out'
          });
        } else if (window.gsap) {
          gsap.from('.admin-certificados-detalle-box', { opacity: 0, y: 30, duration: 0.5, ease: 'power2.out' });
        }
        if (btnEdit) {
          btnEdit.onclick = function (e) {
            e.preventDefault();
            mostrarModalEditar(idx);
          };
        }
      });
    });

    document.addEventListener('click', function (e) {
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
        btnAgregar.onclick = function (e) {
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
    document.body.classList.add('modal-open'); // Bloquear scroll del body
    modalEditar.style.display = 'flex';
    setTimeout(() => { modalEditar.style.opacity = '1'; }, 10);
  }
  function ocultarModalEditar() {
    if (modalEditar) {
      modalEditar.style.opacity = '0';
      setTimeout(() => {
        modalEditar.style.display = 'none';
        document.body.classList.remove('modal-open'); // Restaurar scroll del body
      }, 300);
    }
    if (formEditar) formEditar.reset();
    editIdx = null;
  }
  if (cerrarModalEditar) {
    cerrarModalEditar.addEventListener('click', ocultarModalEditar);
  }
  if (modalEditar) {
    modalEditar.addEventListener('click', function (e) {
      if (e.target === modalEditar) ocultarModalEditar();
    });
  }
  if (formEditar) {
    formEditar.addEventListener('submit', function (e) {
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
          if (window.snackbarCambiosGuardados) window.snackbarCambiosGuardados();
        })
        .catch(err => {
          if (window.snackbarCertificadoError) window.snackbarCertificadoError();
          alert(err.message);
        });
    });
  }

  // Ocultar detalle al hacer clic fuera de la tabla
  document.addEventListener('click', function (e) {
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
      document.body.classList.add('modal-open'); // Bloquear scroll del body
      modal.style.display = 'flex';
      setTimeout(() => { modal.style.opacity = '1'; }, 10);
    }
  }
  function ocultarModal() {
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Restaurar scroll del body
      }, 300);
    }
    if (formAgregar) formAgregar.reset();
  }
  if (cerrarModal) {
    cerrarModal.addEventListener('click', ocultarModal);
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) ocultarModal();
    });
  }

  if (formAgregar) {
    formAgregar.addEventListener('submit', function (e) {
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
          if (window.snackbarCertificadoAgregado) window.snackbarCertificadoAgregado();
          if (window.snackbarArchivoCargado) window.snackbarArchivoCargado();
        })
        .catch(err => {
          if (window.snackbarCertificadoError) window.snackbarCertificadoError();
          if (window.snackbarArchivoError) window.snackbarArchivoError();
          alert(err.message);
        });
    });
  }

});

// ================== FUNCIONES DE DIAGNÓSTICO Y GESTIÓN ==================

// Variable global para la URL del backend
const BACKEND_URL = localStorage.getItem('backend_url') || 'http://localhost:8000';

// Función para probar autenticación
async function probarAutenticacion() {
  try {
    console.log('🔐 Probando autenticación...');

    const token = localStorage.getItem('admin_token');
    if (!token) {
      console.log('❌ No hay token guardado');
      return { success: false, message: 'No hay token' };
    }

    console.log('🎫 Token encontrado:', token.substring(0, 20) + '...');

    const response = await fetch(`${BACKEND_URL}/certificados/listar`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Respuesta de autenticación:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Autenticación exitosa. Certificados encontrados:', data.length);
      return { success: true, data: data };
    } else {
      const error = await response.text();
      console.error('❌ Error de autenticación:', error);
      return { success: false, message: error };
    }
  } catch (error) {
    console.error('❌ Error al probar autenticación:', error);
    return { success: false, message: error.message };
  }
}

// Función para crear token de admin (modo desarrollo)
async function crearTokenAdmin() {
  try {
    console.log('🔑 Creando token de administrador...');

    const credenciales = {
      username: "admin",
      password: "admin123"
    };

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credenciales)
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('admin_token', data.access_token);
      console.log('✅ Token de admin creado y guardado');
      mostrarSnackbar('Token de administrador creado exitosamente', 'success');
      return data.access_token;
    } else {
      const error = await response.text();
      console.error('❌ Error al crear token:', error);
      mostrarSnackbar('Error al crear token: ' + error, 'error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en crearTokenAdmin:', error);
    mostrarSnackbar('Error al crear token: ' + error.message, 'error');
    return null;
  }
}

// Función para cargar certificados reales desde el backend
async function cargarCertificadosReales() {
  try {
    console.log('📋 Cargando certificados desde el backend...');

    const authResult = await probarAutenticacion();

    if (authResult.success) {
      const certificados = authResult.data;

      if (certificados.length === 0) {
        console.log('📝 No hay certificados en la base de datos');
        mostrarSnackbar('Base de datos vacía. Haga clic en "Crear Certificado de Prueba" para agregar datos.', 'info');

        // Mostrar botón para crear certificado de prueba
        const container = document.querySelector('.certificados-lista') || document.body;
        if (!document.getElementById('boton-crear-prueba')) {
          const botonPrueba = document.createElement('button');
          botonPrueba.id = 'boton-crear-prueba';
          botonPrueba.className = 'btn btn-primary';
          botonPrueba.innerHTML = '🧪 Crear Certificado de Prueba';
          botonPrueba.onclick = crearCertificadoPrueba;
          botonPrueba.style.margin = '10px';
          container.appendChild(botonPrueba);
        }
      } else {
        console.log('✅ Certificados cargados exitosamente:', certificados.length);

        // Remover el botón de crear prueba si existe
        const botonPrueba = document.getElementById('boton-crear-prueba');
        if (botonPrueba) {
          botonPrueba.remove();
        }

        // Aquí puedes actualizar la interfaz con los certificados reales
        // por ejemplo: actualizarListaCertificados(certificados);
      }

      return certificados;
    } else {
      console.error('❌ Error de autenticación:', authResult.message);
      mostrarSnackbar('Error de autenticación: ' + authResult.message, 'error');
      return [];
    }
  } catch (error) {
    console.error('❌ Error al cargar certificados:', error);
    mostrarSnackbar('Error al cargar certificados: ' + error.message, 'error');
    return [];
  }
}

// Función para crear un certificado de prueba
async function crearCertificadoPrueba() {
  try {
    console.log('🧪 Creando certificado de prueba...');

    // Verificar autenticación primero
    const authResult = await probarAutenticacion();
    if (!authResult.success) {
      console.error('❌ No se pudo autenticar para crear certificado');
      mostrarSnackbar('Error de autenticación. Generando nuevo token...', 'warning');
      await crearTokenAdmin();

      // Reintentar autenticación
      const retryAuth = await probarAutenticacion();
      if (!retryAuth.success) {
        mostrarSnackbar('No se pudo autenticar. Verifique las credenciales.', 'error');
        return null;
      }
    }

    const certificadoData = {
      numero_certificado: `LACS-TEST-${Date.now()}`,
      nombre_completo: "Juan Pérez García",
      cedula: "12345678901",
      curso: "Curso de Manipulación de Alimentos",
      modalidad: "Virtual",
      horas: 40,
      fecha_expedicion: new Date().toISOString().split('T')[0],
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año después
      organizacion_emisora: "LACS - Laboratorio de Análisis y Control Sanitario",
      estado: "vigente"
    };

    console.log('📤 Enviando datos del certificado:', certificadoData);

    const response = await fetch(`${BACKEND_URL}/certificados/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(certificadoData)
    });

    console.log('📡 Respuesta del servidor:', response.status, response.statusText);

    if (response.ok) {
      const resultado = await response.json();
      console.log('✅ Certificado de prueba creado:', resultado);
      mostrarSnackbar('Certificado de prueba creado exitosamente', 'success');

      // Recargar la lista de certificados
      await cargarCertificadosReales();

      return resultado;
    } else {
      const error = await response.text();
      console.error('❌ Error al crear certificado de prueba:', response.status, error);
      mostrarSnackbar(`Error al crear certificado de prueba (${response.status}): ${error}`, 'error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error en crearCertificadoPrueba:', error);
    mostrarSnackbar('Error al crear certificado de prueba: ' + error.message, 'error');
    return null;
  }
}

// Función para diagnosticar el sistema completo
async function diagnosticarSistema() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA');
  console.log('=====================================');

  // 1. Verificar conexión con backend
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    console.log('✅ Backend conectado:', response.status);
  } catch (error) {
    console.log('❌ Backend no disponible:', error.message);
    return;
  }

  // 2. Probar autenticación
  const auth = await probarAutenticacion();
  if (!auth.success) {
    console.log('⚠️ Intentando crear nuevo token...');
    await crearTokenAdmin();
    await probarAutenticacion();
  }

  // 3. Cargar certificados
  await cargarCertificadosReales();

  console.log('🎯 Diagnóstico completo');
}

// Función auxiliar para mostrar mensajes (snackbar)
function mostrarSnackbar(mensaje, tipo = 'info') {
  // Si existe una función global de snackbar, usarla
  if (typeof window.showSnackbar === 'function') {
    window.showSnackbar(mensaje, tipo);
    return;
  }

  // Fallback: usar console y alert simple
  console.log(`${tipo.toUpperCase()}: ${mensaje}`);

  // Crear snackbar simple si no existe
  const snackbar = document.createElement('div');
  snackbar.className = `snackbar snackbar-${tipo}`;
  snackbar.textContent = mensaje;
  snackbar.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${tipo === 'error' ? '#f44336' : tipo === 'warning' ? '#ff9800' : tipo === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;

  document.body.appendChild(snackbar);

  // Animar entrada
  setTimeout(() => {
    snackbar.style.opacity = '1';
  }, 100);

  // Remover después de 3 segundos
  setTimeout(() => {
    snackbar.style.opacity = '0';
    setTimeout(() => {
      if (snackbar.parentNode) {
        snackbar.parentNode.removeChild(snackbar);
      }
    }, 300);
  }, 3000);
}

// Exponer funciones globalmente para depuración
window.diagnosticarSistema = diagnosticarSistema;
window.probarAutenticacion = probarAutenticacion;
window.crearTokenAdmin = crearTokenAdmin;
window.cargarCertificadosReales = cargarCertificadosReales;
window.crearCertificadoPrueba = crearCertificadoPrueba;

// Auto-inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
  console.log('🚀 Sistema de certificados cargado');

  // Realizar diagnóstico inicial después de un breve delay
  setTimeout(() => {
    console.log('🔄 Ejecutando diagnóstico inicial...');
    cargarCertificadosReales();
  }, 1000);
});
