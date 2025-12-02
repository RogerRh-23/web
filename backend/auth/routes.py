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
import bcrypt

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

try:
    from backend.dev_logs import add_log, get_logs  # Local
except ModuleNotFoundError:
    from dev_logs import add_log, get_logs  # Railway/Cloud

router = APIRouter()

# Token response model
class Token(BaseModel):
    access_token: str
    token_type: str

# User creation model
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

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

# Endpoint para consultar logs de la colección logs (solo dev)
@router.get("/logs")
def get_all_logs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo dev puede ver logs")
    logs = list(db["logs"].find({}, {"_id": 0}))
    return {"logs": logs}

@router.post("/create-admin")
def create_admin(user: UserCreate, current_user: dict = Depends(get_current_user)):
    # Solo los desarrolladores pueden crear administradores
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo desarrolladores pueden crear administradores")
    
    log_msg = f"Dev {current_user['username']} intentando crear admin: {user.username}, email: {user.email}"
    add_log("create_admin_attempt", current_user["username"], log_msg)
    
    # Validar campos
    if not user.username or not user.email or not user.password:
        add_log("create_admin_failed", current_user["username"], "Faltan campos para crear admin")
        raise HTTPException(status_code=400, detail="Faltan campos requeridos")
    
    # Verificar si el usuario ya existe
    if users_collection.find_one({"username": user.username}):
        add_log("create_admin_failed", current_user["username"], f"Admin ya existe: {user.username}")
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # Crear administrador
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin_doc = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": "admin"  # Rol específico de administrador
    }
    
    result = users_collection.insert_one(admin_doc)
    
    if result.inserted_id:
        add_log("admin_created", current_user["username"], f"Nuevo admin creado: {user.username} ({user.email})")
        db["logs"].insert_one({
            "event": "admin_created",
            "created_by": current_user["username"],
            "admin_username": user.username,
            "admin_email": user.email,
            "timestamp": datetime.utcnow(),
            "detail": f"Administrador {user.username} creado por dev {current_user['username']}"
        })
        return {"msg": f"Administrador '{user.username}' creado exitosamente"}
    else:
        add_log("create_admin_failed", current_user["username"], "Error al crear admin en la base de datos")
        raise HTTPException(status_code=500, detail="Error al crear el administrador")

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")

# Endpoint para recibir el código de Google OAuth
@router.get("/google/callback")
async def google_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "No se recibió el código de Google"}
    # Intercambio de código por access_token
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
    )
    token_data = token_response.json()
    if "access_token" not in token_data:
        return {"error": "No se pudo obtener el access_token", "details": token_data}
    # Obtener información del usuario
    userinfo_response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {token_data['access_token']}"}
    )
    if userinfo_response.status_code != 200:
        return {"error": "No se pudo obtener información del usuario"}
    userinfo = userinfo_response.json()
    # Aquí puedes crear el usuario en tu base de datos si no existe
    return {"user": userinfo, "token": token_data}

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

