FROM python:3.11-slim

# ============================================================
# FORCE FULL REBUILD - Railway caché invalidation
# ============================================================
# Changed strategy completely to avoid Railway caching issues
# Timestamp: 2026-04-01T03:55:00Z

RUN apt-get update && apt-get install -y build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies FIRST (separate layer)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip --no-cache-dir && pip install --no-cache-dir -r /tmp/requirements.txt

# Copy application code
COPY backend/ /app/
COPY public/ /public/

# Create entrypoint script that CANNOT be overridden
RUN mkdir -p /usr/local/bin && cat > /usr/local/bin/start-app << 'EOF'
#!/bin/sh
set -e
cd /app
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
EOF
RUN chmod +x /usr/local/bin/start-app

# CRITICAL: Override npm completely so Railway cannot use it
RUN rm -f /usr/bin/npm /usr/local/bin/npm 2>/dev/null || true
RUN cat > /usr/local/bin/npm << 'EOF'
#!/bin/sh
echo "npm is not available - starting application with uvicorn"
exec /usr/local/bin/start-app "$@"
EOF
RUN chmod +x /usr/local/bin/npm

# Make sure bash also cannot find npm
RUN echo 'alias npm=/usr/local/bin/npm' >> /etc/profile

EXPOSE 8000
ENV PORT=8000

# Use shell form to ensure env var expansion
CMD ["/bin/sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
