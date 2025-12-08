# Definir mongo_client globalmente al inicio
mongo_client = None
from fastapi import FastAPI
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

logger.info(f"MONGODB_URI configurado: {'Sí' if MONGODB_URI else 'No'}")

if MONGODB_URI:
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
    try:
        mongo_client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        mongo_client.admin.command('ping')
        logger.info("✅ Conexión exitosa a MongoDB Atlas!")
    except Exception as e:
        logger.error(f"❌ Error al conectar a MongoDB Atlas: {e}")
        mongo_client = None
else:
    logger.error("❌ MONGODB_URI no está configurada en las variables de entorno.")
try:
    from auth.routes import router as auth_router
    from drive.routes import router as drive_router
    from certificados.routes import router as certificados_router
    from backend.routes.contacto import router as contacto_router  # Local
except ModuleNotFoundError:
    from auth.routes import router as auth_router
    from drive.routes import router as drive_router
    from certificados.routes import router as certificados_router
    from routes.contacto import router as contacto_router  # Railway/Cloud
import os
from dotenv import load_dotenv
load_dotenv()



from fastapi.responses import RedirectResponse
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

app = FastAPI()

# Middleware para redirigir www a no-www
class WWWRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        # Si el host empieza con www., redirigir a la versión sin www
        if host.startswith("www."):
            # Construir la nueva URL sin www
            new_host = host[4:]  # Quitar "www."
            scheme = "https" if request.url.scheme == "https" else "http"
            new_url = f"{scheme}://{new_host}{request.url.path}"
            if request.url.query:
                new_url += f"?{request.url.query}"
            return RedirectResponse(url=new_url, status_code=301)
        
        response = await call_next(request)
        return response

# Agregar el middleware
app.add_middleware(WWWRedirectMiddleware)

# Redirigir la raíz a /static/index.html
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/static/index.html")

# Endpoints principales definidos antes de los routers para que aparezcan en /docs
@app.get("/ping", tags=["Debug"])
def ping():
    """
    Endpoint de prueba para verificar que FastAPI responde correctamente.
    """
    return {"message": "pong"}

@app.get("/db-status", tags=["Debug"])
def db_status():
    """
    Verifica la conexión a MongoDB Atlas.
    Devuelve el estado de la conexión.
    """
    global mongo_client
    global mongo_client
    print("mongo_client:", mongo_client)
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            return {"status": "Conexión exitosa a MongoDB Atlas"}
        except Exception as e:
            print("Error en ping:", e)
            return {"status": "Error de conexión", "detail": str(e)}
    return {"status": "No se encontró la variable MONGODB_URI"}

@app.get("/routes", tags=["Debug"])
def get_routes():
    """
    Devuelve la lista de rutas registradas en la aplicación FastAPI.
    """
    return {"routes": [route.path for route in app.routes]}

# Servir archivos estáticos del frontend en /static
from fastapi.staticfiles import StaticFiles
import os
# Ruta relativa desde backend/ hacia public/
current_file_dir = os.path.dirname(os.path.abspath(__file__))  # backend/
parent_dir = os.path.dirname(current_file_dir)  # lacs/
public_path = os.path.join(parent_dir, "public")  # lacs/public/
print(f"[STATIC] Intentando servir archivos desde: {public_path}")
print(f"[STATIC] ¿Existe el directorio?: {os.path.exists(public_path)}")
if os.path.exists(public_path):
    app.mount("/static", StaticFiles(directory=public_path, html=True), name="static")
    print(f"[STATIC] Archivos estáticos montados correctamente en /static")
else:
    print(f"[STATIC] ERROR: No se encontró el directorio {public_path}")
    # Fallback: buscar public en el directorio actual de trabajo
    fallback_path = os.path.join(os.getcwd(), "public")
    print(f"[STATIC] Intentando fallback: {fallback_path}")
    if os.path.exists(fallback_path):
        app.mount("/static", StaticFiles(directory=fallback_path, html=True), name="static")
        print(f"[STATIC] Fallback exitoso: archivos servidos desde {fallback_path}")
    else:
        print(f"[STATIC] ERROR CRÍTICO: No se puede encontrar la carpeta public")
app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router, prefix="/certificados")

@app.post("/init-admin")
def init_admin():
    """Inicializa el sistema con un usuario administrador por defecto - Solo para desarrollo"""
    try:
        from auth.routes import db
        import bcrypt
        
        # Verificar si ya existe un admin
        users_collection = db["users"]
        existing_admin = users_collection.find_one({"role": "admin"})
        
        if existing_admin:
            return {"message": "Ya existe un administrador en el sistema", "admin_exists": True}
        
        # Crear administrador por defecto
        hashed_pw = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_doc = {
            "username": "admin",
            "email": "admin@lacs.org",
            "hashed_password": hashed_pw,
            "role": "admin"
        }
        
        result = users_collection.insert_one(admin_doc)
        
        if result.inserted_id:
            return {
                "message": "Administrador creado exitosamente", 
                "username": "admin",
                "password": "admin123",
                "admin_created": True
            }
        else:
            return {"error": "No se pudo crear el administrador", "admin_created": False}
            
    except Exception as e:
        return {"error": f"Error al crear administrador: {str(e)}", "admin_created": False}

