from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
import os
import smtplib
import ssl
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

@router.post("/", status_code=status.HTTP_200_OK)
@router.post("", status_code=status.HTTP_200_OK)
async def enviar_contacto(data: ContactoRequest, request: Request):
    print("Recibida petición de contacto:", data)
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 465))  # Puerto 465 para SMTPS
    SMTP_USER = os.getenv("SMTP_USER", "usuario@example.com")
    SMTP_PASS = os.getenv("SMTP_PASS", "password")
    DEST_EMAIL = os.getenv("CONTACTO_DEST_EMAIL", SMTP_USER)
    
    print(f"🔍 DEBUG SMTP - HOST: {SMTP_HOST}, PORT: {SMTP_PORT}, USER: {SMTP_USER}")
    print(f"🔍 DEBUG DEST_EMAIL: {DEST_EMAIL}")


    msg = EmailMessage()
    msg["Subject"] = f"Nuevo mensaje de contacto: {data.asunto or 'Sin asunto'}"
    msg["From"] = SMTP_USER  # Usar el correo intermediario verificado
    msg["To"] = DEST_EMAIL
    msg["Reply-To"] = data.email  # Las respuestas van al usuario del formulario
    body = f"""
    Nombre: {data.nombre}
    Email (responder a): {data.email}
    Teléfono: {data.telefono}
    Empresa: {data.empresa}
    Asunto: {data.asunto}
    
    Mensaje:
    {data.mensaje}
    """
    msg.set_content(body)

    try:
        print(f"Intentando conectar a {SMTP_HOST}:{SMTP_PORT} con SSL...")
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as server:
            print("✅ Conexión SMTP_SSL establecida")
            server.login(SMTP_USER, SMTP_PASS)
            print("✅ Login exitoso")
            server.send_message(msg)
        print("✅ Correo enviado correctamente")
        return {"ok": True, "msg": "Correo enviado"}
    except smtplib.SMTPException as e:
        print(f"❌ Error SMTP: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"ok": False, "msg": f"Error SMTP: {str(e)}"})
    except OSError as e:
        print(f"❌ Error de red/conexión: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"ok": False, "msg": f"Error de conexión: {str(e)}"})
    except Exception as e:
        print(f"❌ Error general: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"ok": False, "msg": f"Error: {str(e)}"})
