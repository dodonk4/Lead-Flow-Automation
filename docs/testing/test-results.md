# Resultados de pruebas

**Estado: PENDIENTE para las pruebas funcionales de integración de LeadFlow v2.** Las comprobaciones de despliegue por ticket sí se registran abajo.

La inspección estática del repositorio y la consulta de documentación pública no son pruebas de integración ni de aceptación. No registrar ningún caso como PASS hasta ejecutarlo.

Plantilla por ejecución:

| Fecha | Ticket/caso | Entorno y versiones | Entrada/precondición y pasos | Esperado | Observado | Estado | Evidencia anonimizada y límites |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | NOT_RUN | Aún no ejecutado |

## TICKET-001 — comprobaciones realizadas (2026-10-20)

| Comprobación | Resultado observado | Estado / límite |
|---|---|---|
| Rama activa y dependencias | `feat/zoho-crm`; TICKET-001 no tiene dependencias | Verificado localmente |
| Docker/n8n | Docker Desktop responde (ServerVersion `29.8.2`). Se inició `leadflow-v2-n8n` desde `n8nio/n8n:2.5.0`, enlazado a `127.0.0.1:5678`, con volumen `leadflow-v2-n8n-data` | `GET http://localhost:5678/healthz` respondió HTTP 200. Instancia aislada y saludable |
| n8n Compose del proyecto | `docker compose ps --all --format json` no mostró contenedores Compose del proyecto | No se levantó ni modificó el stack Compose v1 |
| OAuth, centro de datos, edición y permisos Zoho | El usuario informa que los nodos `fields` y `users` ejecutaron correctamente con su credencial | Evidencia reportada por usuario; no inspeccionada desde esta sesión. Alcance de permisos/DC no confirmado |
| Metadata, layout, campos obligatorios, API names y límites | Usuario reporta que `fields` terminó correctamente; el contenido no se compartió | PASS reportado; requisitos concretos aún no documentados |
| Usuarios activos/asignables y mapping de asesores | Usuario reporta que `users` terminó correctamente; listado/IDs no compartidos | PASS reportado para consulta; mapping por servicio aún no documentado |
| Upsert, duplicate check por Email y operación create/update | Primer intento devolvió HTTP 400 por placeholder no numérico en Owner.id; posteriormente el usuario informa que todos los tests pasaron | PASS reportado para casos del workflow; no se compartieron acción/IDs por ejecución |
| Owner real y lectura posterior | Usuario informa que todos los tests pasaron de forma esperada | PASS reportado; ID real no se guarda aquí; falta resumir asesor por servicio |
| Owner inválido | Usuario informa que todos los tests pasaron de forma esperada | PASS reportado; no se compartió payload ni respuesta por registro |
| Inspección local de capacidades n8n 2.5.0 | Código instalado confirma operación `Get Fields`, `Create or Update` para Lead y Email adicional; descripción de campos no ofrece Owner ni `duplicate_check_fields`; el ejecutor devuelve `data[0].details` | Inspección estática completada; no valida autenticación ni comportamiento de la cuenta Zoho |
| Scopes de credencial en paquete | Definición OAuth2 local declara scopes por defecto `ZohoCRM.modules.ALL`, `ZohoCRM.settings.all`, `ZohoCRM.users.all` | Solo valores por defecto del tipo de credencial; scopes consentidos por la cuenta no comprobados. Revisar mínimo privilegio durante la prueba |
| Workflow de calificación | `n8n/leadflow-zoho-qualification.workflow.json`: análisis Python con JSON válido, 8 nodos, `active=false`, IDs únicos, referencias de conexión completas y cero credenciales embebidas | Validación estructural PASS; no equivale a importación en UI ni a ejecución de integración |

**Conclusión:** TICKET-001 marcado DONE por confirmación del usuario de que todos los casos del workflow pasaron tras corregir el placeholder inicial de Owner.id. A petición del usuario no se retuvieron salidas detalladas, valores de metadata, mapping ni IDs; PASS es un resultado reportado, no reproducido independientemente, y esa omisión reduce la reproducibilidad. No incluir secretos ni listas completas de usuarios. No se ha iniciado el ticket siguiente.

## TICKET-002 — Docker mínimo y configuración segura (2026-10-21)

| Comprobación | Resultado observado | Estado / límite |
|---|---|---|
| Dependencia y versiones | Rama `feat/zoho-crm`; TICKET-001 está DONE según su evidencia registrada. Docker Compose `v5.6.0`; n8n `2.5.0` | PASS |
| `docker compose config --quiet` | Configuración válida. Config normalizada contiene exactamente `frontend` y `n8n`, ambos con publicación en `127.0.0.1`; volumen `leadflow-v2-compose-n8n-data` | PASS |
| Build y arranque | `docker compose up --build --detach` construyó el frontend (TypeScript/Vite) y arrancó ambos servicios; ambos reportaron `healthy` | PASS |
| Servicios requeridos | `docker compose ps --all`: `frontend` y `n8n` saludables. No hay servicios backend, PostgreSQL ni `n8n-init` en el Compose | PASS |
| Acceso local | `GET http://127.0.0.1:5173/`, `GET http://127.0.0.1:5678/` y `GET http://127.0.0.1:5678/healthz` respondieron HTTP 200 | PASS |
| Inicialización automática | En el volumen nuevo no había workflows tras el primer arranque. No existe servicio/script initializer, ni usuario/contraseña predeterminados. El setup del owner se hace manualmente en el asistente de n8n | PASS; el owner no se creó como parte de esta prueba |
| Workflow de prueba | Se importó manualmente por CLI el workflow inactivo `LeadFlow TICKET-002 persistence probe`; tras `docker compose down` y `docker compose up --detach`, `n8n list:workflow` confirmó que seguía presente e inactivo | PASS; workflow de prueba queda en el volumen local para evidencia |
| Volúmenes | Compose creó `leadflow-v2-compose-n8n-data`, distinto del volumen aislado TICKET-001 `leadflow-v2-n8n-data`. El volumen TICKET-001 seguía presente. No se encontró el volumen v1 esperado `<project>_n8n_data`; ningún comando de prueba lo modificó. `docker compose down` conservó el nuevo volumen | PASS; sin volumen v1 preexistente que comparar |
| Ejemplos y bundle | `.env.example` raíz solo configura `VITE_N8N_WEBHOOK_URL`; credenciales de backend en su ejemplo son placeholders. Escaneo del bundle frontend no encontró marcadores de contraseñas/secretos ni credenciales predeterminadas | PASS |
| Whitespace | `git diff --check` | PASS |

