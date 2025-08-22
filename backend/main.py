from fastapi import FastAPI
from auth.routes import router as auth_router
from drive.routes import router as drive_router
from certificados.routes import router as certificados_router
from routes.contacto import router as contacto_router
import os
from dotenv import load_dotenv


load_dotenv()

# Conexión a MongoDB Atlas
from pymongo import MongoClient
MONGODB_URI = os.getenv("MONGODB_URI")
mongo_client = None
if MONGODB_URI:
    mongo_client = MongoClient(MONGODB_URI)
    # Puedes acceder a la base con: db = mongo_client["nombre_db"]
else:
    print("MONGODB_URI no está configurada en las variables de entorno.")

app = FastAPI()

# Servir archivos estáticos del frontend en /static
from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="public", html=True), name="static")

app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router)
app.include_router(contacto_router, prefix="/api")

# Ruta para probar la conexión a MongoDB Atlas
@app.get("/db-status")
def db_status():
    if mongo_client:
        try:
            # El comando 'ping' verifica la conexión
            mongo_client.admin.command('ping')
            return {"status": "Conexión exitosa a MongoDB Atlas"}
        except Exception as e:
            return {"status": "Error de conexión", "detail": str(e)}
    else:
        return {"status": "No se encontró la variable MONGODB_URI"}

@app.get("/")
def root():
    return {"message": "API LACS funcionando"}
