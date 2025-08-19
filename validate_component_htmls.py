# Script para validar archivos HTML de componentes
# Ejecuta este script en la raíz de tu proyecto (donde está la carpeta public)

import os

base_dir = os.path.join(os.getcwd(), 'public', 'components', 'Procesos')

if not os.path.exists(base_dir):
    print(f'No existe la carpeta: {base_dir}')
    exit(1)

print('Archivos HTML encontrados en /public/components/Procesos/:')
for file in os.listdir(base_dir):
    if file.endswith('.html'):
        print(' -', file)

# Validación específica
required_files = [
    'Proceso de Certificación.html',
    'Vigencia de la Certificación.html',
    'Procedimiento de atención de quejas.html'
]

missing = []
for req in required_files:
    if not os.path.exists(os.path.join(base_dir, req)):
        missing.append(req)

if missing:
    print('\nFaltan los siguientes archivos:')
    for m in missing:
        print(' -', m)
else:
    print('\nTodos los archivos requeridos están presentes.')
