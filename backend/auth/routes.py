from backend.dev_logs import add_log, get_logs
from fastapi import Request
# --- Límite de intentos de login ---
from collections import defaultdict
import time

# Máximo de intentos y ventana de tiempo (en segundos)
MAX_LOGIN_ATTEMPTS = 5
LOGIN_WINDOW = 300  # 5 minutos
login_attempts = defaultdict(list)  # {key: [timestamps]}

def is_login_allowed(key):
    now = time.time()
    # Elimina intentos fuera de la ventana
    login_attempts[key] = [t for t in login_attempts[key] if now - t < LOGIN_WINDOW]
    return len(login_attempts[key]) < MAX_LOGIN_ATTEMPTS

def register_login_attempt(key):
    login_attempts[key].append(time.time())

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import os


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Configuración JWT
SECRET_KEY = os.environ.get("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 día

# Simulación de usuarios (reemplaza por base de datos real en producción)
# Las contraseñas deben estar hasheadas en producción
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "admin123",  # Solo para ejemplo
        "role": "admin"
    },
    "dev": {
        "username": "dev",
        "hashed_password": "dev123",  # Solo para ejemplo
        "role": "dev"
    }
}


class Token(BaseModel):
    access_token: str
    token_type: str


# El token será username-token, pero para saber el rol, lo buscamos en users_db

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    # Limitar por usuario+IP
    ip = request.client.host if request else 'unknown'
    key = f"{form_data.username}:{ip}"
    if not is_login_allowed(key):
        raise HTTPException(status_code=429, detail="Demasiados intentos fallidos. Intenta más tarde.")
    user = users_db.get(form_data.username)
    if not user or form_data.password != user["hashed_password"]:
        register_login_attempt(key)
        add_log("login_failed", form_data.username, f"IP: {ip}")
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    # Si login exitoso, limpia los intentos
    login_attempts[key] = []
    add_log("login_success", form_data.username, f"IP: {ip}")
    access_token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint para crear usuario admin, solo accesible por dev

class UserCreate(BaseModel):
    username: str
    password: str


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = users_db.get(username)
    if user is None:
        raise credentials_exception
    return {"username": username, "role": role}

@router.post("/create-admin")
def create_admin(user: UserCreate, current_user: dict = Depends(get_current_user)):
    # Solo un dev puede crear administradores
    if current_user["role"] != "dev":
        add_log("admin_create_denied", current_user["username"], f"Intento crear admin: {user.username}")
        raise HTTPException(status_code=403, detail="Solo un usuario dev puede crear administradores")
    if user.username in users_db:
        add_log("admin_create_exists", current_user["username"], f"Intento duplicado: {user.username}")
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    users_db[user.username] = {
        "username": user.username,
        "hashed_password": user.password,  # Hashea en producción
        "role": "admin"
    }
    add_log("admin_created", current_user["username"], f"Nuevo admin: {user.username}")
    return {"msg": f"Usuario administrador '{user.username}' creado"}
# Endpoint para consultar logs (solo dev)
@router.get("/dev-logs")
def get_dev_logs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo dev puede ver logs")
    return get_logs()


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user["username"], "role": current_user["role"]}
