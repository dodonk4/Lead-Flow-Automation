# n8n en LeadFlow v2

El Compose de la rama `feat/zoho-crm` ejecuta n8n `2.5.0` en `http://localhost:5678`, enlazado solo a `127.0.0.1`. No hay un servicio `n8n-init`: al primer acceso, crea manualmente el usuario owner en el asistente de n8n y elige una contraseña propia.

El arranque no importa ni publica workflows. `lead-intake-to-slack.workflow.json` pertenece a v1 y depende del backend; no lo actives como flujo v2.

`leadflow-zoho-assignment.workflow.json` es el artefacto inactivo de TICKET-004. Recibe un servicio normalizado en `leadflow-assignment-check`, aplica el mapping RRHH/Legal/Automatización en n8n y consulta `users?type=ActiveUsers` antes de devolver el Owner ID. Servicio sin regla responde 422; error de consulta o propietario no listado devuelve error explícito. No guarda leads ni envía Slack. No lo conectes al frontend ni lo expongas públicamente.

Para probarlo, importa el export sin activarlo y selecciona la credencial OAuth Zoho en `Verify owner in active Zoho users`. El API base versionado es `https://www.zohoapis.com/crm/v8`, proporcionado por el propietario de la cuenta. Los IDs fueron proporcionados y el usuario confirmó que son activos/asignables; las tres asignaciones ya se comprobaron con una consulta OAuth real. No compartas el listado completo de usuarios, tokens ni la salida sensible de la ejecución.

`leadflow-zoho-upsert.workflow.json` es el candidato inactivo de TICKET-005. Reutiliza la validación del formulario, verifica el Owner mapeado contra los usuarios activos de Zoho y envía un registro a `/Leads/upsert` con `duplicate_check_fields: ["Email"]`. Tras importarlo manualmente, selecciona la credencial OAuth Zoho guardada en ambos nodos HTTP. Comprueba `code`, `status`, `action` e `id` string por registro; un error individual no es éxito, los duplicados ambiguos se escalan y un timeout/resultado incierto no dispara otro Create. Se omite `Description` si `details` falta o está vacío para conservar el valor existente. El usuario confirmó que el tenant es de prueba aislado y autorizó usar `Rating` como picklist de servicio con `RRHH`, `Legal` y `Automatización`; el candidato mapea ahí `serviceRequested`. No se usa `Lead_Source`. Create, update/reasignación secuencial, email en mayúsculas y preservación de Description se verificaron contra Zoho. Dos solicitudes simultáneas sobre el Lead sintético existente devolvieron el mismo ID y se confirmó un único registro; esto no promete exactly-once. Una copia temporal sin credenciales comprobó ramas de Owner, error 2xx por registro, duplicado ambiguo y timeout contra una API mock local; esto no prueba el comportamiento real de Zoho. Mantén el candidato inactivo; no integra Slack y los escenarios de error reales siguen pendientes.

`leadflow-zoho-slack.workflow.json` es el candidato separado e inactivo de TICKET-006, con webhook propio `leadflow-zoho-slack`. Repite el upsert Zoho y solo después de confirmar por registro la acción y el ID invoca el nodo nativo Slack. Tras importarlo, selecciona la credencial OAuth Zoho en los dos nodos HTTP, configura una credencial OAuth Slack y elige un canal de prueba verificado en `Send notification to Slack`; conserva el workflow inactivo hasta decidir su publicación como flujo final en el ticket correspondiente. El export no contiene credenciales ni ID de canal. El mensaje incluye empresa, contacto, servicio, detalles, `full_name` del Owner real de Zoho y la operación created/updated. Markdown y vinculación de nombres están desactivados; se neutralizan las menciones `@...` y `<!channel>`/`<!here>`/`<!everyone>` del contenido controlado por usuario. Un rechazo explícito de Slack responde `notification.status=failed`; timeout/transporte incierto responde `unconfirmed`. Ambos conservan el Lead guardado y HTTP 201/200. La instancia de prueba confirmó alta, actualización, rechazo de canal, respuesta `unconfirmed` mediante un endpoint local demorado y rechazo HTTP 404 Zoho sin Slack. El timeout real del servicio Slack no se probó. La credencial y el canal de la instancia local no se versionan. Para reparar el aviso, verifica el Lead guardado, busca primero en el canal si la entrega es incierta y publica solo el mensaje faltante; no reenvíes el formulario ni repitas el upsert.

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
