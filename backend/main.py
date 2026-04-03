import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# Inicializar MongoDB
mongo_client = None
MONGODB_URI = os.getenv("MONGODB_URI")

logger.info(f"MONGODB_URI configurado: {'Sí' if MONGODB_URI else 'No'}")

if MONGODB_URI:
    try:
        from pymongo.mongo_client import MongoClient
        from pymongo.server_api import ServerApi
        mongo_client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        mongo_client.admin.command('ping')
        logger.info("✅ Conexión exitosa a MongoDB Atlas!")
    except Exception as e:
        logger.error(f"❌ Error al conectar a MongoDB Atlas: {e}")
        mongo_client = None

# Importar routers - con manejo de errores
auth_router = None
drive_router = None
certificados_router = None
contacto_router = None

try:
    from auth.routes import router as auth_router
    logger.info("✅ auth router cargado")
except ImportError as e:
    logger.warning(f"⚠️ No se pudo cargar auth router: {e}")

try:
    from drive.routes import router as drive_router
    logger.info("✅ drive router cargado")
except ImportError as e:
    logger.warning(f"⚠️ No se pudo cargar drive router: {e}")

try:
    from certificados.routes import router as certificados_router
    logger.info("✅ certificados router cargado")
except ImportError as e:
    logger.warning(f"⚠️ No se pudo cargar certificados router: {e}")

try:
    from routes.contacto import router as contacto_router
    logger.info("✅ contacto router cargado")
except ImportError as e:
    logger.warning(f"⚠️ No se pudo cargar contacto router: {e}")

# Crear aplicación FastAPI
app = FastAPI()

# Configurar CORS para permitir POST desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

# Ruta raíz explícita - DEBE SER ANTES del mount de "/"
@app.get("/", include_in_schema=False)
async def root():
    """Redirige la raíz a index.html"""
    return RedirectResponse(url="/index.html")

# Rutas raíz (específicas)
@app.get("/ping", tags=["Debug"])
def ping():
    return {"message": "pong"}

@app.get("/db-status", tags=["Debug"])
def db_status():
    global mongo_client
    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            return {"status": "Conexión exitosa a MongoDB Atlas"}
        except Exception as e:
            return {"status": "Error de conexión", "detail": str(e)}
    return {"status": "MongoDB no está conectado"}

@app.get("/routes", tags=["Debug"])
def get_routes():
    return {"routes": [route.path for route in app.routes]}

# Incluir routers ANTES del mount de "/"
if auth_router:
    app.include_router(auth_router, prefix="/api/auth")
if drive_router:
    app.include_router(drive_router, prefix="/api/drive")
if certificados_router:
    app.include_router(certificados_router, prefix="/api/certificados")
if contacto_router:
    app.include_router(contacto_router, prefix="/api/contacto")

# Servir archivos estáticos - DEBE SER EL ÚLTIMO
if os.path.exists("/public"):
    app.mount("/", StaticFiles(directory="/public", html=True), name="static")
    logger.info("✅ Archivos estáticos montados en /")

logger.info("✅ Aplicación FastAPI inicializada correctamente")
