# Definir mongo_client globalmente al inicio
mongo_client = None
from fastapi import FastAPI
import os
from dotenv import load_dotenv
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
if MONGODB_URI:
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
    mongo_client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
    try:
        mongo_client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print("Error al conectar a MongoDB Atlas:", e)
else:
    print("MONGODB_URI no está configurada en las variables de entorno.")
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
app = FastAPI()

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
public_path = "public"
app.mount("/static", StaticFiles(directory=public_path, html=True), name="static")
app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router, prefix="/certificados")

