# Resultados de pruebas

**Estado: PENDIENTE para la aceptación integral de LeadFlow v2.** Hay comprobaciones de integración parciales (incluida la asignación TICKET-004); no equivalen a completar el flujo principal. El estado y los límites de cada ticket se registran abajo.

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

## TICKET-004 — Reglas y propietarios Zoho reales (2026-10-21)

| Comprobación | Resultado observado | Estado / límite |
|---|---|---|
| Rama y dependencias | Rama `feat/zoho-crm`; TICKET-001 y TICKET-003 aparecen DONE en el tablero. TICKET-001 tiene confirmación reportada de pruebas, pero no retuvo mapping ni IDs; TICKET-003 registra 31 casos HTTP sintéticos y no incluye Zoho | Dependencias de estado verificadas; no hay evidencia reproducible de IDs para asignación |
| Instancia local para integración | `docker ps -a --filter "name=leadflow"` no listó contenedores. La consulta de volúmenes mostró `leadflow-v2-compose-n8n-data` y `leadflow-v2-n8n-data`; no se inspeccionaron ni modificaron | BLOCKED: no hay instancia n8n activa donde verificar credenciales Zoho. Volúmenes preservados |
| Mapping RRHH, Legal y Automatización | TICKET-001 no conserva los IDs reales ni la asociación por servicio | NOT_RUN; no es seguro configurar Owner ni probar las tres reglas sin esos valores |
| Usuario activo/asignable, ID inválido, usuario inactivo y permisos de consulta | Requiere cuenta Zoho y credencial OAuth configurada | NOT_RUN; no se hicieron llamadas a Zoho |
| `Otro` devuelve 422 antes de guardar | La prueba de TICKET-003 confirma que `Otro` pasa la validación de formulario para la futura regla; no existía workflow de asignación activo para probar esta respuesta | NOT_RUN para TICKET-004 |
| Cambio del mapping | Requiere editar y ejecutar el mapping real en n8n | NOT_RUN |
| Rechazo Zoho de Owner inválido | Caso previsto para TICKET-005 | NOT_RUN; no se adelantó ese ticket |

**Conclusión:** TICKET-004 BLOCKED. No se implementó ni exportó una asignación parcial con placeholders. Para reanudar, se requiere acceso a la instancia/cuenta Zoho autorizada con permisos efectivos para consultar usuarios, verificar su estado y asignabilidad, y registrar los tres IDs reales asociados a cada servicio. Luego ejecutar las pruebas de este ticket y documentar evidencia anonimizada. Ninguna prueba de integración de TICKET-004 se marca PASS.

### TICKET-004 — Reanudación con mapping proporcionado (2026-10-23)

| Comprobación | Resultado observado | Estado / límite |
|---|---|---|
| Mapping compartido | Usuario proporcionó RRHH `6300195000001281004`, Automatización `6300195000000468001` y Legal `6300195000001281013`; guardados como strings en el export | Configuración aplicada; fuente reportada por el usuario, no verificada contra Zoho |
| Workflow estático | JSON parseado; 10 nodos; IDs únicos; todas las conexiones apuntan a nodos existentes; `active=false`; cero credenciales embebidas. Se ejecutaron localmente las expresiones de normalización/mapping con los tres servicios y espacios alrededor | PASS de validación estática y expresiones sintéticas; no equivale a importación/ejecución n8n |
| Sin regla y errores | Export define HTTP 422 para servicio sin regla y respuestas explícitas para Owner ausente y error de consulta; inspección estática de la topología | PASS de inspección de configuración solamente; HTTP real NOT_RUN |
| Compose y whitespace | `docker compose config --quiet`; `git diff --check` | PASS |
| n8n / Zoho OAuth (estado inicial) | En el primer intento Docker no pudo conectar al daemon. Tras el mensaje del usuario, `docker compose up --build --detach` arrancó frontend y n8n; ambos quedaron saludables y `GET http://127.0.0.1:5678/healthz` respondió HTTP 200. API host y credencial aún no estaban configurados/enlazados en el instante de esta comprobación | Stack local PASS; configuración agregada en la continuación de abajo |
| Importación y persistencia del workflow (estado inicial) | `n8n import:workflow --input=/tmp/leadflow-zoho-assignment.workflow.json` importó 1 workflow; `n8n list:workflow` mostró el workflow nuevo y el workflow previo `LeadFlow TICKET-002 persistence probe`. Se exportó desde la instancia y se inspeccionó sin revelar credenciales | PASS: export importado, `active=false`, 10 nodos, 0 referencias de credenciales; volumen existente se preservó. En la continuación se enlazó 1 credencial |
| Estado activo/asignable de los tres Owners (estado inicial) | Requiere consulta `ActiveUsers` de la cuenta Zoho y prueba real | Inicialmente NOT_RUN; las tres asignaciones se verificaron con OAuth en la continuación de abajo |
| Servicio `Otro`, ID inválido, Owner inactivo y error de permisos | Requiere importar y ejecutar el workflow con la credencial Zoho autorizada | NOT_RUN |
| Reasignación al cambiar mapping y caso Owner inválido del upsert | Requiere editar/ejecutar n8n; rechazo del upsert corresponde además a TICKET-005 | NOT_RUN |

