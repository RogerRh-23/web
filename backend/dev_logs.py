import time
from typing import List, Dict

# Simple log en memoria (reemplazar por persistente en producción)
logs: List[Dict] = []

def add_log(action: str, user: str = None, detail: str = None):
    logs.append({
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
        "action": action,
        "user": user,
        "detail": detail
    })
    # Mantener solo los últimos 100 logs
    if len(logs) > 100:
        logs.pop(0)

def get_logs():
    return list(reversed(logs))  # Más recientes primero
