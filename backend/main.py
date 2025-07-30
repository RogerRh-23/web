
from fastapi import FastAPI
from auth.routes import router as auth_router
from drive.routes import router as drive_router
from certificados.routes import router as certificados_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.include_router(auth_router, prefix="/auth")
app.include_router(drive_router, prefix="/drive")
app.include_router(certificados_router)

@app.get("/")
def root():
    return {"message": "API LACS funcionando"}
