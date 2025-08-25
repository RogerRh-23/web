# Definir mongo_client globalmente al inicio
mongo_client = None
from fastapi import FastAPI
from auth.routes import router as auth_router
from drive.routes import router as drive_router
from certificados.routes import router as certificados_router
from backend.routes.contacto import router as contacto_router
import os
from dotenv import load_dotenv

# Cargar .env y mostrar mensaje si se carga correctamente
env_loaded = load_dotenv()


app = FastAPI()

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

