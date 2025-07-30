from .models import Certificado
from typing import List, Optional

# Simulación de base de datos
_certificados = [
    # Ejemplo de certificado, elimina o reemplaza por integración con base de datos real
    Certificado(
        org='LACS S.A. de C.V.',
        estandar='ISO 9001',
        estado='Vigente',
        num='2024-0123',
        inicio='2024-01-01',
        fin='2025-01-01',
        archivoNombre='certificado1.pdf',
        archivoId='driveid1'
    )
]

def get_all_certificados() -> List[Certificado]:
    return _certificados

def buscar_certificado(num: Optional[str] = None, org: Optional[str] = None) -> Optional[Certificado]:
    for cert in _certificados:
        if num and cert.num == num:
            return cert
        if org and cert.org.lower() == org.lower():
            return cert
    return None
