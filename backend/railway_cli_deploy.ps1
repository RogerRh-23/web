# Script PowerShell para redeploy automático usando Railway CLI (nueva versión)
# Requiere: npm install -g @railway/cli

# Autenticación (solo la primera vez, luego guarda sesión)
# railway login

# Cambia al directorio del proyecto
cd "C:\Users\Roberto\Desktop\lacs"

# Ejecuta el deploy
railway up

# Mensaje de éxito
Write-Host "Deploy realizado con Railway CLI (@railway/cli)."
