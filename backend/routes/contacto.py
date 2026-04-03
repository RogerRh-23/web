from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
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
    
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "noreply@lacs.org.mx")  # Debe ser verificado en SendGrid
    TO_EMAIL = os.getenv("CONTACTO_DEST_EMAIL", "contacto@lacs.org.mx")
    
    print(f"🔍 DEBUG SendGrid - API_KEY presente: {'Sí' if SENDGRID_API_KEY else 'No'}")
    print(f"🔍 DEBUG - FROM: {FROM_EMAIL}, TO: {TO_EMAIL}")
    
    if not SENDGRID_API_KEY:
        return JSONResponse(
            status_code=500, 
            content={"ok": False, "msg": "SendGrid API key no configurada"}
        )
    
    body_content = f"""
    <h2>Nuevo mensaje de contacto</h2>
    <p><strong>Nombre:</strong> {data.nombre}</p>
    <p><strong>Email:</strong> {data.email}</p>
    <p><strong>Teléfono:</strong> {data.telefono}</p>
    <p><strong>Empresa:</strong> {data.empresa}</p>
    <p><strong>Asunto:</strong> {data.asunto}</p>
    <p><strong>Mensaje:</strong></p>
    <p>{data.mensaje}</p>
    <hr>
    <p><em>Para responder, escribir a: {data.email}</em></p>
    """
    
    try:
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=TO_EMAIL,
            subject=f"Nuevo mensaje de contacto: {data.asunto or 'Sin asunto'}",
            html_content=body_content,
            reply_to=data.email  # Las respuestas van al usuario del formulario
        )
        
        print(f"Enviando correo con SendGrid...")
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        print(f"✅ Correo enviado - Status: {response.status_code}")
        return {"ok": True, "msg": "Correo enviado exitosamente"}
        
    except Exception as e:
        print(f"❌ Error enviando correo: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500, 
            content={"ok": False, "msg": f"Error enviando correo: {str(e)}"}
        )