| Datos externos confirmados por el usuario | API base `https://www.zohoapis.com/crm/v8`; indicó que la credencial OAuth está guardada en n8n y confirmó que los tres IDs son activos/asignables | API/OAuth se usaron en las consultas reales; cada ID quedó listado por Zoho para su servicio correspondiente |
| Prueba desde el formulario | Usuario informó el mensaje “No pudimos conectar con el flujo” | No es prueba de asignación. En la instancia actual solo se listaron el workflow de persistencia de TICKET-002 y el de asignación TICKET-004 inactivo; no hay workflow activo de recepción de leads. No repetir solicitudes del formulario en este estado |
| Login/editor y vínculo de credencial | El usuario inició sesión manualmente; se configuró el API base y se seleccionó la credencial Zoho existente en el nodo. Exportación posterior desde CLI mostró 1 referencia de credencial configurada | PASS; el export versionado sigue sin credenciales |
| RRHH | POST de prueba a `/webhook-test/leadflow-assignment-check` con `serviceRequested=RRHH` | HTTP 200; `assignment.status=resolved`; Owner ID coincide con mapping | PASS; solo consulta de usuarios activos, no persiste datos |
| Legal | POST de prueba a `/webhook-test/leadflow-assignment-check` con `serviceRequested=Legal` | HTTP 200; `assignment.status=resolved`; Owner ID coincide con mapping | PASS; solo consulta de usuarios activos, no persiste datos |
| Automatización | Primer cuerpo sintético local devolvió HTTP 422 porque el texto acentuado no se transmitió con codificación correcta; repetición con el escape JSON Unicode `\u00f3` | HTTP 200; servicio normalizado `Automatización`; Owner ID coincide con mapping | PASS en la repetición correctamente codificada; se documenta el intento inicial como fixture defectuoso |
| Servicio desconocido | POST de prueba con `serviceRequested=Otro` | HTTP 422 `service_unassigned`; el flujo termina antes de consultar usuarios | PASS; el workflow no tiene nodos de guardado/Slack |

**Conclusión al 2026-10-23:** TICKET-004 seguía BLOCKED mientras faltaban las pruebas de Owner desconocido/inactivo y error de permisos. El formulario de leads dio “No pudimos conectar con el flujo”: la instancia solo tenía el flujo de asignación inactivo y el workflow de prueba; no había una recepción activa. No repetir envíos del formulario en ese estado.

### TICKET-004 — Comprobaciones adicionales (2026-10-24)

| Comprobación | Entrada/precondición | Resultado observado | Estado / límite |
|---|---|---|---|
| Owner desconocido y cambio del mapping en copia temporal | Se cambió RRHH a un ID sintético inexistente en una copia de test mode; el workflow original no se alteró | La consulta OAuth `users?type=ActiveUsers` terminó y el webhook respondió HTTP 503 `owner_unavailable` | PASS; confirma que el mapping modificado se usa y que no se acepta un Owner ausente. No se guardó un Lead ni se envió Slack |
| Error de consulta/credencial | Se quitó la referencia OAuth solo en otra copia temporal y se llamó al webhook de prueba | HTTP 503 `owner_lookup_failed` con mensaje explícito de no guardar ni notificar | PASS para la ruta ante fallo local de credencial; no equivale a una respuesta 403 real de Zoho |
| Usuario Zoho inactivo y permisos insuficientes | Requiere un usuario inactivo controlado y/o una credencial OAuth aislada con permisos insuficientes | No se alteró la credencial existente ni se encontró un usuario inactivo de prueba | NOT_RUN; no se pudo verificar la respuesta real de Zoho en esos casos |
| Limpieza y estado del workflow | Se eliminaron ambas copias temporales; se consultó `n8n list:workflow` | Solo permanece `LeadFlow Zoho owner assignment check (inactive)` | PASS; workflow original sigue inactivo |

**Conclusión al 2026-10-24:** la prueba de Owner desconocido, la respuesta 422 de `Otro`, las tres reglas reales y la respuesta explícita ante un fallo local de lookup están verificadas. Por autorización explícita del usuario, TICKET-004 queda DONE; las pruebas específicas de usuario inactivo y permisos OAuth insuficientes permanecen NOT_RUN y no se alteró la credencial existente para simularlas. El rechazo de Zoho al guardar un Owner inválido es de TICKET-005. El workflow no escribe Leads ni envía Slack, y la instancia conserva el original inactivo.

## TICKET-005 — Upsert de Leads por email (2026-10-23)

| Comprobación | Resultado observado | Estado / límite |
|---|---|---|
| Rama y dependencia | Rama activa `feat/zoho-crm`; TICKET-001, TICKET-003 y TICKET-004 figuran DONE. TICKET-004 conserva dos pruebas NOT_RUN autorizadas explícitamente por el usuario | TICKET-005 sigue sin iniciarse; requiere autorización independiente |
| Casos funcionales y de integración TICKET-005 | No se ejecutaron create/update, lectura del mismo ID, reasignación, preservación de campos, email mayúsculas, fallos OAuth/conexión, errores por registro, timeout/reenvío ni solicitudes simultáneas | NOT_RUN; TICKET-005 no fue autorizado en esta ejecución y no se hicieron escrituras en Zoho |
| Export/workflow y pruebas locales | No se modificó ningún workflow ni código; no aplica ejecutar pruebas de implementación | NOT_RUN |

**Conclusión:** TICKET-005 no se inició en esta ejecución, aunque su dependencia TICKET-004 ya figura DONE; se respeta el alcance autorizado y se espera una autorización independiente. No se realizaron escrituras ni se publicaron workflows. No se inicia TICKET-006.
