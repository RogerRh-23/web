import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

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

# Importar routers
try:
    from auth.routes import router as auth_router
    from drive.routes import router as drive_router
    from certificados.routes import router as certificados_router
    from routes.contacto import router as contacto_router
except ImportError as e:
    logger.error(f"Error importing routers: {e}")
    raise

# Crear aplicación FastAPI
app = FastAPI()

# Middleware para redirigir www a no-www
class WWWRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        if host.startswith("www."):
            new_host = host[4:]
            scheme = "https" if request.url.scheme == "https" else "http"
            new_url = f"{scheme}://{new_host}{request.url.path}"
            if request.url.query:
                new_url += f"?{request.url.query}"
            return RedirectResponse(url=new_url, status_code=301)
        return await call_next(request)

app.add_middleware(WWWRedirectMiddleware)

# Rutas raíz
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/index.html")

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

# Servir archivos estáticos del frontend
public_path = "/public"
logger.info(f"Intentando servir archivos estáticos desde: {public_path}")
logger.info(f"Directorio existe: {os.path.exists(public_path)}")

if os.path.exists(public_path):
    app.mount("/", StaticFiles(directory=public_path, html=True), name="static")
    logger.info("✅ Archivos estáticos montados en /")
else:
    logger.warning(f"⚠️ Directorio {public_path} no encontrado, pero montando de todas formas")

# Incluir routers
app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router, prefix="/certificados")
app.include_router(contacto_router, prefix="/contacto")

logger.info("✅ Aplicación FastAPI inicializada correctamente")
