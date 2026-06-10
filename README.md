# AuraDoc

Este es el frontend principal de la aplicación, construido con React y Vite.

## Instalación y Configuración

El proyecto utiliza Docker para facilitar el despliegue del entorno de desarrollo y la conexión transparente con el resto de los microservicios.

### Prerrequisitos
*   **Docker** y **Docker Compose** instalados.
*   **Git** para clonar el repositorio.

### Pasos Rápidos

#### En Windows (PowerShell):
1.  Abre una terminal en la raíz de este proyecto.
2.  Ejecuta el script de configuración:
    ```powershell
    .\setup.ps1
    ```

#### En Linux (Bash):
1.  Abre una terminal en la raíz de este proyecto.
2.  Dale permisos y ejecuta el script:
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

### ¿Qué hace el script?
1.  Crea un archivo `.env` configurando las URLs de las APIs (.NET en el puerto 5000 y Node.js en el 3000).
2.  Levanta un contenedor de **Node.js** con `pnpm` instalado.
3.  Utiliza `network_mode: host` para que la aplicación frontend en Vite pueda conectarse directamente a `localhost` y comunicarse con las APIs sin problemas de enrutamiento de red.
4.  Instala las dependencias de Node.js e inicia el servidor de Vite exponiendo el puerto al host.

### Uso Diario

Una vez que hayas ejecutado el script de instalación (`setup`) por primera vez, **no necesitas volver a ejecutarlo**.

Para tu trabajo del día a día, utiliza los comandos estándar de Docker:

*   **Para Encender la App:**
    ```bash
    docker compose up -d
    ```
*   **Para Apagar la App:**
    ```bash
    docker compose down
    ```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).
