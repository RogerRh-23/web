Write-Host "Construyendo imagen Docker..."
docker build -f backend/Dockerfile -t rogerrh/lacs-web:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la construcción de la imagen. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "Imagen construida correctamente. Subiendo a Docker Hub..."
docker push rogerrh/lacs-web:latest
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir la imagen a Docker Hub." -ForegroundColor Red
    exit 1
}
Write-Host "¡Proceso completado exitosamente!" -ForegroundColor Green
