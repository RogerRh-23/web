from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
from .models import Certificado
from .storage import get_all_certificados, buscar_certificado
from .mongo_storage import get_all_certificados_mongo, buscar_certificado_mongo

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Endpoint solo para admin (requiere token)
@router.get("/certificados", response_model=List[Certificado])
def listar_certificados(token: str = Depends(oauth2_scheme)):
    # Validación de token para admin (ajusta para producción)
    if token != "admin-token":
        raise HTTPException(status_code=403, detail="No autorizado")
    try:
        return get_all_certificados_mongo()
    except Exception:
        return get_all_certificados()

# Endpoint público para buscar certificado
@router.get("/certificados/buscar", response_model=Optional[Certificado])
def buscar_cert(
    num: Optional[str] = Query(None),
    org: Optional[str] = Query(None)
):
    try:
        cert = buscar_certificado_mongo(num=num, org=org)
    except Exception:
        cert = buscar_certificado(num=num, org=org)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificado no encontrado")
    return cert
