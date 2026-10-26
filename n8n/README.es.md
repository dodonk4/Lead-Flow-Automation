# n8n en LeadFlow v2

El Compose v2 ejecuta n8n en local, en <http://localhost:5678>. Crea manualmente el usuario owner en el primer acceso. Compose no importa ni activa workflows: inspecciona, configura, prueba y habilita deliberadamente cada flujo.

## Workflows versionados

- `leadflow-form-validation.workflow.json`: artefacto aislado para probar el contrato; no escribe en Zoho ni Slack.
- `leadflow-zoho-assignment.workflow.json`: prueba inactiva de consulta del Owner.
- `leadflow-zoho-upsert.workflow.json`: candidato inactivo para upsert de Leads en Zoho.
- `leadflow-zoho-slack.workflow.json`: candidato inactivo que notifica solo después de confirmar la persistencia en Zoho.
- `leadflow-zoho-qualification.workflow.json`: pruebas manuales de calificación de cuenta; el caso predeterminado solo lee metadata de campos.

Estos artefactos no se importan ni publican automáticamente. El alcance, resultados observados y límites pendientes están en los [resultados de pruebas](../docs/testing/test-results.md). La rama `main` conserva v1; esta rama contiene el conjunto de workflows v2.

## Credenciales y seguridad

Guarda credenciales Zoho y Slack únicamente en el gestor de credenciales de n8n. Después de importar manualmente, selecciona las credenciales correctas y un canal de prueba verificado. Nunca añadas credenciales, IDs de canal, listados de usuarios reales ni datos sensibles de ejecuciones a exports o configuración del frontend.

El webhook del frontend se configura al compilar con `VITE_N8N_WEBHOOK_URL`; no debe contener secretos. Compose enlaza los servicios a loopback y conserva los datos de n8n en un volumen v2 separado. No expongas el editor ni el webhook: CORS no autentica a clientes directos y no se verificó un rate limit efectivo. No uses `docker compose down -v` para detener la demo.

El formulario envía JSON como `text/plain` para gestionar de forma controlada el JSON malformado. Un timeout o error de transporte no confirma si Zoho guardó el registro: reconcilia antes de reenviar. Si Slack falla después del guardado confirmado, repara solo la notificación faltante; no repitas el upsert completo.

Consulta [configuración](../docs/setup.md), [arquitectura](../docs/architecture.md), [plan de pruebas](../docs/testing/test-plan.md), [resultados](../docs/testing/test-results.md) e [índice de tickets](../docs/tickets/README.md).
