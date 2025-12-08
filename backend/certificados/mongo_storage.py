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

def crear_certificado_simple_mongo(certificado_data) -> str:
    """Crea un certificado simple (para pruebas)"""
    from .models import CertificadoSimple
    
    # Si es un dict, convertir a modelo
    if isinstance(certificado_data, dict):
        # Convertir campos de fecha si es necesario
        cert_dict = certificado_data.copy()
    else:
        cert_dict = certificado_data.dict()
    
    # Agregar metadatos
    cert_dict['fecha_creacion'] = datetime.utcnow()
    cert_dict['fecha_actualizacion'] = datetime.utcnow()
    
    # Generar link IAF ficticio para certificados de prueba
    cert_dict['link_iaf'] = f"https://lacs.org/certificado/{cert_dict['numero_certificado']}"
    
    # Generar código QR
    cert_dict['codigo_qr'] = generar_codigo_qr(cert_dict['link_iaf'])
    
    # Convertir a formato del modelo completo para compatibilidad
    cert_completo = {
        'nombre_empresa': cert_dict.get('organizacion_emisora', 'LACS'),
        'numero_certificado': cert_dict['numero_certificado'],
        'id_empresa': cert_dict.get('cedula', 'N/A'),
        'estado': cert_dict.get('estado', 'vigente'),
        'fecha_emision': cert_dict.get('fecha_expedicion', ''),
        'fecha_vigencia': cert_dict.get('fecha_vencimiento', ''),
        'sector_iaf': 'Educación y Capacitación',
        'codigo_nace': '85.59',
        'referencia_normativa': cert_dict.get('curso', 'Curso General'),
        'alcance_certificacion': f"{cert_dict.get('curso', 'Curso')} - {cert_dict.get('modalidad', 'Virtual')}",
        'instalaciones': [cert_dict.get('organizacion_emisora', 'LACS')],
        'link_iaf': cert_dict['link_iaf'],
        'codigo_qr': cert_dict['codigo_qr'],
        'fecha_creacion': cert_dict['fecha_creacion'],
        'fecha_actualizacion': cert_dict['fecha_actualizacion'],
        # Campos específicos del certificado simple
        'nombre_completo': cert_dict.get('nombre_completo', ''),
        'cedula': cert_dict.get('cedula', ''),
        'curso': cert_dict.get('curso', ''),
        'modalidad': cert_dict.get('modalidad', 'Virtual'),
        'horas': cert_dict.get('horas', 40),
        'fecha_expedicion': cert_dict.get('fecha_expedicion', ''),
        'fecha_vencimiento': cert_dict.get('fecha_vencimiento', ''),
        'organizacion_emisora': cert_dict.get('organizacion_emisora', 'LACS')
    }
    
    result = collection.insert_one(cert_completo)
    return str(result.inserted_id)

def actualizar_certificado_mongo(certificado_id: str, certificado_data: CertificadoUpdate) -> bool:
    """Actualiza un certificado existente"""
    try:
        # Filtrar campos None
        update_data = {k: v for k, v in certificado_data.dict().items() if v is not None}
        
        if not update_data:
            return False
            
        update_data['fecha_actualizacion'] = datetime.utcnow()
        
        # Regenerar QR si se actualiza el link IAF
        if 'link_iaf' in update_data:
            update_data['codigo_qr'] = generar_codigo_qr(update_data['link_iaf'])
        
        # Determinar el filtro según el tipo de ID
        if ObjectId.is_valid(certificado_id):
            filter_query = {"_id": ObjectId(certificado_id)}
        else:
            filter_query = {
                "$or": [
                    {"numero_certificado": certificado_id},
                    {"id_empresa": certificado_id}
                ]
            }
        
        result = collection.update_one(filter_query, {"$set": update_data})
        return result.modified_count > 0
    except Exception as e:
        print(f"Error en actualizar_certificado_mongo: {e}")
        return False

def eliminar_certificado_mongo(certificado_id: str) -> bool:
    """Elimina un certificado"""
    try:
        # Determinar el filtro según el tipo de ID
        if ObjectId.is_valid(certificado_id):
            filter_query = {"_id": ObjectId(certificado_id)}
        else:
            filter_query = {
                "$or": [
                    {"numero_certificado": certificado_id},
                    {"id_empresa": certificado_id}
                ]
            }
        
        result = collection.delete_one(filter_query)
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error en eliminar_certificado_mongo: {e}")
        return False

def get_certificado_by_id_mongo(certificado_id: str) -> Optional[Certificado]:
    """Obtiene un certificado por ID"""
    try:
        # Intentar convertir a ObjectId si es posible
        if ObjectId.is_valid(certificado_id):
            doc = collection.find_one({"_id": ObjectId(certificado_id)})
        else:
            # Si no es un ObjectId válido, buscar por otros campos
            doc = collection.find_one({
                "$or": [
                    {"numero_certificado": certificado_id},
                    {"id_empresa": certificado_id}
                ]
            })
        
        if doc:
            doc['_id'] = str(doc['_id'])
            return Certificado(**doc)
        return None
    except Exception as e:
        print(f"Error en get_certificado_by_id_mongo: {e}")
        return None
