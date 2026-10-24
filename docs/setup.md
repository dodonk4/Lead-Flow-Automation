# Configuración de LeadFlow v2

## Estado

El Compose de `feat/zoho-crm` levanta únicamente frontend y n8n 2.5.0. La imagen/versión de n8n se verificó en TICKET-001. En TICKET-002 se validaron la configuración, el build, el arranque saludable, la accesibilidad local y la persistencia tras detener e iniciar Compose. Los workflows versionados no se importan ni se publican automáticamente.

## Requisitos

- Docker Desktop con Docker Compose.
- Cuenta Zoho CRM y workspace Slack de prueba para los tickets de integración posteriores; no se necesitan para iniciar los dos servicios.

## Inicio local

1. Comprueba que la rama sea `feat/zoho-crm` y conserva cualquier `.env` local existente.
2. Si necesitas cambiar la URL que compila Vite, configura `VITE_N8N_WEBHOOK_URL` en `.env`. El valor de ejemplo es `http://localhost:5678/webhook/leadflow-form`; la URL del webhook no contiene secretos. Sin `.env`, Compose usa ese mismo valor predeterminado.
3. Desde la raíz, ejecuta:

   ```powershell
   docker compose config
   docker compose up --build --detach
   docker compose ps
   ```

4. Abre el formulario en `http://localhost:5173` y n8n en `http://localhost:5678`. En el primer acceso, completa manualmente el asistente de creación del usuario owner de n8n con una contraseña elegida por ti. No hay credenciales predeterminadas ni se crea un workflow durante el arranque.
5. Para detener los servicios conservando la configuración:

   ```powershell
   docker compose down
   ```

   No uses `docker compose down -v`: borraría el volumen de datos de n8n.

## Servicios y configuración

| Servicio | Imagen/origen | Acceso local |
|---|---|---|
| `frontend` | Build desde `frontend/Dockerfile` | `http://localhost:5173` |
| `n8n` | `n8nio/n8n:2.5.0` | `http://localhost:5678` |

Ambos puertos están enlazados a `127.0.0.1`. El volumen `leadflow-v2-compose-n8n-data` es nuevo y separado del volumen Compose v1 `n8n_data`; almacena la configuración, credenciales y workflows de n8n, no leads. No se borra ni se reutiliza ningún volumen existente. La clave de cifrado generada por n8n y la base interna se conservan dentro de este volumen; respáldalo y restáuralo como una unidad.

La única variable de Compose configurable por el usuario es `VITE_N8N_WEBHOOK_URL`, disponible en `.env.example`. No contiene tokens. La configuración fija de n8n mantiene el editor y los webhooks en localhost, deshabilita las cookies `Secure` únicamente para HTTP local, bloquea el acceso de nodos a variables de entorno y fija la zona horaria `America/Argentina/Buenos_Aires`. No cambies el bind a una interfaz pública ni expongas el editor. CORS no autentica clientes ni limita solicitudes.

Las credenciales de Zoho y Slack se crearán manualmente en el gestor de credenciales de n8n cuando los workflows correspondientes estén listos. Importar, configurar, probar y activar el workflow de integración queda para tickets posteriores; no uses el workflow v1 que llama al backend retirado del Compose.

`n8n/leadflow-form-validation.workflow.json` es un export temporal e inactivo de TICKET-003 para verificar el contrato del webhook. No lo actives ni lo presentes como flujo final; no guarda leads ni incluye Zoho/Slack. Compose tampoco lo importa automáticamente. El formulario envía el texto JSON con `Content-Type: text/plain` para que n8n pueda devolver un 400 controlado incluso si el JSON está malformado; un cliente directo que use `application/json` recibirá el 422 del parser de n8n ante sintaxis malformada. CORS no autentica ni limita estas solicitudes.

`n8n/leadflow-zoho-assignment.workflow.json` es un export inactivo de TICKET-004 para comprobar la asignación antes del guardado. Su API base `https://www.zohoapis.com/crm/v8` fue proporcionada por el usuario. Selecciona la credencial OAuth Zoho guardada en `Verify owner in active Zoho users`; no basta con que la credencial exista, hay que enlazarla al nodo. El usuario confirmó que los IDs del mapping son activos/asignables; la consulta real con OAuth está registrada en los resultados de pruebas. Un servicio sin regla responde 422; un Owner no encontrado o un error de consulta responde con error y no pasa a guardar ni notificar. Este webhook de comprobación no debe configurarse en el frontend ni exponerse públicamente; no guarda leads y no envía Slack. El export permanece inactivo.

## Volúmenes y recuperación

- Usa `docker compose down` para detener la demo; conserva el volumen.
- No ejecutes `docker compose down -v` ni borres volúmenes manualmente.
- El volumen v1 no forma parte de este Compose. No se elimina ni se toca.
- La recuperación requiere un backup consistente del volumen n8n y mantenerlo junto a la contraseña del owner y las credenciales requeridas, gestionadas fuera del repositorio.
