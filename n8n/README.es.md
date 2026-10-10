# Workflow LeadFlow: formulario a Slack

La configuración de Docker Compose de la raíz del repositorio incluye un servicio de una sola ejecución, `n8n-init`, que corre automáticamente antes del servicio principal de n8n. Con un volumen nuevo crea la cuenta local de propietario configurada, importa el workflow y lo publica. El servicio principal de n8n arranca solo después de que la inicialización termine con éxito. En arranques posteriores, el servicio de inicialización detecta el workflow existente y lo deja, junto con sus credenciales y configuración, sin tocar.

Para una demo local nueva, la cuenta de propietario es por defecto `leadflow@example.com` / `LeadFlow2026!`; sobrescribe `N8N_OWNER_EMAIL` y `N8N_OWNER_PASSWORD` en el `.env` de la raíz si lo necesitas. Estos valores son solo para desarrollo en localhost, no para despliegues públicos.

Para cambiar un workflow ya importado, edítalo en la interfaz de n8n. Así se evita reemplazar la credencial de Slack seleccionada cuando n8n se reinicia.

## Configuración

Define estas variables de entorno en el proceso/contenedor de n8n:

```env
LEADFLOW_API_URL=http://host.docker.internal:3000/api/leads
LEADFLOW_SLACK_CHANNEL_ID=REPLACE_WITH_SLACK_CHANNEL_ID
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

`LEADFLOW_API_URL` es el endpoint existente del backend, incluyendo `/api/leads`. Si n8n y el backend corren en la misma red de Docker, usa el nombre del servicio del backend (por ejemplo, `http://backend:3000/api/leads`). `host.docker.internal` sirve para alcanzar desde Docker Desktop un backend que corre en el host; ajústalo en otros despliegues.

`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` es necesario para que las expresiones del workflow lean los dos valores de configuración no secretos. Esto también permite que las expresiones y los nodos Code lean el entorno del proceso de n8n, así que úsalo solo cuando los editores del workflow sean de confianza. No pongas credenciales ni tokens en estas variables; guarda las credenciales de Slack en el gestor de credenciales de n8n. Tras importar, abre **Send lead notification to Slack** y selecciona la credencial configurada en el campo de credencial del nodo. Reemplaza el ID de canal de ejemplo por el ID del canal de Slack.

Al ejecutar con Docker Compose desde la raíz, `docker-compose.yml` aporta estos valores; la URL de la API es `http://backend:3000/api/leads` en la red interna de Compose. El frontend se publica en `http://localhost:5173` y llama al webhook en `http://localhost:5678/webhook/leadflow-form`. El nodo Webhook exportado permite `http://localhost:5173`; si el frontend se aloja en otro origen, actualiza la opción **Allowed Origins (CORS)** del nodo con ese origen exacto.

Reinicia n8n tras cambiar su entorno. Luego activa el workflow y usa la URL del webhook de producción que muestra **Receive lead form**. Envía un `POST` JSON cuyo cuerpo use los campos existentes del backend:

```json
{
  "companyName": "Acme Inc.",
  "contactName": "Alex Example",
  "email": "alex@example.com",
  "serviceRequested": "Automatización",
  "details": "Detalles opcionales"
}
```

El workflow pasa el cuerpo del webhook sin cambios a `POST /api/leads`; la validación y la asignación del asesor siguen en el backend. La API responde con `{ "data": { ...campos del lead... } }`. Cuando el lead está asignado, `data.assignedAdvisor` contiene `id`, `name` y `email` del asesor, y Slack muestra el nombre del asesor (con el ID como respaldo si faltara).

## Resultados y errores

- `201` y `notification.status: "sent"`: la API devolvió el lead creado y el nodo de Slack de n8n confirmó el envío.
- `201` y `notification.status: "skipped"`: la API creó el lead pero no devolvió asesor asignado, por lo que el workflow no envió mensaje a Slack.
- `502` con `slack_delivery_unconfirmed`: la API creó el lead, pero el nodo de Slack no confirmó la entrega. Inspecciona el nodo fallido y la ejecución de n8n antes de reintentar; este workflow no reintenta Slack automáticamente.
- `502` con `leadflow_api_request_unconfirmed`: la llamada a la API falló o expiró. El resultado puede ser desconocido si la conexión falló después de que el backend confirmara el lead. Inspecciona la ejecución y verifica si el lead existe antes de reenviar, para no crear un duplicado.

El workflow exportado no incluye credenciales. Los fallos de Slack y de la llamada al backend se enrutan a respuestas explícitas del webhook; nunca se representan como finalización exitosa.
