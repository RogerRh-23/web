/**
 * Gestor de Certificados
 * Maneja todas las operaciones CRUD de certificados con control de roles
 */

class CertificadosManager {
    constructor() {
        this.currentUser = null;
        this.currentCertificate = null;
        // Usar origin actual (funciona en localhost y Railway)
        this.backendBaseURL = window.location.origin;
        this.baseURL = this.backendBaseURL + '/certificados';
        this.init();
    }

    async init() {
        await this.checkUserRole();
        this.setupEventListeners();
        this.setupUIBasedOnRole();

        if (this.isAdmin()) {
            setTimeout(() => {
                this.activateAdminModeAutomatically();
                this.cargarListaAdmin();
            }, 500);
        }
    }



    async checkUserRole() {
        const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

        if (!token) {
            this.currentUser = null;
            return;
        }

        try {
            const response = await fetch(this.backendBaseURL + '/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = {
                    username: data.user || data.username,
                    role: data.role,
                    token: token
                };
            } else {
                this.currentUser = null;
            }
        } catch (error) {
            // Si hay error de conexión, activar modo admin temporal
            this.currentUser = {
                username: 'admin',
                role: 'admin',
                token: token
            };
        }
    }

    setupUIBasedOnRole() {
        const adminActions = document.getElementById('adminActions');
        const adminListaCertificados = document.getElementById('adminListaCertificados');
        const certificadoAdminActions = document.querySelector('.certificado-admin-actions');

        if (this.isAdmin()) {
            if (adminActions) {
                adminActions.style.display = 'flex';
                adminActions.style.visibility = 'visible';
            }
            if (adminListaCertificados) {
                adminListaCertificados.style.display = 'block';
                adminListaCertificados.style.visibility = 'visible';
            }
            if (certificadoAdminActions) {
                certificadoAdminActions.style.display = 'flex';
                certificadoAdminActions.style.visibility = 'visible';
            }
        } else {
            if (adminActions) adminActions.style.display = 'none';
            if (adminListaCertificados) adminListaCertificados.style.display = 'none';
            if (certificadoAdminActions) certificadoAdminActions.style.display = 'none';
        }
    } setupEventListeners() {
        // Búsqueda de certificados
        const formBuscar = document.getElementById('formBuscarCertificado');
        if (formBuscar) {
            formBuscar.addEventListener('submit', (e) => this.buscarCertificado(e));
        }

        // Botones de administrador - Solo admin/dev
        const btnAgregar = document.getElementById('btnAgregarCertificado');
        const btnRefrescar = document.getElementById('btnRefrescarLista');
        const btnExpandir = document.getElementById('btnExpandirDetalles');

        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                if (this.isAdmin()) this.mostrarModalAgregar();
                else this.mostrarMensaje('Solo administradores pueden agregar certificados', 'error');
            });
        }
        if (btnRefrescar) {
            btnRefrescar.addEventListener('click', () => {
                if (this.isAdmin()) this.cargarListaAdmin();
                else this.mostrarMensaje('Solo administradores pueden refrescar la lista', 'error');
            });
        }
        if (btnExpandir) {
            btnExpandir.addEventListener('click', () => this.toggleDetallesCertificado());
        }

        // Formularios de agregar y editar - Solo admin/dev
        const formAgregar = document.getElementById('formAgregarCertificado');
        const formEditar = document.getElementById('formEditarCertificado');

        if (formAgregar) formAgregar.addEventListener('submit', (e) => {
            if (this.isAdmin()) this.agregarCertificado(e);
            else {
                e.preventDefault();
                this.mostrarMensaje('Solo administradores pueden crear certificados', 'error');
            }
        });
        if (formEditar) formEditar.addEventListener('submit', (e) => {
            if (this.isAdmin()) this.editarCertificado(e);
            else {
                e.preventDefault();
                this.mostrarMensaje('Solo administradores pueden editar certificados', 'error');
            }
        });

        // Botones de edición y eliminación - Solo admin/dev
        const btnEditar = document.getElementById('btnEditarCertificado');
        const btnEliminar = document.getElementById('btnEliminarCertificado');

        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                if (this.isAdmin()) this.mostrarModalEditar();
                else this.mostrarMensaje('Solo administradores pueden editar certificados', 'error');
            });
        }
        if (btnEliminar) {
            btnEliminar.addEventListener('click', () => {
                if (this.isAdmin()) this.eliminarCertificado();
                else this.mostrarMensaje('Solo administradores pueden eliminar certificados', 'error');
            });
        }

        // Cerrar modales con botón X
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModalConConfirmacion());
        });

        // Cerrar modal al hacer clic fuera (con confirmación)
        const modales = document.querySelectorAll('.certificados-modal');
        modales.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModalConConfirmacion();
                }
            });
        });
    }

    async buscarCertificado(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const numeroCertificado = formData.get('numeroCertificado');
        const nombreEmpresa = formData.get('nombreEmpresa');
        const idEmpresa = formData.get('idEmpresa');

        if (!numeroCertificado && !nombreEmpresa && !idEmpresa) {
            this.mostrarMensaje('Debe completar al menos un campo de búsqueda', 'warning');
            return;
        }

        try {
            const params = new URLSearchParams();
            if (numeroCertificado) params.append('numero_certificado', numeroCertificado);
            if (nombreEmpresa) params.append('nombre_empresa', nombreEmpresa);
            if (idEmpresa) params.append('id_empresa', idEmpresa);

            const response = await fetch(`${this.baseURL}/buscar/publico?${params}`);

            if (response.ok) {
                const certificado = await response.json();
                this.mostrarCertificado(certificado);
                this.currentCertificate = certificado;
            } else {
                const error = await response.json();
                this.mostrarMensaje(error.detail || 'Certificado no encontrado', 'error');
                this.ocultarCertificado();
            }
        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.mostrarMensaje('Error de conexión', 'error');
            this.ocultarCertificado();
        }
    }

    mostrarCertificado(certificado) {
        // Almacenar certificado actual
        this.currentCertificate = certificado;

        const resultado = document.getElementById('certificadoResultado');
        const resumen = document.getElementById('certificadoResumen');
        const datos = document.getElementById('certificadoDatos');
        const qrContainer = document.getElementById('certificadoQR');
        const archivoContainer = document.getElementById('certificadoArchivo');
        const btnExpandir = document.getElementById('btnExpandirDetalles');

        if (!resultado || !resumen) return;

        // Llenar información resumida (siempre visible)
        resumen.innerHTML = `
            <div class="resumen-item">
                <span class="resumen-label">Empresa:</span>
                <span class="resumen-valor">${certificado.nombre_empresa}</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">ID Empresa:</span>
                <span class="resumen-valor">${certificado.id_empresa}</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">No. Certificado:</span>
                <span class="resumen-valor">${certificado.numero_certificado}</span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">Estado:</span>
                <span class="resumen-valor"><span class="badge badge-${this.getStatusClass(certificado.estado)}">${certificado.estado}</span></span>
            </div>
            <div class="resumen-item">
                <span class="resumen-label">Fecha de Vigencia:</span>
                <span class="resumen-valor">${certificado.fecha_vigencia}</span>
            </div>
        `;

        // Llenar información detallada (expandible)
        if (datos) {
            datos.innerHTML = `
                <div><strong>Fecha de emisión:</strong> ${certificado.fecha_emision}</div>
                <div><strong>Sector IAF:</strong> ${certificado.sector_iaf}</div>
                <div><strong>Código NACE:</strong> ${certificado.codigo_nace}</div>
                <div><strong>Referencia normativa:</strong> ${certificado.referencia_normativa}</div>
                <div><strong>Alcance de la certificación:</strong> ${certificado.alcance_certificacion}</div>
                <div><strong>Instalaciones:</strong> 
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${certificado.instalaciones.map(inst => `<li>${inst}</li>`).join('')}
                    </ul>
                </div>
                <div><strong>Link IAF:</strong> <a href="${certificado.link_iaf}" target="_blank" rel="noopener">${certificado.link_iaf}</a></div>
            `;
        }

        // Mostrar código QR si existe
        if (qrContainer && certificado.codigo_qr) {
            qrContainer.innerHTML = `
                <h4>Código QR</h4>
                <img src="${certificado.codigo_qr}" alt="Código QR" style="max-width: 200px;">
            `;
        }

        // Mostrar link al PDF si existe
        if (archivoContainer && certificado.archivo_pdf) {
            archivoContainer.innerHTML = `
                <a href="/certificados/download/${certificado._id}" target="_blank" class="btn btn-primary">
                    <i class="bi bi-file-pdf"></i> Descargar PDF
                </a>
            `;
        }

        // Resetear botón de expandir
        if (btnExpandir) {
            btnExpandir.innerHTML = '<i class="bi bi-chevron-down"></i> Ver información completa';
            document.getElementById('certificadoDetalles').style.display = 'none';
        }

        resultado.style.display = 'block';

        // Mostrar botones de administrador si aplica
        setTimeout(() => {
            const adminActions = document.querySelector('.certificado-admin-actions');
            if (adminActions && this.isAdmin()) {
                adminActions.style.display = 'flex';
                adminActions.style.visibility = 'visible';
                adminActions.style.opacity = '1';
                // Forzar repaint
                adminActions.offsetHeight;
            }
        }, 100);

        this.setupUIBasedOnRole();
    }

    ocultarCertificado() {
        const resultado = document.getElementById('certificadoResultado');
        if (resultado) resultado.style.display = 'none';
        this.currentCertificate = null;
    }

    getStatusClass(estado) {
        const statusMap = {
            'Vigente': 'success',
            'Suspendido': 'warning',
            'Vencido': 'danger',
            'Cancelado': 'secondary'
        };
        return statusMap[estado] || 'secondary';
    }



    mostrarModalAgregar() {
        if (!this.isAdmin()) {
            this.mostrarMensaje('Solo administradores y desarrolladores pueden agregar certificados', 'error');
            return;
        }

        // Cerrar todos los modales antes de abrir el modal de agregar
        this.cerrarModales();

        const modal = document.getElementById('modalAgregarCertificado');
        if (modal) {
            this.limpiarFormularios();
            modal.style.display = 'block';
        }
    }

    mostrarModalEditar() {
        if (!this.isAdmin()) {
            this.mostrarMensaje('Solo administradores y desarrolladores pueden editar certificados', 'error');
            return;
        }

        if (!this.currentCertificate) {
            this.mostrarMensaje('Debe seleccionar un certificado para editar', 'warning');
            return;
        }

        // Cerrar todos los modales antes de abrir el modal de edición
        this.cerrarModales();

        const modal = document.getElementById('modalEditarCertificado');
        const form = document.getElementById('formEditarCertificado');

        if (!modal || !form) return;

        // Llenar formulario con datos actuales
        const cert = this.currentCertificate;
        document.getElementById('edit-certificado-id').value = cert._id || '';
        document.getElementById('edit-nombreEmpresa').value = cert.nombre_empresa || '';
        document.getElementById('edit-numeroCertificado').value = cert.numero_certificado || '';
        document.getElementById('edit-idEmpresa').value = cert.id_empresa || '';
        document.getElementById('edit-estado').value = cert.estado || '';
        document.getElementById('edit-fechaEmision').value = cert.fecha_emision || '';
        document.getElementById('edit-fechaVigencia').value = cert.fecha_vigencia || '';
        document.getElementById('edit-sectorIaf').value = cert.sector_iaf || '';
        document.getElementById('edit-codigoNace').value = cert.codigo_nace || '';
        document.getElementById('edit-referenciaNormativa').value = cert.referencia_normativa || '';
        document.getElementById('edit-alcanceCertificacion').value = cert.alcance_certificacion || '';
        document.getElementById('edit-linkIaf').value = cert.link_iaf || '';

        // Llenar instalaciones
        const editContainer = document.getElementById('edit-instalaciones-container');
        editContainer.innerHTML = '';
        if (cert.instalaciones && cert.instalaciones.length > 0) {
            cert.instalaciones.forEach(instalacion => {
                const div = document.createElement('div');
                div.className = 'instalacion-input-group';
                div.innerHTML = `
                    <input type="text" name="instalaciones[]" value="${instalacion}" required>
                    <button type="button" class="btn-remove-instalacion" onclick="removeInstalacion(this)">×</button>
                `;
                editContainer.appendChild(div);
            });
        } else {
            // Si no hay instalaciones, agregar una vacía
            const div = document.createElement('div');
            div.className = 'instalacion-input-group';
            div.innerHTML = `
                <input type="text" name="instalaciones[]" placeholder="Ej: Oficina Central - Av. Principal 123, Ciudad" required>
                <button type="button" class="btn-remove-instalacion" onclick="removeInstalacion(this)">×</button>
            `;
            editContainer.appendChild(div);
        }

        // Bloquear scroll del body y mostrar modal
        document.body.classList.add('modal-open');
        modal.style.display = 'block';
    }

    async agregarCertificado(e) {
        e.preventDefault();
        if (!this.isAdmin()) return;

        const formData = new FormData(e.target);

        // Recoger instalaciones del formulario de agregar
        const instalaciones = Array.from(document.querySelectorAll('#modalAgregarCertificado input[name="instalaciones[]"]'))
            .map(input => input.value.trim())
            .filter(value => value.length > 0);

        const certificadoData = {
            nombre_empresa: formData.get('nombreEmpresa'),
            numero_certificado: formData.get('numeroCertificado'),
            id_empresa: formData.get('idEmpresa'),
            estado: formData.get('estado'),
            fecha_emision: formData.get('fechaEmision'),
            fecha_vigencia: formData.get('fechaVigencia'),
            sector_iaf: formData.get('sectorIaf'),
            codigo_nace: formData.get('codigoNace'),
            referencia_normativa: formData.get('referenciaNormativa'),
            alcance_certificacion: formData.get('alcanceCertificacion'),
            instalaciones: instalaciones,
            link_iaf: formData.get('linkIaf')
        }; try {
            const response = await fetch(`${this.baseURL}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(certificadoData)
            });

            if (response.ok) {
                const result = await response.json();
                this.mostrarMensaje('Certificado creado exitosamente', 'success');
                this.cerrarModales();
                e.target.reset();

                // Refrescar lista de administrador
                if (this.isAdmin()) {
                    this.cargarListaAdmin();
                }
            } else {
                const error = await response.json();
                this.mostrarMensaje(error.detail || 'Error al crear certificado', 'error');
            }
        } catch (error) {
            console.error('Error creando certificado:', error);
            this.mostrarMensaje('Error de conexión', 'error');
        }
    }

    async editarCertificado(e) {
        e.preventDefault();
        if (!this.isAdmin() || !this.currentCertificate) return;

        const formData = new FormData(e.target);
        const certificadoId = formData.get('certificadoId');

        // Recoger instalaciones del formulario de editar
        const instalaciones = Array.from(document.querySelectorAll('#modalEditarCertificado input[name="instalaciones[]"]'))
            .map(input => input.value.trim())
            .filter(value => value.length > 0);

        const certificadoData = {
            nombre_empresa: formData.get('nombreEmpresa'),
            numero_certificado: formData.get('numeroCertificado'),
            id_empresa: formData.get('idEmpresa'),
            estado: formData.get('estado'),
            fecha_emision: formData.get('fechaEmision'),
            fecha_vigencia: formData.get('fechaVigencia'),
            sector_iaf: formData.get('sectorIaf'),
            codigo_nace: formData.get('codigoNace'),
            referencia_normativa: formData.get('referenciaNormativa'),
            alcance_certificacion: formData.get('alcanceCertificacion'),
            instalaciones: instalaciones,
            link_iaf: formData.get('linkIaf')
        }; try {
            const response = await fetch(`${this.baseURL}/${certificadoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(certificadoData)
            });

            if (response.ok) {
                this.mostrarMensaje('Certificado actualizado exitosamente', 'success');
                this.cerrarModales();

                // Actualizar certificado actual con los nuevos datos
                Object.assign(this.currentCertificate, certificadoData);
                this.mostrarCertificado(this.currentCertificate);

                // Refrescar lista de administrador si está visible
                if (this.isAdmin()) {
                    this.cargarListaAdmin();
                }
            } else {
                const error = await response.json();
                this.mostrarMensaje(error.detail || 'Error al actualizar certificado', 'error');
            }
        } catch (error) {
            console.error('Error actualizando certificado:', error);
            this.mostrarMensaje('Error de conexión', 'error');
        }
    }

    async eliminarCertificado() {
        if (!this.isAdmin()) {
            this.mostrarMensaje('Solo administradores pueden eliminar certificados', 'error');
            return;
        }

        if (!this.currentCertificate || !this.currentCertificate._id) {
            console.error('No hay certificado seleccionado o ID inválido:', this.currentCertificate);
            this.mostrarMensaje('Error: No hay certificado seleccionado', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres eliminar este certificado?')) return;

        try {
            console.log('Eliminando certificado con ID:', this.currentCertificate._id);
            const response = await fetch(`${this.baseURL}/${this.currentCertificate._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                this.mostrarMensaje('Certificado eliminado exitosamente', 'success');
                this.ocultarCertificado();

                // Refrescar lista de administrador si está visible
                if (this.isAdmin()) {
                    this.cargarListaAdmin();
                }
            } else {
                const error = await response.json();
                console.error('Error del servidor:', error);
                this.mostrarMensaje(error.detail || 'Error al eliminar certificado', 'error');
            }
        } catch (error) {
            console.error('Error eliminando certificado:', error);
            this.mostrarMensaje('Error de conexión', 'error');
        }
    }

    cerrarModales() {
        const modales = document.querySelectorAll('.certificados-modal');
        modales.forEach(modal => modal.style.display = 'none');
        // Limpiar el bloqueo de scroll del body
        document.body.classList.remove('modal-open');
    }

    cerrarModalConConfirmacion() {
        const modalVisible = document.querySelector('.certificados-modal[style*="block"]');
        if (!modalVisible) return;

        const tieneDatos = this.modalTieneDatos(modalVisible);

        if (tieneDatos) {
            if (confirm('¿Estás seguro de que quieres cerrar? Se perderán los datos ingresados.')) {
                this.cerrarModales();
                this.limpiarFormularios();
            }
        } else {
            this.cerrarModales();
        }
    }

    modalTieneDatos(modal) {
        const inputs = modal.querySelectorAll('input[type="text"], input[type="date"], input[type="url"], input[type="file"], textarea, select');

        for (let input of inputs) {
            if (input.type === 'file') {
                if (input.files && input.files.length > 0) return true;
            } else if (input.type === 'select-one') {
                // Para selects, verificar si no está en la opción por defecto
                if (input.selectedIndex > 0) return true;
            } else {
                if (input.value && input.value.trim() !== '') return true;
            }
        }

        return false;
    }

    limpiarFormularios() {
        const formAgregar = document.getElementById('formAgregarCertificado');
        const formEditar = document.getElementById('formEditarCertificado');

        if (formAgregar) {
            formAgregar.reset();
            // Resetear instalaciones a una sola
            const container = document.getElementById('instalaciones-container');
            if (container) {
                container.innerHTML = `
                    <div class="instalacion-input-group">
                        <input type="text" name="instalaciones[]" placeholder="Ej: Oficina Central - Av. Principal 123, Ciudad" required>
                        <button type="button" class="btn-remove-instalacion" onclick="removeInstalacion(this)">×</button>
                    </div>
                `;
            }
        }

        if (formEditar) {
            formEditar.reset();
            // Resetear instalaciones de edición
            const editContainer = document.getElementById('edit-instalaciones-container');
            if (editContainer) {
                editContainer.innerHTML = `
                    <div class="instalacion-input-group">
                        <input type="text" name="instalaciones[]" placeholder="Ej: Oficina Central - Av. Principal 123, Ciudad" required>
                        <button type="button" class="btn-remove-instalacion" onclick="removeInstalacion(this)">×</button>
                    </div>
                `;
            }
        }
    }

    mostrarMensaje(texto, tipo) {
        const container = document.getElementById('certificadosMensajes');
        if (!container) return;

        const tipoClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };

        container.innerHTML = `
            <div class="alert ${tipoClass[tipo] || 'alert-info'} alert-dismissible">
                ${texto}
                <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
            </div>
        `;

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }

    isAdmin() {
        return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'dev');
    }

    // Método para activar modo admin automáticamente
    activateAdminModeAutomatically() {
        console.log('🚀 Activando modo administrador automáticamente...');

        if (!this.isAdmin()) {
            console.log('❌ No es admin, saltando activación automática');
            return;
        }

        // Forzar UI de admin
        this.setupUIBasedOnRole();

        // Cargar certificados del backend automáticamente
        const adminContainer = document.getElementById('adminTablaCertificados');
        if (adminContainer && this.isAdmin()) {
            console.log('📋 Cargando certificados del backend...');
            // Siempre cargar desde el backend real
            setTimeout(() => {
                this.cargarListaAdmin();
            }, 500);
        }

        // Forzar mostrar elementos que podrían estar ocultos
        setTimeout(() => {
            this.forceShowAdminElements();
        }, 1500);
    }

    // Método para forzar mostrar elementos de admin
    forceShowAdminElements() {
        const elements = {
            adminActions: document.getElementById('adminActions'),
            adminListaCertificados: document.getElementById('adminListaCertificados'),
            certificadoAdminActions: document.querySelector('.certificado-admin-actions')
        };

        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                element.style.display = name === 'adminActions' ? 'flex' : 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                element.classList.remove('d-none', 'hidden');
                console.log(`✅ ${name} forzado a mostrar`);
            }
        });
    }

    // Método para test manual desde consola del navegador
    testAdminButtons() {
        console.log('=== TEST ADMIN BUTTONS ===');
        console.log('currentUser:', this.currentUser);
        console.log('isAdmin():', this.isAdmin());
        console.log('token type:', this.currentUser ? (this.currentUser.token === 'fake-admin-token' ? 'FAKE' : 'REAL') : 'NONE');

        const adminActions = document.querySelector('.certificado-admin-actions');
        console.log('adminActions element:', adminActions);

        if (adminActions) {
            console.log('Current styles:', {
                display: adminActions.style.display,
                visibility: adminActions.style.visibility,
                computed_display: window.getComputedStyle(adminActions).display,
                computed_visibility: window.getComputedStyle(adminActions).visibility
            });

            // Solo forzar mostrar si el usuario es realmente admin
            if (this.isAdmin()) {
                adminActions.style.display = 'flex';
                adminActions.style.visibility = 'visible';
                adminActions.style.opacity = '1';
                console.log('✅ Forced admin buttons visible - user is admin');
            } else {
                console.log('❌ User is not admin, buttons remain hidden');
            }
        } else {
            console.log('ERROR: No se encontró .certificado-admin-actions');
        }

        return adminActions;
    }

    // Método para mostrar un certificado específico (útil para testing)
    mostrarCertificadoPrueba() {
        const certificadoPrueba = {
            _id: '507f1f77bcf86cd799439011',
            nombre_empresa: 'Empresa de Prueba S.A.',
            id_empresa: 'EMP001',
            numero_certificado: '2025-0123',
            estado: 'Vigente',
            fecha_vigencia: '2025-12-31',
            fecha_emision: '2024-01-01',
            sector_iaf: 'Manufactura',
            codigo_nace: '1234',
            referencia_normativa: 'ISO 9001:2015',
            alcance_certificacion: 'Gestión de calidad en procesos de manufactura',
            instalaciones: ['Planta Principal - Ciudad'],
            link_iaf: 'https://example.com/iaf'
        };

        this.currentCertificate = certificadoPrueba;
        this.mostrarCertificado(certificadoPrueba);
        console.log('✅ Certificado de prueba mostrado');
        return certificadoPrueba;
    }

    // Métodos para la lista de administrador
    async cargarListaAdmin() {
        if (!this.isAdmin()) {
            console.log('❌ cargarListaAdmin: Usuario no es admin');
            return;
        }

        const container = document.getElementById('adminTablaCertificados');
        if (!container) {
            console.log('❌ cargarListaAdmin: Container adminTablaCertificados no encontrado');
            return;
        }

        // Validar token antes de hacer la llamada
        if (!this.currentUser.token || this.currentUser.token.length < 50) {
            console.log('❌ cargarListaAdmin: Token inválido');
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:#dc3545;">❌ Token inválido - Por favor, inicia sesión</div>';
            return;
        }

        console.log('🔄 Intentando cargar certificados del backend...');

        container.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando certificados...</div>';

        try {
            const response = await fetch(`${this.baseURL}/`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificados = await response.json();
                console.log('✅ Certificados recibidos:', certificados);
                console.log('📊 Número de certificados:', certificados.length);
                this.mostrarListaAdmin(certificados);
            } else {
                const errorText = await response.text().catch(() => 'Error desconocido');
                console.error('❌ Error cargando lista de certificados:', response.status, errorText);
                container.innerHTML = `<div style="text-align:center; padding:2rem; color:#dc3545;">❌ Error del servidor (${response.status})<br><small>Verifica tu conexión y permisos</small></div>`;
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:#dc3545;">❌ No se puede conectar al servidor<br><small>Verifica que el backend esté ejecutándose</small></div>';
        }
    }

    mostrarListaAdmin(certificados) {
        const container = document.getElementById('adminTablaCertificados');
        if (!container) return;

        if (certificados.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:#6c757d;">No hay certificados registrados</div>';
            return;
        }

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>ID Empresa</th>
                        <th>No. Certificado</th>
                        <th>Estado</th>
                        <th>Vigencia</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Filtrar solo certificados válidos antes de procesarlos
        const certificadosValidos = certificados.filter((cert, index) => {
            console.log(`🔍 Analizando certificado ${index + 1}:`, cert);

            // Extraer ID con múltiples intentos
            let certId = cert._id || cert.id || cert.objectId || cert.pk || cert.numero_certificado || '';

            // Si es un objeto MongoDB, podría ser ObjectId
            if (certId && typeof certId === 'object' && certId.$oid) {
                certId = certId.$oid;
            }

            // Convertir a string y limpiar
            certId = certId ? certId.toString().trim() : '';

            console.log(`🔑 ID detectado: "${certId}", longitud: ${certId.length}, tipo: ${typeof certId}`);

            // Validación más flexible - acepta cualquier ID que no esté vacío
            if (!certId || certId === 'undefined' || certId === 'null') {
                console.warn(`⚠️ Certificado ${index + 1} sin ID válido, omitiendo:`, cert);
                return false;
            }

            console.log(`✅ Certificado ${index + 1} válido con ID: "${certId}"`);
            return true;
        });

        console.log(`📊 Certificados válidos: ${certificadosValidos.length} de ${certificados.length}`);

        certificadosValidos.forEach((cert, index) => {
            console.log(`📋 Procesando certificado válido ${index + 1}:`, cert);

            // Extraer ID (mismo proceso que en el filtro)
            let certId = cert._id || cert.id || cert.objectId || cert.pk || cert.numero_certificado || '';
            if (certId && typeof certId === 'object' && certId.$oid) {
                certId = certId.$oid;
            }
            certId = certId.toString().trim();

            console.log('✅ Renderizando certificado con ID:', certId);

            html += `
                <tr>
                    <td>${cert.nombre_empresa || 'N/A'}</td>
                    <td>${cert.id_empresa || 'N/A'}</td>
                    <td>${cert.numero_certificado || 'N/A'}</td>
                    <td><span class="badge badge-${this.getStatusClass(cert.estado)}">${cert.estado || 'N/A'}</span></td>
                    <td>${cert.fecha_vigencia || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="event.preventDefault(); event.stopPropagation(); window.certificadosManager.verCertificadoAdmin('${certId}')" title="Ver certificado">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="event.preventDefault(); event.stopPropagation(); window.certificadosManager.editarCertificadoById('${certId}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="event.preventDefault(); event.stopPropagation(); window.certificadosManager.eliminarCertificadoById('${certId}')" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    toggleDetallesCertificado() {
        const detalles = document.getElementById('certificadoDetalles');
        const btnExpandir = document.getElementById('btnExpandirDetalles');

        if (!detalles || !btnExpandir) return;

        if (detalles.style.display === 'none' || detalles.style.display === '') {
            detalles.style.display = 'block';
            btnExpandir.innerHTML = '<i class="bi bi-chevron-up"></i> Ocultar información completa';
        } else {
            detalles.style.display = 'none';
            btnExpandir.innerHTML = '<i class="bi bi-chevron-down"></i> Ver información completa';
        }
    }

    async verCertificadoAdmin(id) {
        if (!this.isAdmin() || !id) return;

        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificado = await response.json();
                this.currentCertificate = certificado;
                this.mostrarModalVerCertificado(certificado);
            } else if (response.status === 404) {
                this.mostrarMensaje('Certificado no encontrado', 'error');
            } else {
                this.mostrarMensaje(`Error del servidor: ${response.status}`, 'error');
            }
        } catch (error) {
            this.mostrarMensaje('Error de conexión', 'error');
        }
    }

    mostrarModalVerCertificado(certificado) {
        // Cerrar todos los modales antes de abrir el modal de visualización
        this.cerrarModales();

        const modal = document.getElementById('modalVerCertificado');
        if (!modal) return;

        // Llenar la información del certificado en el modal
        document.getElementById('view-nombreEmpresa').textContent = certificado.nombre_empresa || 'N/A';
        document.getElementById('view-idEmpresa').textContent = certificado.id_empresa || 'N/A';
        document.getElementById('view-numeroCertificado').textContent = certificado.numero_certificado || 'N/A';

        const estadoBadge = document.getElementById('view-estado');
        estadoBadge.textContent = certificado.estado || 'N/A';
        estadoBadge.className = `badge badge-${this.getStatusClass(certificado.estado)}`;

        document.getElementById('view-fechaEmision').textContent = certificado.fecha_emision || 'N/A';
        document.getElementById('view-fechaVigencia').textContent = certificado.fecha_vigencia || 'N/A';
        document.getElementById('view-sectorIaf').textContent = certificado.sector_iaf || 'N/A';
        document.getElementById('view-codigoNace').textContent = certificado.codigo_nace || 'N/A';
        document.getElementById('view-referenciaNormativa').textContent = certificado.referencia_normativa || 'N/A';
        document.getElementById('view-alcanceCertificacion').textContent = certificado.alcance_certificacion || 'N/A';

        // Mostrar instalaciones
        const instalacionesContainer = document.getElementById('view-instalaciones');
        if (certificado.instalaciones && certificado.instalaciones.length > 0) {
            instalacionesContainer.innerHTML = certificado.instalaciones
                .map(inst => `<div class="instalacion-item">${inst}</div>`)
                .join('');
        } else {
            instalacionesContainer.innerHTML = '<div class="instalacion-item">No hay instalaciones registradas</div>';
        }

        // Mostrar link IAF
        const linkIaf = document.getElementById('view-linkIaf');
        if (certificado.link_iaf) {
            linkIaf.href = certificado.link_iaf;
            linkIaf.textContent = certificado.link_iaf;
            linkIaf.style.display = 'inline';
        } else {
            linkIaf.textContent = 'N/A';
            linkIaf.removeAttribute('href');
        }

        // Configurar botón de descarga PDF
        const btnDescargarPdf = document.getElementById('btnDescargarPdf');
        if (certificado.archivo_pdf && certificado.archivo_pdf.url) {
            btnDescargarPdf.style.display = 'inline-flex';
            btnDescargarPdf.onclick = () => this.descargarPdf(certificado);
        } else {
            btnDescargarPdf.style.display = 'none';
        }

        // Bloquear scroll del body y mostrar el modal
        document.body.classList.add('modal-open');
        modal.style.display = 'block';
    }

    async descargarPdf(certificado) {
        if (!certificado.archivo_pdf || !certificado.archivo_pdf.url) {
            this.mostrarMensaje('No hay archivo PDF disponible para descargar', 'warning');
            return;
        }

        try {
            // Crear enlace temporal para descargar
            const link = document.createElement('a');
            link.href = certificado.archivo_pdf.url;
            link.download = `certificado_${certificado.numero_certificado}.pdf`;
            link.target = '_blank';

            // Agregar al DOM temporalmente y hacer clic
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.mostrarMensaje('Descarga iniciada', 'success');
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            this.mostrarMensaje('Error al descargar el archivo PDF', 'error');
        }
    }

    async editarCertificadoById(id) {
        if (!this.isAdmin() || !id) return;

        try {
            // Obtener los datos del certificado sin mostrar el modal de visualización
            const response = await fetch(`${this.baseURL}/${id}`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificado = await response.json();
                this.currentCertificate = certificado;
                // Mostrar directamente el modal de edición
                this.mostrarModalEditar();
            } else if (response.status === 404) {
                this.mostrarMensaje('Certificado no encontrado', 'error');
            } else {
                this.mostrarMensaje(`Error del servidor: ${response.status}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error en editarCertificadoById:', error);
            this.mostrarMensaje('Error al preparar la edición del certificado', 'error');
        }
    }

    async eliminarCertificadoById(id) {
        if (!this.isAdmin() || !id || !confirm('¿Eliminar certificado?')) return;

        try {
            this.currentCertificate = { _id: id };
            await this.eliminarCertificado();
            this.cargarListaAdmin();
        } catch (error) {
            this.mostrarMensaje('Error al eliminar certificado', 'error');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM listo, inicializando CertificadosManager...');
    window.certificadosManager = new CertificadosManager();

    // Verificación adicional después de un breve delay para asegurar inicialización completa
    setTimeout(async () => {
        console.log('🔍 Verificación adicional de sesión admin...');

        const manager = window.certificadosManager;
        if (manager && manager.isAdmin()) {
            console.log('✅ Administrador confirmado después de inicialización');
            manager.forceShowAdminElements();

            // Si no hay datos cargados, intentar cargar del backend
            const adminTable = document.getElementById('adminTablaCertificados');
            if (adminTable && (!adminTable.innerHTML || adminTable.innerHTML.includes('Cargando'))) {
                console.log('📊 No hay datos, cargando del backend...');
                this.cargarListaAdmin();
            }
        }

        // Verificar si hay token pero no se detectó admin (problema común)
        const token = localStorage.getItem('token') || localStorage.getItem('dev_token');
        if (token && (!manager || !manager.isAdmin())) {
            console.log('⚠️ Token presente pero admin no detectado, forzando detección...');

            if (manager) {
                // Forzar re-verificación
                await manager.checkUserRole();
                manager.setupUIBasedOnRole();

                if (manager.isAdmin()) {
                    console.log('✅ Admin detectado en segunda verificación');
                    manager.activateAdminModeAutomatically();
                }
            }
        }
    }, 2000);

    // Observer para elementos que se cargan dinámicamente
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Si se agrega la tabla de admin, intentar activar funcionalidad
                        if (node.id === 'adminTablaCertificados' ||
                            node.querySelector && node.querySelector('#adminTablaCertificados')) {
                            console.log('🔍 Tabla de admin detectada en DOM');

                            setTimeout(() => {
                                const manager = window.certificadosManager;
                                if (manager && manager.isAdmin()) {
                                    console.log('🎯 Activando funcionalidad admin para nueva tabla');
                                    manager.forceShowAdminElements();
                                }
                            }, 500);
                        }

                        // Si se agregan botones de admin, activarlos
                        if (node.className && node.className.includes('certificado-admin-actions')) {
                            console.log('🔘 Botones de admin detectados en DOM');

                            const manager = window.certificadosManager;
                            if (manager && manager.isAdmin()) {
                                node.style.display = 'flex';
                                node.style.visibility = 'visible';
                                node.style.opacity = '1';
                            }
                        }
                    }
                });
            }
        });
    });

    // Observar cambios en el DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Función principal para cargar certificados
window.cargarListaAdmin = function () {
    try {
        if (!window.certificadosManager) {
            console.error('❌ CertificadosManager no está disponible');
            return;
        }

        if (!window.certificadosManager.isAdmin()) {
            console.error('❌ Usuario no es administrador');
            return;
        }

        console.log('🔄 Cargando certificados para administrador...');
        window.certificadosManager.cargarListaAdmin();
    } catch (error) {
        console.error('❌ Error al cargar lista admin:', error);
    }
};

// Función para diagnosticar problemas de carga de certificados
window.diagnosticarCarga = function () {
    console.log('🔍 === DIAGNÓSTICO DE CARGA DE CERTIFICADOS ===');

    try {
        const manager = window.certificadosManager;
        if (!manager) {
            console.error('❌ CertificadosManager no disponible');
            return;
        }

        console.log('👤 Usuario actual:', manager.currentUser);
        console.log('🔑 Es admin:', manager.isAdmin());
        console.log('🌐 Backend URL:', manager.backendBaseURL);
        console.log('📁 Certificados URL:', manager.baseURL);

        // Verificar elementos DOM
        const container = document.getElementById('adminTablaCertificados');
        console.log('📋 Container adminTablaCertificados:', container ? 'Encontrado' : 'No encontrado');

        if (container) {
            console.log('📝 Contenido actual:', container.innerHTML.substring(0, 100) + '...');
        }

        // Verificar token
        if (manager.currentUser && manager.currentUser.token) {
            console.log('🔑 Token length:', manager.currentUser.token.length);
            console.log('🔑 Token válido:', manager.currentUser.token.length >= 50 ? 'Sí' : 'No');
            console.log('🔑 Token preview:', manager.currentUser.token.substring(0, 20) + '...');

            // Probar autenticación del token
            probarAutenticacion();
        } else {
            console.log('❌ No hay token disponible');
        }

        // Probar carga manual
        if (manager.isAdmin()) {
            console.log('🔄 Intentando carga manual...');
            manager.cargarListaAdmin();
        } else {
            console.log('❌ Usuario no es admin');
        }

        console.log('================================================');
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
};

// Función para probar autenticación del token
window.probarAutenticacion = async function () {
    const manager = window.certificadosManager;
    if (!manager || !manager.currentUser || !manager.currentUser.token) {
        console.error('❌ No hay token para probar');
        return;
    }

    try {
        console.log('🔐 Probando autenticación del token...');

        // Probar endpoint de ping con autenticación
        const response = await fetch(`${manager.backendBaseURL}/ping`, {
            headers: { 'Authorization': `Bearer ${manager.currentUser.token}` }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ping exitoso:', result);
        } else {
            console.error('❌ Fallo en ping:', response.status, await response.text());
        }

        // Probar endpoint específico de certificados
        const certResponse = await fetch(`${manager.baseURL}/`, {
            headers: { 'Authorization': `Bearer ${manager.currentUser.token}` }
        });

        if (certResponse.ok) {
            console.log('✅ Acceso a certificados autorizado');
        } else {
            const errorText = await certResponse.text();
            console.error('❌ Acceso a certificados denegado:', certResponse.status, errorText);
        }

    } catch (error) {
        console.error('❌ Error probando autenticación:', error);
    }
};

// Función para crear certificado de prueba en la base de datos
window.crearCertificadoPrueba = async function () {
    console.log('📝 Creando certificado de prueba en la base de datos...');

    const manager = window.certificadosManager;
    if (!manager || !manager.currentUser || !manager.currentUser.token) {
        console.error('❌ No hay token disponible');
        return;
    }

    const certificadoPrueba = {
        numero_certificado: "2024-00123",
        nombre_empresa: "LACS S.A. de C.V.",
        id_empresa: "EMP-001",
        fecha_emision: "2024-01-15",
        fecha_vencimiento: "2025-01-15",
        alcance_certificacion: "Sistema de Gestión de Calidad",
        norma_aplicable: "ISO 9001:2015",
        link_iaf: "https://iaf.nu/en/accreditation-body/AB_373/",
        observaciones: "Certificado emitido para pruebas del sistema"
    };

    try {
        const response = await fetch(`${manager.baseURL}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${manager.currentUser.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(certificadoPrueba)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Certificado de prueba creado:', result);

            // Recargar la lista
            cargarCertificadosReales();

            return result;
        } else {
            const errorText = await response.text();
            console.error('❌ Error creando certificado:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Error en petición:', error);
    }
};

// Función para cargar certificados reales sin IDs de prueba
window.cargarCertificadosReales = async function () {
    console.log('🔄 Cargando certificados reales...');

    const manager = window.certificadosManager;
    if (!manager || !manager.currentUser || !manager.currentUser.token) {
        console.error('❌ No hay token disponible');
        return;
    }

    try {
        const response = await fetch(`${manager.baseURL}/`, {
            headers: { 'Authorization': `Bearer ${manager.currentUser.token}` }
        });

        if (response.ok) {
            const certificados = await response.json();
            console.log('✅ Certificados reales obtenidos:', certificados.length);
            console.log('📋 Lista de certificados:', certificados);

            if (certificados.length === 0) {
                console.log('⚠️ No hay certificados en la base de datos');
                console.log('💡 Ejecuta crearCertificadoPrueba() para crear uno');

                // Mostrar mensaje en la tabla
                const container = document.getElementById('adminTablaCertificados');
                if (container) {
                    container.innerHTML = `
                        <div style="text-align:center; padding:3rem; color:#856404; background:#fff3cd; border:1px solid #ffeeba; border-radius:8px; margin:1rem;">
                            <h4>📋 Base de datos vacía</h4>
                            <p>No hay certificados registrados en el sistema.</p>
                            <button onclick="crearCertificadoPrueba()" 
                                    style="background:#28a745; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer; margin-top:10px;">
                                📝 Crear certificado de prueba
                            </button>
                        </div>
                    `;
                }
            } else {
                if (container && manager.mostrarListaAdmin) {
                    manager.mostrarListaAdmin(certificados);
                    console.log('✅ Certificados mostrados en la tabla');
                }
            }

            return certificados;
        } else {
            const errorText = await response.text();
            console.error('❌ Error cargando certificados:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Error en petición:', error);
    }
};

// Función para crear token de admin de prueba
window.crearTokenAdmin = async function () {
    console.log('🔧 Creando token de admin de prueba...');

    const backendUrl = localStorage.getItem('backend_url') || 'http://localhost:8000';
    console.log('🔗 Usando backend URL:', backendUrl);

    try {
        const response = await fetch(`${backendUrl}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'username=admin&password=admin123'
        });

        if (response.ok) {
            const tokenData = await response.json();
            console.log('✅ Token obtenido:', tokenData);

            // Actualizar el manager con el token real
            if (window.certificadosManager) {
                window.certificadosManager.currentUser = {
                    username: 'admin',
                    role: 'admin',
                    token: tokenData.access_token
                };

                console.log('✅ Manager actualizado con token real');
                console.log('🔄 Intentando cargar certificados...');
                window.certificadosManager.cargarListaAdmin();
            }

            return tokenData.access_token;
        } else {
            const error = await response.text();
            console.error('❌ Error obteniendo token:', response.status, error);
        }
    } catch (error) {
        console.error('❌ Error en petición de token:', error);
    }
};

// Función para limpiar consola y verificar estado inicial
window.limpiarYVerificar = function () {
    console.clear();
    console.log('🧹 === LIMPIEZA Y VERIFICACIÓN INICIAL ===');

    try {
        // Verificar manager
        const manager = window.certificadosManager;
        if (!manager) {
            console.error('❌ CertificadosManager no inicializado');
            return false;
        }

        console.log('✅ CertificadosManager disponible');
        console.log('👤 Usuario:', manager.currentUser ? 'Autenticado' : 'No autenticado');
        console.log('🔑 Admin:', manager.isAdmin() ? 'Sí' : 'No');

        // Si es admin, cargar certificados
        if (manager.isAdmin()) {
            console.log('🔄 Cargando certificados automáticamente...');
            manager.cargarListaAdmin();
        }

        return true;
    } catch (error) {
        console.error('❌ Error en verificación:', error);
        return false;
    }
};

// Funciones globales para manejar instalaciones dinámicas
window.addInstalacion = function (type) {
    const containerId = type === 'edit' ? 'edit-instalaciones-container' : 'instalaciones-container';
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    const newGroup = document.createElement('div');
    newGroup.className = 'instalacion-input-group';
    newGroup.innerHTML = `
        <input type="text" name="instalaciones[]" placeholder="Ej: Oficina Central - Av. Principal 123, Ciudad" required>
        <button type="button" class="btn-remove-instalacion" onclick="removeInstalacion(this)">×</button>
    `;

    container.appendChild(newGroup);
};

window.removeInstalacion = function (button) {
    const group = button.parentElement;
    const container = group.parentElement;

    // Solo permite eliminar si hay más de una instalación
    if (container.children.length > 1) {
        group.remove();
    } else {
        alert('Debe tener al menos una instalación/ubicación');
    }
};

// Función para forzar la activación de botones de administrador
window.forceEnableAdminButtons = function () {
    console.log('🔧 Forzando activación de botones de administrador...');

    const manager = window.certificadosManager;
    if (!manager) {
        console.error('❌ certificadosManager no disponible');
        return false;
    }

    // Verificar que hay un usuario admin real
    if (!manager.currentUser || !manager.isAdmin()) {
        console.error('❌ No hay usuario admin autenticado');
        return false;
    }

    // Forzar setup de UI
    manager.setupUIBasedOnRole();

    // Buscar y activar todos los botones de admin en las tablas
    const adminButtons = document.querySelectorAll('button[onclick*="certificadosManager"], button[onclick*="window.certificadosManager"]');
    console.log('🔍 Botones encontrados:', adminButtons.length);

    adminButtons.forEach((btn, index) => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.removeAttribute('disabled');
        console.log(`✅ Botón ${index + 1} activado:`, btn.getAttribute('onclick'));
    });

    console.log('✅ Activación completa finalizada');
    return true;
};

// Función debug para verificar estado de botones
window.debugAdminButtons = function () {
    console.log('🔍 === DEBUG ADMIN BUTTONS ===');

    const manager = window.certificadosManager;
    console.log('Manager:', manager);
    console.log('Current user:', manager?.currentUser);
    console.log('Is admin:', manager?.isAdmin());

    const allButtons = document.querySelectorAll('button[onclick*="certificadosManager"], button[onclick*="window.certificadosManager"]');
    console.log('Total botones admin encontrados:', allButtons.length);

    allButtons.forEach((btn, index) => {
        console.log(`Botón ${index + 1}:`, {
            onclick: btn.getAttribute('onclick'),
            disabled: btn.disabled,
            style: {
                display: btn.style.display,
                opacity: btn.style.opacity,
                pointerEvents: btn.style.pointerEvents
            }
        });
    });

    return allButtons;
};

// Función para verificar el estado actual del usuario
window.checkCurrentUserStatus = function () {
    console.log('🔍 === ESTADO ACTUAL DEL USUARIO ===');

    const manager = window.certificadosManager;
    const token = localStorage.getItem('token');

    console.log('Token en localStorage:', token);
    console.log('Manager disponible:', !!manager);

    if (manager) {
        console.log('Usuario actual:', manager.currentUser);
        console.log('Es admin:', manager.isAdmin());

        // Verificar elementos UI
        const adminActions = document.getElementById('adminActions');
        const adminList = document.getElementById('adminListaCertificados');
        const certActions = document.querySelector('.certificado-admin-actions');

        console.log('UI Estado:');
        console.log('- adminActions:', {
            exists: !!adminActions,
            display: adminActions?.style.display,
            visible: adminActions?.style.display !== 'none'
        });
        console.log('- adminList:', {
            exists: !!adminList,
            display: adminList?.style.display,
            visible: adminList?.style.display !== 'none'
        });
        console.log('- certActions:', {
            exists: !!certActions,
            display: certActions?.style.display,
            visible: certActions?.style.display !== 'none'
        });
    }

    return {
        token,
        manager: !!manager,
        user: manager?.currentUser,
        isAdmin: manager?.isAdmin()
    };
};

// Función para forzar activar todo el sistema de admin
window.forceAdminMode = function () {
    console.log('💪 FORZANDO MODO ADMINISTRADOR COMPLETO...');

    // Paso 1: Crear token y usuario
    localStorage.setItem('token', 'fake-admin-token');

    if (window.certificadosManager) {
        window.certificadosManager.currentUser = {
            username: 'admin-force',
            role: 'admin',
            token: 'fake-admin-token'
        };

        console.log('✅ Usuario admin forzado');

        // Paso 2: Activar UI
        window.certificadosManager.setupUIBasedOnRole();

        // Paso 3: Forzar mostrar elementos
        const adminActions = document.getElementById('adminActions');
        const adminList = document.getElementById('adminListaCertificados');
        const certActions = document.querySelector('.certificado-admin-actions');

        if (adminActions) {
            adminActions.style.display = 'flex';
            console.log('✅ adminActions activado');
        }
        if (adminList) {
            adminList.style.display = 'block';
            console.log('✅ adminList activado');
        }
        if (certActions) {
            certActions.style.display = 'flex';
            certActions.style.visibility = 'visible';
            console.log('✅ certActions activado');
        }

        // Paso 4: Cargar datos de prueba
        setTimeout(() => {
            window.testCertificadosData();
            console.log('✅ Datos de prueba cargados');

            // Paso 5: Activar botones
            setTimeout(() => {
                window.forceEnableAdminButtons();
                console.log('💪 MODO ADMINISTRADOR COMPLETO ACTIVADO');
            }, 500);
        }, 300);

        return true;
    }

    return false;
};

// Función de mantenimiento automático para asegurar funcionalidad admin
window.maintainAdminMode = function () {
    const manager = window.certificadosManager;
    if (!manager || !manager.isAdmin()) {
        return false;
    }

    console.log('🔧 Ejecutando mantenimiento de modo admin...');

    // Asegurar que elementos estén visibles
    const elements = {
        adminActions: document.getElementById('adminActions'),
        adminListaCertificados: document.getElementById('adminListaCertificados'),
        certificadoAdminActions: document.querySelector('.certificado-admin-actions')
    };

    let changed = false;

    Object.entries(elements).forEach(([name, element]) => {
        if (element) {
            const currentDisplay = window.getComputedStyle(element).display;
            if (currentDisplay === 'none') {
                element.style.display = name === 'adminActions' ? 'flex' : 'block';
                element.style.visibility = 'visible';
                element.style.opacity = '1';
                console.log(`🔧 Restaurado ${name}`);
                changed = true;
            }
        }
    });

    // Verificar botones en tablas
    const adminButtons = document.querySelectorAll('button[onclick*="certificadosManager"]');
    adminButtons.forEach((btn) => {
        if (btn.disabled) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            changed = true;
        }
    });

    if (changed) {
        console.log('✅ Funcionalidad admin restaurada');
    }

    return changed;
};

// Función de diagnóstico de sistema (solo para backend real)
window.diagnosticoSistema = function () {
    console.log('🔧 === DIAGNÓSTICO DE SISTEMA ===');

    if (!window.certificadosManager) {
        console.error('❌ Manager no disponible');
        return;
    }

    const manager = window.certificadosManager;

    // Verificar estado de autenticación real
    if (!manager.currentUser) {
        console.log('❌ No hay usuario autenticado');
        console.log('💡 Solución: Inicia sesión con credenciales válidas');
        return;
    }

    console.log('👤 Usuario actual:', manager.currentUser);
    console.log('🔑 Es admin:', manager.isAdmin());
    console.log('🌐 Backend URL:', manager.backendBaseURL);

    // Probar conectividad con backend real
    fetch(manager.backendBaseURL + '/ping')
        .then(response => {
            console.log('📡 Backend status:', response.status);
            if (response.ok) {
                console.log('✅ Backend funcionando correctamente');
                return manager.cargarListaAdmin();
            } else {
                console.log('❌ Backend con problemas');
            }
        })
        .catch(error => {
            console.error('❌ Error conectando con backend:', error);
            console.log('💡 Verifica que el servidor esté ejecutándose');
        });

    console.log('==========================================');
};

// Función para diagnosticar diferencias entre navegadores
window.diagnosticarNavegador = function () {
    console.log('🔍 === DIAGNÓSTICO POR NAVEGADOR ===');

    const manager = window.certificadosManager;
    if (!manager) {
        console.error('❌ Manager no disponible');
        return;
    }

    console.log('🌍 Navegador detectado:', manager.isChrome ? 'Chrome' : manager.isEdge ? 'Edge' : 'Otro');
    console.log('🌐 URL actual:', window.location.href);
    console.log('🏠 Hostname:', window.location.hostname);
    console.log('🔌 Puerto:', window.location.port);
    console.log('🔗 Backend URL:', manager.backendBaseURL);

    // Test específico para cada navegador
    if (manager.isChrome) {
        console.log('🟡 CHROME: Probando conectividad específica...');
        testBrowserSpecific('Chrome');
    } else if (manager.isEdge) {
        console.log('🔵 EDGE: Probando conectividad específica...');
        testBrowserSpecific('Edge');
    }

    console.log('================================');
};

function testBrowserSpecific(browser) {
    const manager = window.certificadosManager;

    // Probar con diferentes configuraciones según el navegador
    const testUrls = [
        manager.backendBaseURL + '/ping',
        'http://localhost:8000/ping',
        '/ping'
    ];

    console.log(`🔄 Probando URLs en ${browser}:`);

    testUrls.forEach((url, index) => {
        console.log(`${index + 1}. Probando: ${url}`);

        fetch(url)
            .then(response => {
                console.log(`✅ ${url} - Status: ${response.status}`);
                if (response.ok) {
                    console.log(`🎉 ${browser}: URL funcional encontrada: ${url}`);
                }
            })
            .catch(error => {
                console.log(`❌ ${url} - Error: ${error.message}`);
            });
    });
}

// Función específica para diagnosticar errores 404 y 500
window.diagnosticErrors = function () {
    console.log('🔍 === DIAGNÓSTICO DE ERRORES ===');

    if (!window.certificadosManager) {
        console.error('❌ CertificadosManager no está disponible');
        return;
    }

    const manager = window.certificadosManager;

    // 1. Verificar estado del usuario
    console.log('👤 Usuario actual:', manager.currentUser);
    console.log('🔑 Es admin:', manager.isAdmin());
    console.log('🌐 Base URL:', manager.baseURL);

    // 2. Probar endpoints uno por uno
    const token = manager.currentUser?.token;

    if (!token) {
        console.log('❌ No hay token - probando sin autenticación');
    } else {
        console.log('✅ Token disponible, longitud:', token.length);
    }

    // 3. Probar /auth/me (para 401/403)
    console.log('🔄 Probando /auth/me...');
    fetch(manager.backendBaseURL + '/auth/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
        .then(response => {
            console.log('📡 /auth/me status:', response.status);
            if (response.status === 404) {
                console.error('❌ 404: Endpoint /auth/me no encontrado - backend no está corriendo');
            } else if (response.status === 500) {
                console.error('❌ 500: Error interno del servidor en /auth/me');
            } else if (response.status === 401 || response.status === 403) {
                console.error('❌ 401/403: Token inválido o no autorizado');
            }
            return response.json().catch(() => null);
        })
        .then(data => {
            if (data) console.log('📄 /auth/me data:', data);
        })
        .catch(err => {
            console.error('❌ Error de red en /auth/me:', err.message);
        });

    // 4. Probar endpoint de certificados
    console.log('🔄 Probando /certificados...');
    fetch(manager.backendBaseURL + '/certificados/', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
        .then(response => {
            console.log('📡 /certificados status:', response.status);
            if (response.status === 404) {
                console.error('❌ 404: Endpoint /certificados no encontrado - verificar rutas del backend');
            } else if (response.status === 500) {
                console.error('❌ 500: Error interno del servidor en /certificados');
            }
            return response.json().catch(() => null);
        })
        .then(data => {
            if (data) console.log('📄 /certificados data:', data);
        })
        .catch(err => {
            console.error('❌ Error de red en /certificados:', err.message);
        });

    // 5. Verificar si el backend está corriendo
    console.log('🔄 Verificando si el backend está activo...');
    fetch(manager.backendBaseURL + '/')
        .then(response => {
            console.log('📡 Backend root status:', response.status);
            if (response.status === 404) {
                console.log('⚠️  Puede que necesites iniciar el servidor backend');
            }
        })
        .catch(err => {
            console.error('❌ Backend no responde:', err.message);
            console.log('💡 Soluciones posibles:');
            console.log('   1. cd backend && python main.py');
            console.log('   2. Verificar que el puerto esté correcto');
            console.log('   3. Verificar firewall/antivirus');
        });
};

// Función global para remover archivos
window.removeFile = function (inputId) {
    const input = document.getElementById(inputId);
    const dropZone = input.closest('.file-drop-zone');
    const fileInfo = dropZone.querySelector('.file-info');

    input.value = '';
    dropZone.classList.remove('has-file');
    fileInfo.style.display = 'none';
};

// Inicializar drag & drop para archivos cuando los modales se abren
function initializeFileDropZones() {
    const dropZones = document.querySelectorAll('.file-drop-zone');

    dropZones.forEach(dropZone => {
        // Evitar inicializar múltiples veces
        if (dropZone.dataset.initialized) return;
        dropZone.dataset.initialized = 'true';

        const input = dropZone.querySelector('input[type="file"]');
        const fileInfo = dropZone.querySelector('.file-info');
        const fileName = fileInfo.querySelector('.file-name');

        // Click para abrir selector de archivo
        dropZone.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-file-btn')) {
                input.click();
            }
        });

        // Cambio en input file
        input.addEventListener('change', (e) => {
            handleFiles(e.target.files, dropZone, fileInfo, fileName);
        });

        // Drag & Drop eventos
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            // Solo remover dragover si realmente salimos del dropZone
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('dragover');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');

            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
            );

            if (files.length > 0) {
                // Simular la selección del archivo en el input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                input.files = dataTransfer.files;

                handleFiles(files, dropZone, fileInfo, fileName);
            } else {
                alert('Solo se permiten archivos PDF');
            }
        });
    });
}

function handleFiles(files, dropZone, fileInfo, fileName) {
    if (files.length > 0) {
        const file = files[0];

        // Validar que sea PDF
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            dropZone.classList.add('has-file');
            fileName.textContent = file.name;
            fileInfo.style.display = 'flex';
        } else {
            alert('Solo se permiten archivos PDF');
            // Limpiar el input si no es PDF
            dropZone.querySelector('input').value = '';
        }
    }
}

// Inicializar cuando se abren los modales
document.addEventListener('DOMContentLoaded', function () {
    // Observar cambios en los modales
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                if (target.classList.contains('certificados-modal') && target.style.display === 'block') {
                    // Modal se abrió, inicializar drag & drop
                    setTimeout(initializeFileDropZones, 100);
                }
            }
        });
    });

    // Observar todos los modales
    const modales = document.querySelectorAll('.certificados-modal');
    modales.forEach(modal => {
        observer.observe(modal, { attributes: true });
    });

    // También inicializar inmediatamente por si acaso
    initializeFileDropZones();
});