**Conclusión:** TICKET-002 DONE. El stack queda detenido con `docker compose down` (sin `-v`); el volumen v2 y el workflow inactivo de prueba se conservaron. La ejecución no configuró ni probó integraciones Zoho/Slack, que no forman parte de este ticket. El volumen v1 esperado no existía en Docker antes de estas pruebas; los datos/volúmenes v1 no se borraron ni se usaron.

## TICKET-003 — Validación y normalización n8n (2026-10-21)

Entorno: Docker Engine `29.8.2`, imagen n8n `2.5.0`; workflow importado en una instancia aislada temporal. El archivo versionado permaneció `active=false`; para ejecutar HTTP real se publicó solo la copia del contenedor de prueba, con el export montado como solo lectura y sin volúmenes de datos persistentes. El formulario envía JSON serializado con `Content-Type: text/plain` para que el parser sintáctico se ejecute dentro del workflow.

| Comprobación | Entrada/pasos | Resultado observado | Estado / límite |
|---|---|---|---|
| Importación del export | `n8n import:workflow --input=...` con la imagen `n8nio/n8n:2.5.0` | CLI importó correctamente 1 workflow; se ejecutó la copia aislada por HTTP | PASS; el export versionado sigue inactivo |
| Estructura/aislamiento | Inspección JSON de nodos, conexiones, CORS, credenciales y respuestas | 18 nodos; solo Webhook, IF, Set y Respond to Webhook; conexiones completas; sin credenciales, integraciones ni texto/estado `saved`; `active=false`; CORS configurado como `http://localhost:5173` | PASS |
| Normalización y servicio desconocido | JSON sintético con espacios en los textos y email con mayúsculas, enviado como `text/plain`; `serviceRequested=Otro` | HTTP 200; campos recortados, email en minúsculas, `details` recortado; el servicio desconocido pasa a la futura validación TICKET-004; respuesta sin estado de persistencia | PASS |
| Obligatorios | Para empresa, contacto, email y servicio: cada campo omitido, vacío y con solo espacios (12 solicitudes) | Las 12 respuestas fueron HTTP 400 con el campo correcto y mensaje estable | PASS |
| Email, claves y tipos | Email inválido; email numérico; clave adicional | HTTP 400 con campo `email` o `body`, sin información interna | PASS |
| Límites | Para empresa/contacto 160, email 320, servicio 100 y details 10.000: longitud exacta y máximo + 1 | Los cinco límites exactos devolvieron HTTP 200; cada valor + 1 devolvió HTTP 400 en su campo | PASS; longitudes tras trim |
| Details opcional | `details` omitido, nulo, numérico | Omitido/nulo: HTTP 200 y `details: null`; número: HTTP 400 | PASS |
| JSON/objeto | Array, escalar, null y JSON sintácticamente malformado, enviados como `text/plain` | Los cuatro casos devolvieron HTTP 400 con `field=body` y mensaje comprensible, sin stack/details internos | PASS |
| CORS | POST sintético desde `http://localhost:5173` y `http://example.invalid` | El header `Access-Control-Allow-Origin` se mantuvo fijo en `http://localhost:5173`; ambos POST llegaron al endpoint y dieron HTTP 200 | PASS para header exacto; confirma que CORS no bloquea ni autentica llamadas directas |
| Parser con otro content type | JSON malformado enviado como `application/json` | n8n respondió HTTP 422 `Failed to parse request body` antes de ejecutar el workflow; no se puede personalizar ese parser desde el export | Limitación documentada: el formulario usa `text/plain`; otros clientes requieren el mismo transporte si necesitan HTTP 400 controlado |
| Build del formulario | `npm.cmd run build` desde `frontend/` | `tsc -b` y Vite build completaron; Vite `6.4.4` | PASS |

**Evidencia de HTTP:** 31 casos sintéticos de validación pasaron: contrato normalizado, 12 variaciones de campos obligatorios, email/tipos, clave extra, diez pruebas de límites, details opcional y no objeto/JSON malformado. No se probaron Zoho/Slack ni se guardaron leads; están fuera de TICKET-003. El contenedor temporal fue detenido al terminar y no montó ni modificó el volumen Compose v2.

**Conclusión:** TICKET-003 DONE para el transporte del formulario documentado (`text/plain` con cuerpo JSON). La limitación de n8n para JSON malformado con `application/json` queda explícita; CORS sigue siendo solo una política de navegador y la demo debe permanecer local.
