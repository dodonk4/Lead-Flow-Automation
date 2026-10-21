# n8n en LeadFlow v2

El Compose de la rama `feat/zoho-crm` ejecuta n8n `2.5.0` en `http://localhost:5678`, enlazado solo a `127.0.0.1`. No hay un servicio `n8n-init`: al primer acceso, crea manualmente el usuario owner en el asistente de n8n y elige una contraseña propia.

El arranque no importa ni publica workflows. `lead-intake-to-slack.workflow.json` pertenece a v1 y depende del backend; no lo actives como flujo v2. La configuración Zoho/Slack y el workflow funcional se completarán en tickets posteriores.

## Configuración

La URL configurable del webhook que compila Vite es `VITE_N8N_WEBHOOK_URL`. Su ejemplo local es `http://localhost:5678/webhook/leadflow-form`, sin credenciales ni tokens. Se configura opcionalmente en el `.env` de la raíz; para aplicar cambios a Vite hay que reconstruir el frontend:

```powershell
docker compose up --build --detach
```

No se necesitan variables de entorno para contraseñas, Owner de Zoho ni credenciales de Slack. Añade esas credenciales al gestor de n8n solo cuando el workflow correspondiente esté listo; nunca las pongas en el frontend, `.env.example` o exports de workflows.

Compose mantiene acceso local, HTTP para desarrollo y `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`. `N8N_SECURE_COOKIE=false` es necesario únicamente para la interfaz local por HTTP. No cambies los puertos a una interfaz pública ni expongas el editor. CORS no autentica solicitudes ni es un límite de uso.

## Persistencia

El volumen `leadflow-v2-compose-n8n-data` almacena la configuración de n8n, credenciales, workflows y su base interna; no es almacenamiento de leads. Los datos sobreviven reinicios y se separan del volumen v1 `n8n_data`. `docker compose down` conserva la configuración; no uses `docker compose down -v` ni elimines volúmenes para limpiar.

Consulta [la guía de configuración](../docs/setup.md) para iniciar el stack y respaldar sus datos.
