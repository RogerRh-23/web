from pymongo import MongoClient
from .models import Certificado
from typing import Optional
import os

# Configuración de conexión (ajusta la URI según tu cuenta de MongoDB Atlas)
MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://usuario:password@cluster.mongodb.net/lacs?retryWrites=true&w=majority')
client = MongoClient(MONGO_URI)
db = client['lacs']
collection = db['certificados']

def get_all_certificados_mongo():
    docs = collection.find({}, {
        'org': 1,
        'estandar': 1,
        'estado': 1,
        'num': 1,
        'inicio': 1,
        'fin': 1,
        'archivoNombre': 1,
        'archivoId': 1
    })
    return [Certificado(**doc) for doc in docs]

def buscar_certificado_mongo(num: Optional[str] = None, org: Optional[str] = None) -> Optional[Certificado]:
    query = {}
    if num:
        query['num'] = num
    if org:
        query['org'] = org
    doc = collection.find_one(query, {
        'org': 1,
        'estandar': 1,
        'estado': 1,
        'num': 1,
        'inicio': 1,
        'fin': 1,
        'archivoNombre': 1,
        'archivoId': 1
    })
    if doc:
        return Certificado(**doc)
    return None
