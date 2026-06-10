#!/bin/bash

# =================================================================
# Script de Configuracion Inicial - AuraDoc (Linux)
# =================================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Configuracion de AuraDoc (Frontend Vite) ${NC}"
echo -e "${CYAN}========================================${NC}"

# 1. Verificar Docker
DOCKER_CMD="docker"
if ! docker info > /dev/null 2>&1; then
    if sudo docker info > /dev/null 2>&1; then
        DOCKER_CMD="sudo docker"
    else
        echo -e "${RED}ERROR: Docker no esta ejecutandose.${NC}"
        exit 1
    fi
fi

if $DOCKER_CMD compose version > /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="$DOCKER_CMD compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# 2. Pedir URLs de las APIs
echo -e "\n${GREEN}Configuracion de APIs:${NC}"

read -p "Ingresa la URL de la API .NET (Enter para 'http://localhost:5000'): " apiDotnetUrl
if [ -z "$apiDotnetUrl" ]; then apiDotnetUrl="http://localhost:5000"; fi

read -p "Ingresa la URL de la API Node.js (Enter para 'http://localhost:3000'): " apiBackendUrl
if [ -z "$apiBackendUrl" ]; then apiBackendUrl="http://localhost:3000"; fi

# 3. Guardar en .env
echo -e "\nGenerando archivo .env..."
cat <<EOF > .env
API_DOTNET_URL=$apiDotnetUrl
API_BACKEND_URL=$apiBackendUrl
EOF

# 4. Limpiar e Iniciar Docker
echo -e "\n${CYAN}Limpiando y levantando contenedores...${NC}"
$DOCKER_COMPOSE_CMD down -v
$DOCKER_COMPOSE_CMD up -d --build

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ¡Entorno configurado con exito!       ${NC}"
echo -e "${CYAN}  AuraDoc disponible en: http://localhost:5173 ${NC}"
echo -e "${GREEN}========================================${NC}"
