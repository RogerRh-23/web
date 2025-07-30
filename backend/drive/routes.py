from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

router = APIRouter()

SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), '..', 'service-account.json')
SCOPES = ['https://www.googleapis.com/auth/drive.file']

class FileResponse(BaseModel):
    file_id: str

@router.post("/upload", response_model=FileResponse)
def upload_file(file: UploadFile = File(...)):
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    drive_service = build('drive', 'v3', credentials=credentials)
    file_metadata = {'name': file.filename}
    media = file.file
    try:
        res = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        return {"file_id": res.get('id')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
