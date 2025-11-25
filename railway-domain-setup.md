# Railway Domain Configuration
# Para configurar redirección de www en Railway:

# 1. Ve a tu proyecto en Railway Dashboard
# 2. Settings → Domains
# 3. Agrega tanto el dominio con www como sin www:
#    - tudominio.com (principal)
#    - www.tudominio.com (redirect)

# 4. Railway automáticamente manejará la redirección
# O puedes usar el middleware de FastAPI que ya agregamos

# Variables de entorno para Railway:
RAILWAY_STATIC_URL=https://lacs.org.mx
CANONICAL_DOMAIN=lacs.org.mx