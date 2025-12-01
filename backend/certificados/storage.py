from .models import Certificado
from typing import List, Optional

# Simulación de base de datos en memoria (para pruebas locales)
# Este archivo se mantiene como fallback para desarrollo local
_certificados = [
    # Ejemplo de certificado con nueva estructura
    Certificado(
        nombre_empresa="LACS S.A. de C.V.",
        numero_certificado="2024-00123",
        id_empresa="EMP-001",
        estado="Vigente",
        fecha_emision="2024-01-01",
        fecha_vigencia="2025-01-01",
        sector_iaf="IAF 9",
        codigo_nace="62010",
        referencia_normativa="ISO 9001:2015",
        alcance_certificacion="Diseño, desarrollo, implementación y mantenimiento de sistemas de gestión de calidad",
        instalaciones=["Oficina Central - Av. Principal 123, Ciudad de México", "Planta Norte - Calle Industrial 456, Monterrey"],
        link_iaf="https://iaf.nu/certificate/2024-00123",
        codigo_qr="data:image/png;base64,example_qr_code",
        archivo_pdf="certificado_2024_00123.pdf"
    )
]

def get_all_certificados() -> List[Certificado]:
    return _certificados

def buscar_certificado(
    numero_certificado: Optional[str] = None, 
    nombre_empresa: Optional[str] = None,
    id_empresa: Optional[str] = None
) -> Optional[Certificado]:
    for cert in _certificados:
        if (numero_certificado and numero_certificado in cert.numero_certificado) or \
           (nombre_empresa and nombre_empresa.lower() in cert.nombre_empresa.lower()) or \
           (id_empresa and cert.id_empresa == id_empresa):
            return cert
    return None
