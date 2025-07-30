from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Simulación de usuarios (reemplaza por base de datos real si lo necesitas)
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "admin123",  # Solo para ejemplo
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form_data.username)
    if not user or form_data.password != user["hashed_password"]:
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    # Genera un token simple (en producción usa JWT)
    return {"access_token": user["username"] + "-token", "token_type": "bearer"}

@router.get("/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    # Simulación de validación de token
    if not token or not token.endswith("-token"):
        raise HTTPException(status_code=401, detail="Token inválido")
    return {"user": token.replace("-token", "")}
