from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Certificado(BaseModel):
    # Información básica
    nombre_empresa: str                    # Nombre de la empresa
    numero_certificado: str               # No. de certificado
    id_empresa: str                       # ID de la empresa
    
    # Estado y fechas
    estado: str                           # Vigente, Suspendido, Vencido, Cancelado
    fecha_emision: str                    # Fecha de emisión
    fecha_vigencia: str                   # Fecha de vigencia
    
    # Información técnica
    sector_iaf: str                       # Sector IAF
    codigo_nace: str                      # Código NACE
    referencia_normativa: str             # Referencia normativa (ISO 9001, etc.)
    alcance_certificacion: str            # Alcance de la certificación
    
    # Instalaciones/Ubicaciones (puede ser múltiples)
    instalaciones: List[str]              # Lista de ubicaciones/instalaciones
    
    # Enlaces y archivos
    link_iaf: str                         # Link a la página del IAF
    codigo_qr: Optional[str] = None       # Código QR generado automáticamente
    archivo_pdf: Optional[str] = None     # Nombre del archivo PDF
    archivo_pdf_id: Optional[str] = None  # ID del archivo PDF en almacenamiento
    
    # Metadatos
    fecha_creacion: Optional[datetime] = None
    fecha_actualizacion: Optional[datetime] = None

class CertificadoCreate(BaseModel):
    nombre_empresa: str
    numero_certificado: str
    id_empresa: str
    estado: str
    fecha_emision: str
    fecha_vigencia: str
    sector_iaf: str
    codigo_nace: str
    referencia_normativa: str
    alcance_certificacion: str
    instalaciones: List[str]
    link_iaf: str

class CertificadoUpdate(BaseModel):
    nombre_empresa: Optional[str] = None
    numero_certificado: Optional[str] = None
    id_empresa: Optional[str] = None
    estado: Optional[str] = None
    fecha_emision: Optional[str] = None
    fecha_vigencia: Optional[str] = None
    sector_iaf: Optional[str] = None
    codigo_nace: Optional[str] = None
    referencia_normativa: Optional[str] = None
    alcance_certificacion: Optional[str] = None
    instalaciones: Optional[List[str]] = None
    link_iaf: Optional[str] = None