# El token será username-token, pero para saber el rol, lo buscamos en users_db

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None):
    try:
        ip = request.client.host if request else 'unknown'
        key = f"{form_data.username}:{ip}"
        print(f"[LOGIN] username recibido: '{form_data.username}'")
        print(f"[LOGIN] password recibido: '{form_data.password}'")
        print(f"[LOGIN] grant_type recibido: '{getattr(form_data, 'grant_type', None)}'")
        print(f"[LOGIN] scope recibido: '{getattr(form_data, 'scope', None)}'")
        
        # Validate required fields
        if not form_data.username or not form_data.password:
            print(f"[LOGIN] Faltan campos username o password")
            add_log("login_error", form_data.username or "unknown", f"Missing fields - IP: {ip}")
            raise HTTPException(status_code=400, detail="Faltan campos username o password")
        
        if not form_data.username.strip() or not form_data.password.strip():
            print(f"[LOGIN] Campos username o password están vacíos")
            add_log("login_error", form_data.username or "unknown", f"Empty fields - IP: {ip}")
            raise HTTPException(status_code=400, detail="Los campos no pueden estar vacíos")
    except Exception as e:
        print(f"[LOGIN] Error en validación inicial: {e}")
        add_log("login_error", "unknown", f"Validation error: {e} - IP: {ip if 'ip' in locals() else 'unknown'}")
        raise HTTPException(status_code=400, detail=f"Error en validación: {str(e)}")
    try:
        user = users_collection.find_one({"username": form_data.username.strip()})
        print(f"[LOGIN] usuario encontrado en Mongo: {user is not None}")
        if user:
            print(f"[LOGIN] usuario data: username={user.get('username')}, role={user.get('role')}, has_password={bool(user.get('hashed_password'))}")
    except Exception as e:
        print(f"[LOGIN] Error consultando usuario en Mongo: {e}")
        add_log("login_error", form_data.username, f"DB error: {e} - IP: {ip}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
        
    if not is_login_allowed(key):
        print(f"[LOGIN] Demasiados intentos para {key}")
        add_log("login_blocked", form_data.username, f"Rate limit - IP: {ip}")
        raise HTTPException(status_code=429, detail="Demasiados intentos fallidos. Intenta más tarde.")
        
    if not user:
        print(f"[LOGIN] Usuario no encontrado: {form_data.username}")
        register_login_attempt(key)
        add_log("login_failed", form_data.username, f"User not found - IP: {ip}")
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    hashed_pw = user.get("hashed_password")
    if not hashed_pw:
        print(f"[LOGIN] Usuario sin contraseña registrada")
        add_log("login_error", form_data.username, f"No password set - IP: {ip}")
        raise HTTPException(status_code=400, detail="Usuario sin contraseña registrada")
        
    try:
        password_valid = bcrypt.checkpw(form_data.password.encode('utf-8'), hashed_pw.encode('utf-8'))
    except Exception as e:
        print(f"[LOGIN] Error verificando contraseña: {e}")
        add_log("login_error", form_data.username, f"Password check error: {e} - IP: {ip}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")
        
    if not password_valid:
        print(f"[LOGIN] Contraseña incorrecta para usuario: {form_data.username}")
        register_login_attempt(key)
        add_log("login_failed", form_data.username, f"Wrong password - IP: {ip}")
        raise HTTPException(status_code=400, detail="Usuario o contraseña incorrectos")
    login_attempts[key] = []
    add_log("login_success", form_data.username, f"IP: {ip}")
    access_token = create_access_token({"sub": user["username"], "role": user["role"]})
    print(f"[LOGIN] Login exitoso para usuario: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}


# Endpoint para crear usuario admin, solo accesible por dev

@router.post("/register")
def register_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    # Solo los desarrolladores pueden usar este endpoint
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo desarrolladores pueden registrar usuarios")
    
    log_msg = f"Dev {current_user['username']} intentando registrar usuario: {user.username}, email: {user.email}"
    add_log("register_attempt", current_user["username"], log_msg)
    if not user.username or not user.email or not user.password:
        add_log("register_failed", user.username if user.username else "None", "Faltan campos en el registro")
        raise HTTPException(status_code=400, detail="Faltan campos en el registro")
    if users_collection.find_one({"username": user.username}):
        add_log("user_register_failed", user.username, f"Intento de registro fallido: usuario ya existe")
        db["logs"].insert_one({
            "event": "user_register_failed",
            "username": user.username,
            "email": user.email,
            "timestamp": datetime.utcnow(),
            "detail": "Intento de registro fallido: usuario ya existe"
        })
        return {"error": "El usuario ya existe"}
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_doc = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_pw,
        "role": "user"
    }
    result = users_collection.insert_one(user_doc)
    if result.inserted_id:
        add_log("user_registered", user.username, f"Nuevo usuario: {user.email}")
        db["logs"].insert_one({
            "event": "user_registered",
            "username": user.username,
            "email": user.email,
            "timestamp": datetime.utcnow(),
            "detail": "Usuario registrado correctamente"
        })
        return {"msg": f"Usuario '{user.username}' registrado"}
    else:
        add_log("register_failed", user.username, "Error al crear usuario en la base de datos")
        return {"error": "No se pudo registrar el usuario"}
# Endpoint para consultar logs (solo dev)
@router.get("/dev-logs")
def get_dev_logs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "dev":
        raise HTTPException(status_code=403, detail="Solo dev puede ver logs")
    return get_logs()


@router.get("/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user["username"], "role": current_user["role"]}
