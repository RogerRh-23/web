import requests
import os

from dotenv import load_dotenv
load_dotenv()


RAILWAY_TOKEN = os.getenv("RAILWAY_TOKEN", "TU_TOKEN_DE_RAILWAY")
PROJECT_ID = os.getenv("PROJECT_ID", "TU_ID_DE_PROYECTO")
SERVICE_ID = os.getenv("SERVICE_ID", "TU_ID_DE_SERVICIO")

def trigger_railway_deploy():
    url = f"https://backboard.railway.app/project/{PROJECT_ID}/service/{SERVICE_ID}/deploy"
    headers = {
        "Authorization": f"Bearer {RAILWAY_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers)
    if response.status_code == 200:
        print("Redeploy iniciado correctamente en Railway.")
    else:
        print(f"Error al iniciar redeploy: {response.status_code} - {response.text}")

if __name__ == "__main__":
    trigger_railway_deploy()
