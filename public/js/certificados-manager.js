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
        const adminCertActions = document.querySelectorAll('.admin-cert-actions');

        if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'dev')) {
            // Mostrar controles de administrador
            if (adminActions) adminActions.style.display = 'flex';
            adminCertActions.forEach(el => el.style.display = 'flex');
        } else {
            // Ocultar controles de administrador
            if (adminActions) adminActions.style.display = 'none';
            adminCertActions.forEach(el => el.style.display = 'none');
        }
    }

    setupEventListeners() {
        // Búsqueda de certificados
        const formBuscar = document.getElementById('formBuscarCertificado');
        if (formBuscar) {
            formBuscar.addEventListener('submit', (e) => this.buscarCertificado(e));
        }

        // Botones de administrador
        const btnAgregar = document.getElementById('btnAgregarCertificado');
        const btnListar = document.getElementById('btnListarCertificados');
        
        if (btnAgregar) btnAgregar.addEventListener('click', () => this.mostrarModalAgregar());
        if (btnListar) btnListar.addEventListener('click', () => this.listarCertificados());

        // Formularios de agregar y editar
        const formAgregar = document.getElementById('formAgregarCertificado');
        const formEditar = document.getElementById('formEditarCertificado');
        
        if (formAgregar) formAgregar.addEventListener('submit', (e) => this.agregarCertificado(e));
        if (formEditar) formEditar.addEventListener('submit', (e) => this.editarCertificado(e));

        // Botones de edición y eliminación
        const btnEditar = document.getElementById('btnEditarCertificado');
        const btnEliminar = document.getElementById('btnEliminarCertificado');
        
        if (btnEditar) btnEditar.addEventListener('click', () => this.mostrarModalEditar());
        if (btnEliminar) btnEliminar.addEventListener('click', () => this.eliminarCertificado());

        // Cerrar modales
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModales());
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
        const datos = document.getElementById('certificadoDatos');
        const qrContainer = document.getElementById('certificadoQR');
        const archivoContainer = document.getElementById('certificadoArchivo');
        
        if (!resultado || !datos) return;

        // Llenar datos
        datos.innerHTML = `
            <div><strong>Nombre de la empresa:</strong> ${certificado.nombre_empresa}</div>
            <div><strong>No. de certificado:</strong> ${certificado.numero_certificado}</div>
            <div><strong>ID de la empresa:</strong> ${certificado.id_empresa}</div>
            <div><strong>Estado:</strong> <span class="badge badge-${this.getStatusClass(certificado.estado)}">${certificado.estado}</span></div>
            <div><strong>Fecha de emisión:</strong> ${certificado.fecha_emision}</div>
            <div><strong>Fecha de vigencia:</strong> ${certificado.fecha_vigencia}</div>
            <div><strong>Sector IAF:</strong> ${certificado.sector_iaf}</div>
            <div><strong>Código NACE:</strong> ${certificado.codigo_nace}</div>
            <div><strong>Referencia normativa:</strong> ${certificado.referencia_normativa}</div>
            <div><strong>Link IAF:</strong> <a href="${certificado.link_iaf}" target="_blank" rel="noopener">${certificado.link_iaf}</a></div>
        `;

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

    async listarCertificados() {
        if (!this.isAdmin()) {
            this.mostrarMensaje('No tienes permisos para esta acción', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificados = await response.json();
                this.mostrarListaCertificados(certificados);
            } else {
                const error = await response.json();
                this.mostrarMensaje(error.detail || 'Error al cargar certificados', 'error');
            }
        } catch (error) {
            console.error('Error listando certificados:', error);
            this.mostrarMensaje('Error de conexión', 'error');
        }
    }

    mostrarListaCertificados(certificados) {
        const container = document.getElementById('listaCertificados');
        const tabla = document.getElementById('tablaCertificados');
        
        if (!container || !tabla) return;

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Empresa</th>
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
                    <td>${cert.numero_certificado}</td>
                    <td><span class="badge badge-${this.getStatusClass(cert.estado)}">${cert.estado}</span></td>
                    <td>${cert.fecha_vigencia}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="certificadosManager.verCertificado('${cert._id}')">Ver</button>
                        <button class="btn btn-sm btn-warning" onclick="certificadosManager.editarCertificadoById('${cert._id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="certificadosManager.eliminarCertificadoById('${cert._id}')">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        tabla.innerHTML = html;
        container.style.display = 'block';
        
        // Ocultar certificado individual
        this.ocultarCertificado();
    }

    mostrarModalAgregar() {
        if (!this.isAdmin()) return;
        const modal = document.getElementById('modalAgregarCertificado');
        if (modal) modal.style.display = 'block';
    }

    mostrarModalEditar() {
        if (!this.isAdmin() || !this.currentCertificate) return;
        
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
        document.getElementById('edit-linkIaf').value = cert.link_iaf || '';

        modal.style.display = 'block';
    }

    async agregarCertificado(e) {
        e.preventDefault();
        if (!this.isAdmin()) return;

        const formData = new FormData(e.target);
        
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
            link_iaf: formData.get('linkIaf')
        };

        try {
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
            link_iaf: formData.get('linkIaf')
        };

        try {
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

    // Métodos auxiliares para la tabla
    async verCertificado(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (response.ok) {
                const certificado = await response.json();
                this.currentCertificate = certificado;
                this.mostrarCertificado(certificado);
                
                // Ocultar lista
                const lista = document.getElementById('listaCertificados');
                if (lista) lista.style.display = 'none';
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
        this.listarCertificados(); // Refrescar lista
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.certificadosManager = new CertificadosManager();
});