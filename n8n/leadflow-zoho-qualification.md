# Workflow de calificación de Zoho

Archivo importable: [`leadflow-zoho-qualification.workflow.json`](./leadflow-zoho-qualification.workflow.json).

Es una herramienta temporal de pruebas manuales para TICKET-001, **no** el workflow de producción. No contiene credenciales, IDs reales, webhooks ni Slack. Por defecto solo consulta los campos de Leads; las ramas de escritura requieren cambiar explícitamente el caso y configurar valores sintéticos.

## Importar y vincular credenciales

1. Abre `http://localhost:5678` e inicia sesión.
2. Importa el JSON desde archivo. Déjalo inactivo; utiliza el botón **Execute Workflow** en el editor.
3. En cada nodo Zoho/HTTP Request selecciona la credencial OAuth2 de Zoho ya configurada en esta instancia. La exportación no incluye vínculos ni secretos.
4. En **Test parameters (edit before write tests)**, `testCase` inicialmente es `fields`, una lectura de metadata. Comprueba primero que termina correctamente.
5. Para las llamadas HTTP sustituye `apiBaseUrl` por el dominio API de tu centro de datos Zoho, con sufijo `/crm/v8` (por ejemplo, la forma `https://<dominio-api-de-tu-cuenta>/crm/v8`). No copies un dominio de ejemplo sin verificar tu cuenta.

## Casos manuales

Ejecuta un caso a la vez editando `testCase`:

| Valor | Acción | Qué comprobar |
|---|---|---|
| `fields` | Nodo Zoho CRM nativo: Leads → Get Fields | Resultado OAuth; API names, tipos, obligatorios y límites de campos. |
| `users` | GET `/users?type=ActiveUsers` con credencial OAuth | Usuarios activos y sus IDs. Trata el resultado como información sensible y no compartas el listado completo. |
| `upsert` | POST `/Leads/upsert` con email único y Owner configurado; luego lectura del registro por el ID devuelto | Primera ejecución `action=insert`; Owner leído coincide con el ID activo. Repite con el mismo email: debe conservar ID y reportar actualización. |
| `invalid-owner` | Upsert con email de prueba distinto y un ID de usuario sintácticamente válido pero inexistente | Zoho debe devolver error por registro; no interpretar 2xx HTTP como éxito sin revisar `data`. Si se crea inesperadamente, inspecciona Zoho y elimina únicamente ese registro de prueba si tienes autorización. |

Antes de ejecutar las ramas de escritura, reemplaza ambos emails de ejemplo con direcciones sintéticas únicas aceptadas por tu organización, el nombre de empresa de prueba, el ID real de un usuario activo y el ID inexistente solo para la prueba negativa. Completa el campo `apiBaseUrl`. Si la metadata revela otros campos obligatorios del layout, añádelos manualmente al JSON body de los nodos de upsert. No uses datos de clientes ni una dirección real de una persona.

Las expresiones de escritura envían `duplicate_check_fields: ["Email"]` y `Owner: {"id":"..."}`. Comprueba la respuesta por registro (`code`, `status`, `action`, `details.id`) y después lee el lead. El caso `upsert` actualiza datos de prueba; no hay nodo de borrado automático.

## Qué demuestra el nodo Zoho nativo en n8n 2.5.0

La inspección local del paquete instalado confirma que el nodo nativo ofrece `Get Fields` y `Create or Update` para Leads, con Email como campo adicional para upsert. Su descripción de propiedades de Lead no expone Owner ni `duplicate_check_fields`; el ejecutor reduce la respuesta a `data[0].details`, perdiendo `action`. Por tanto, el candidato simple para producción es usar el nodo nativo para metadata si conviene y HTTP Request autenticado con la credencial Zoho para upsert/Owner/resultado completo, sujeto a confirmar estos casos en la cuenta real.

La definición de credencial Zoho OAuth2 incluida en esta imagen declara valores de scope por defecto amplios (`ZohoCRM.modules.ALL`, `ZohoCRM.settings.all`, `ZohoCRM.users.all`). Esto no demuestra qué scopes consintió la cuenta del usuario. Revisa los scopes efectivos en OAuth/Zoho y usa permisos mínimos compatibles; no pegues tokens ni client secrets en evidencias.

## Seguridad y registro de evidencia

- No actives el workflow ni lo conectes al formulario. Solo se ejecuta manualmente.
- Mantén credenciales en n8n y nunca las exportes. No guardes resultados de usuarios en Git ni compartas directorios/IDs completos si no son necesarios.
- Se recomienda una organización de prueba. La prueba negativa puede crear un registro si la cuenta acepta el Owner; por eso utiliza email único y revisa Zoho después.
- Añade a `docs/testing/test-results.md` solo resultados observados. Anota si un caso no se pudo ejecutar y no marques TICKET-001 DONE hasta verificar sus criterios.
