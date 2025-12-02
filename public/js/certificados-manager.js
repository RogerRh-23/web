/**
 * Gestor de Certificados
 * Maneja todas las operaciones CRUD de certificados con control de roles
 */

class CertificadosManager {
    constructor() {
        this.currentUser = null;
        this.currentCertificate = null;
        this.baseURL = '/certificados';
        this.init();
    }

    async init() {
        await this.checkUserRole();
        this.setupEventListeners();
        this.setupUIBasedOnRole();
    }

    async checkUserRole() {
        const token = localStorage.getItem('token') || localStorage.getItem('dev_token');
        if (!token) {
            this.currentUser = null;
            return;
        }

        try {
            const response = await fetch('/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = {
                    username: data.user,
                    role: data.role,
                    token: token
                };
            }
        } catch (error) {
            console.error('Error verificando usuario:', error);
            this.currentUser = null;
        }
    }

    setupUIBasedOnRole() {
        const adminActions = document.getElementById('adminActions');
        const adminListaCertificados = document.getElementById('adminListaCertificados');
        const adminCertActions = document.querySelectorAll('.certificado-admin-actions');

        if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'dev')) {
            // Mostrar controles de administrador
            if (adminActions) adminActions.style.display = 'flex';
            if (adminListaCertificados) adminListaCertificados.style.display = 'block';
            adminCertActions.forEach(el => el.style.display = 'flex');
            
            // Cargar automáticamente la lista de certificados para administradores
            this.cargarListaAdmin();
        } else {
            // Ocultar controles de administrador
            if (adminActions) adminActions.style.display = 'none';
            if (adminListaCertificados) adminListaCertificados.style.display = 'none';
            adminCertActions.forEach(el => el.style.display = 'none');
        }
    }

    setupEventListeners() {
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
        if (!this.isAdmin() || !this.currentCertificate) return;

        if (!confirm('¿Estás seguro de que quieres eliminar este certificado?')) return;

        try {
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

    // Métodos para la lista de administrador
    async cargarListaAdmin() {
        if (!this.isAdmin()) return;

        const container = document.getElementById('adminTablaCertificados');
        if (!container) return;

        container.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando certificados...</div>';

        try {
            const response = await fetch(`${this.baseURL}/`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificados = await response.json();
                this.mostrarListaAdmin(certificados);
            } else {
                container.innerHTML = '<div style="text-align:center; padding:2rem; color:#dc3545;">Error al cargar certificados</div>';
            }
        } catch (error) {
            console.error('Error cargando lista admin:', error);
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:#dc3545;">Error de conexión</div>';
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

        certificados.forEach(cert => {
            html += `
                <tr>
                    <td>${cert.nombre_empresa}</td>
                    <td>${cert.id_empresa}</td>
                    <td>${cert.numero_certificado}</td>
                    <td><span class="badge badge-${this.getStatusClass(cert.estado)}">${cert.estado}</span></td>
                    <td>${cert.fecha_vigencia}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="certificadosManager.verCertificadoAdmin('${cert._id}')" title="Ver certificado">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="certificadosManager.editarCertificadoById('${cert._id}')" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="certificadosManager.eliminarCertificadoById('${cert._id}')" title="Eliminar">
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

    // Métodos auxiliares para la tabla
    async verCertificadoAdmin(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificado = await response.json();
                this.currentCertificate = certificado;
                this.mostrarCertificado(certificado);
            }
        } catch (error) {
            console.error('Error obteniendo certificado:', error);
        }
    }

    async editarCertificadoById(id) {
        await this.verCertificado(id);
        this.mostrarModalEditar();
    }

        async eliminarCertificadoById(id) {
        this.currentCertificate = { _id: id };
        await this.eliminarCertificado();
        this.cargarListaAdmin(); // Refrescar lista
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.certificadosManager = new CertificadosManager();
});