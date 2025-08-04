from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
import os
import smtplib
from email.message import EmailMessage
import traceback

router = APIRouter()

class ContactoRequest(BaseModel):
    nombre: str = Field(...)
    email: EmailStr = Field(...)
    telefono: str = Field(...)
    asunto: str = ""
    empresa: str = ""
    mensaje: str = ""

@router.post("/contacto", status_code=status.HTTP_200_OK)
async def enviar_contacto(data: ContactoRequest, request: Request):
    print("Recibida petición de contacto:", data)
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "usuario@example.com")
    SMTP_PASS = os.getenv("SMTP_PASS", "password")
    DEST_EMAIL = os.getenv("CONTACTO_DEST_EMAIL", SMTP_USER)

    msg = EmailMessage()
    msg["Subject"] = f"Nuevo mensaje de contacto: {data.asunto or 'Sin asunto'}"
    msg["From"] = data.email
    msg["To"] = DEST_EMAIL
    body = f"""
    Nombre: {data.nombre}
    Email: {data.email}
    Teléfono: {data.telefono}
    Empresa: {data.empresa}
    Asunto: {data.asunto}
    Mensaje:\n{data.mensaje}
    """
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print("Correo enviado correctamente")
        return {"ok": True, "msg": "Correo enviado"}
    except Exception as e:
        print("Error enviando correo:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"ok": False, "msg": f"Error enviando correo: {str(e)}"})
