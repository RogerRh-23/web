from fastapi import APIRouter, Body
import requests
import os

router = APIRouter()
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "")
DEEPL_URL = "https://api-free.deepl.com/v2/translate"

@router.post("/translate")
def translate(text: str = Body(...), target_lang: str = Body(...)):
    if not DEEPL_API_KEY:
        return {"error": "DEEPL_API_KEY no configurada"}
    data = {
        "auth_key": DEEPL_API_KEY,
        "text": text,
        "target_lang": target_lang.upper()
    }
    response = requests.post(DEEPL_URL, data=data)
    if response.status_code == 200:
        result = response.json()
        return {"translated": result["translations"][0]["text"]}
    else:
        return {"error": response.text}
