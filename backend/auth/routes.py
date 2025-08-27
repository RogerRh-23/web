from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta
import requests
import os

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta
import requests
import os
from collections import defaultdict
import time
try:
    from backend.dev_logs import add_log, get_logs  # Local
except ModuleNotFoundError:
    from dev_logs import add_log, get_logs  # Railway/Cloud

router = APIRouter()

# Token response model
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Límite de intentos de login ---
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# --- OAuth Google/Microsoft ---
@router.post("/oauth/google")
async def oauth_google(request: Request):
    data = await request.json()
    token = data.get("token")
    if not token:
        return {"error": "No token provided"}
    # Validar token con Google
    resp = requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo", headers={"Authorization": f"Bearer {token}"})
    if resp.status_code == 200:
        userinfo = resp.json()
        # Aquí puedes crear el usuario en tu base de datos si no existe
        return {"user": userinfo}
    return {"error": "Invalid Google token"}

@router.post("/oauth/microsoft")
async def oauth_microsoft(request: Request):
    data = await request.json()
    token = data.get("token")
    if not token:
        return {"error": "No token provided"}
    # Validar token con Microsoft
    resp = requests.get(
        "https://graph.microsoft.com/v1.0/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    if resp.status_code == 200:
        userinfo = resp.json()
        # Aquí puedes crear el usuario en tu base de datos si no existe
        return {"user": userinfo}
    return {"error": "Invalid Microsoft token"}

# Configuración JWT
SECRET_KEY = os.environ.get("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 día

try:
    from backend.main import mongo_client  # Local
except ModuleNotFoundError:
    from main import mongo_client  # Railway/Cloud
db = mongo_client["lacs"]
users_collection = db["usuarios"]



# El token será username-token, pero para saber el rol, lo buscamos en users_db

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    ip = request.client.host if request else 'unknown'
    key = f"{form_data.username}:{ip}"
    if not is_login_allowed(key):
        raise HTTPException(status_code=429, detail="Demasiados intentos fallidos. Intenta más tarde.")
    user = users_collection.find_one({"username": form_data.username})
    if not user or form_data.password != user.get("hashed_password"):
        register_login_attempt(key)
        add_log("login_failed", form_data.username, f"IP: {ip}")
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    login_attempts[key] = []
    add_log("login_success", form_data.username, f"IP: {ip}")
    access_token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint para crear usuario admin, solo accesible por dev

class UserCreate(BaseModel):
    username: str
    email: str
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
    user = users_collection.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return {"username": username, "role": role}

@router.post("/register")
def register_user(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        return {"error": "El usuario ya existe"}
    users_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "hashed_password": user.password,  # Hashea en producción
        "role": "user"
    })
    add_log("user_registered", user.username, f"Nuevo usuario: {user.email}")
    return {"msg": f"Usuario '{user.username}' registrado"}
# Endpoint para consultar logs (solo dev)
@router.get("/dev-logs")
def get_dev_logs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo dev puede ver logs")
    return get_logs()


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user["username"], "role": current_user["role"]}
