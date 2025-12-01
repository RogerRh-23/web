from pymongo import MongoClient
from .models import Certificado, CertificadoCreate, CertificadoUpdate
from typing import Optional, List
import os
import qrcode
import io
import base64
from datetime import datetime
from bson import ObjectId

# Configuración de conexión (ajusta la URI según tu cuenta de MongoDB Atlas)
try:
    from backend.main import mongo_client  # Local
except ModuleNotFoundError:
    from main import mongo_client  # Railway/Cloud

db = mongo_client["lacs"]
collection = db['certificados']

def generar_codigo_qr(link_iaf: str) -> str:
    """Genera un código QR en base64 a partir del link IAF"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(link_iaf)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def get_all_certificados_mongo() -> List[Certificado]:
    """Obtiene todos los certificados"""
    docs = list(collection.find({}))
    certificados = []
    for doc in docs:
        # Convertir ObjectId a string para serialización
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
        certificados.append(Certificado(**doc))
    return certificados

def buscar_certificado_mongo(
    numero_certificado: Optional[str] = None, 
    nombre_empresa: Optional[str] = None,
    id_empresa: Optional[str] = None
) -> Optional[Certificado]:
    """Busca un certificado por número, nombre de empresa o ID de empresa"""
    query = {}
    
    if numero_certificado:
        query['numero_certificado'] = {"$regex": numero_certificado, "$options": "i"}
    if nombre_empresa:
        query['nombre_empresa'] = {"$regex": nombre_empresa, "$options": "i"}
    if id_empresa:
        query['id_empresa'] = id_empresa
    
    if not query:
        return None
        
    doc = collection.find_one(query)
    if doc:
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
        return Certificado(**doc)
    return None

def crear_certificado_mongo(certificado_data: CertificadoCreate) -> str:
    """Crea un nuevo certificado"""
    # Convertir a dict y agregar metadatos
    cert_dict = certificado_data.dict()
    cert_dict['fecha_creacion'] = datetime.utcnow()
    cert_dict['fecha_actualizacion'] = datetime.utcnow()
    
    # Generar código QR
    cert_dict['codigo_qr'] = generar_codigo_qr(cert_dict['link_iaf'])
    
    result = collection.insert_one(cert_dict)
    return str(result.inserted_id)

def actualizar_certificado_mongo(certificado_id: str, certificado_data: CertificadoUpdate) -> bool:
    """Actualiza un certificado existente"""
    # Filtrar campos None
    update_data = {k: v for k, v in certificado_data.dict().items() if v is not None}
    
    if not update_data:
        return False
        
    update_data['fecha_actualizacion'] = datetime.utcnow()
    
    # Regenerar QR si se actualiza el link IAF
    if 'link_iaf' in update_data:
        update_data['codigo_qr'] = generar_codigo_qr(update_data['link_iaf'])
    
    result = collection.update_one(
        {"_id": ObjectId(certificado_id)}, 
        {"$set": update_data}
    )
    return result.modified_count > 0

def eliminar_certificado_mongo(certificado_id: str) -> bool:
    """Elimina un certificado"""
    result = collection.delete_one({"_id": ObjectId(certificado_id)})
    return result.deleted_count > 0

def get_certificado_by_id_mongo(certificado_id: str) -> Optional[Certificado]:
    """Obtiene un certificado por ID"""
    doc = collection.find_one({"_id": ObjectId(certificado_id)})
    if doc:
        doc['_id'] = str(doc['_id'])
        return Certificado(**doc)
    return None
