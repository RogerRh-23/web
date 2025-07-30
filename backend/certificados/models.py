from pydantic import BaseModel
from typing import Optional

class Certificado(BaseModel):
    org: str  # Nombre de la organización
    estandar: str  # Estándar del certificado
    estado: str  # Estatus (Vigente/Vencido)
    num: str  # Número de certificado
    inicio: str  # Fecha de inicio
    fin: str  # Fecha de finalización
    archivoNombre: Optional[str] = None  # Nombre del archivo subido
    archivoId: Optional[str] = None  # ID del archivo en Google Drive
