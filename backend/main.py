from fastapi import FastAPI
from auth.routes import router as auth_router
from drive.routes import router as drive_router
from certificados.routes import router as certificados_router
from routes.contacto import router as contacto_router
from translate.routes import router as translate_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Servir archivos estáticos del frontend
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="public", html=True), name="static")

app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router)
app.include_router(contacto_router, prefix="/api")
app.include_router(translate_router, prefix="/translate")

@app.get("/")
def root():
    return {"message": "API LACS funcionando"}
