from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
from .models import Certificado, CertificadoCreate, CertificadoUpdate
from .mongo_storage import (
    get_all_certificados_mongo, 
    buscar_certificado_mongo,
    crear_certificado_mongo,
    actualizar_certificado_mongo,
    eliminar_certificado_mongo,
    get_certificado_by_id_mongo
)

try:
    from backend.auth.routes import get_current_user  # Local
except ModuleNotFoundError:
    from auth.routes import get_current_user  # Railway/Cloud

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# ====== ENDPOINTS PARA ADMINISTRADORES ======

@router.get("/", response_model=List[Certificado])
def listar_certificados(current_user: dict = Depends(get_current_user)):
    """Lista todos los certificados - Solo admin"""
    if current_user["role"] not in ["admin", "dev"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden ver todos los certificados")
    
    try:
        return get_all_certificados_mongo()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener certificados: {str(e)}")

@router.post("/", response_model=dict)
def crear_certificado(
    certificado: CertificadoCreate, 
    current_user: dict = Depends(get_current_user)
):
    """Crea un nuevo certificado - Solo admin"""
    if current_user["role"] not in ["admin", "dev"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden crear certificados")
    
    try:
        certificado_id = crear_certificado_mongo(certificado)
        return {"id": certificado_id, "message": "Certificado creado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear certificado: {str(e)}")

@router.get("/{certificado_id}", response_model=Certificado)
def obtener_certificado(
    certificado_id: str, 
    current_user: dict = Depends(get_current_user)
):
    """Obtiene un certificado por ID - Solo admin"""
    if current_user["role"] not in ["admin", "dev"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    certificado = get_certificado_by_id_mongo(certificado_id)
    if not certificado:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    
    return certificado

@router.put("/{certificado_id}", response_model=dict)
def actualizar_certificado(
    certificado_id: str,
    certificado: CertificadoUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Actualiza un certificado - Solo admin"""
    if current_user["role"] not in ["admin", "dev"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden editar certificados")
    
    try:
        success = actualizar_certificado_mongo(certificado_id, certificado)
        if not success:
            raise HTTPException(status_code=404, detail="Certificado no encontrado")
        
        return {"message": "Certificado actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar certificado: {str(e)}")

@router.delete("/{certificado_id}", response_model=dict)
def eliminar_certificado(
    certificado_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Elimina un certificado - Solo admin"""
    if current_user["role"] not in ["admin", "dev"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden eliminar certificados")
    
    try:
        success = eliminar_certificado_mongo(certificado_id)
        if not success:
            raise HTTPException(status_code=404, detail="Certificado no encontrado")
        
        return {"message": "Certificado eliminado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar certificado: {str(e)}")

# ====== ENDPOINTS PÚBLICOS ======

@router.get("/buscar/publico", response_model=Optional[Certificado])
def buscar_certificado_publico(
    numero_certificado: Optional[str] = Query(None, description="Número de certificado"),
    nombre_empresa: Optional[str] = Query(None, description="Nombre de la empresa"),
    id_empresa: Optional[str] = Query(None, description="ID de la empresa")
):
    """Búsqueda pública de certificados"""
    if not numero_certificado and not nombre_empresa and not id_empresa:
        raise HTTPException(
            status_code=400, 
            detail="Debe proporcionar al menos un parámetro de búsqueda: numero_certificado, nombre_empresa o id_empresa"
        )
    
    try:
        cert = buscar_certificado_mongo(
            numero_certificado=numero_certificado,
            nombre_empresa=nombre_empresa, 
            id_empresa=id_empresa
        )
        
        if not cert:
            raise HTTPException(status_code=404, detail="Certificado no encontrado")
        
        return cert
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la búsqueda: {str(e)}")
