# Plan de pruebas funcionales

## Estrategia

Cada ticket define pruebas antes de implementación. Validación/asignación puede usar entradas simuladas; integración Zoho/Slack y aceptación de punta a punta necesitan cuenta/canal de prueba reales. El frontend se verifica con mocks sencillos y navegador; usar automatización solo si es mantenible. No crear framework complejo ni reutilizar resultados de pruebas v1 como evidencia v2.

Para cada ejecución registrar fecha, ticket/caso, versiones de n8n/workflow/frontend, precondición, entrada, pasos, resultado esperado y observado, estado (`PASS`, `FAIL`, `NOT_RUN`, `BLOCKED`), evidencia anonimizada y limitaciones. No usar PASS si no se ejecutó.

Fixture documental: empresa `Empresa Demo`, contacto `Alex Ejemplo`, servicio `RRHH`, details `Presupuesto estimado: 2500`. Emails ilustrativos `example.com` no se deben usar como resultado de integración. Las pruebas reales usarán direcciones sintéticas únicas controladas por el usuario. IDs Owner, API names y canales se obtienen de la cuenta, nunca se inventan.

## Matriz integral

| ID | Entrada/precondición | Resultado esperado y comprobación |
|---|---|---|
| TP-01 Lead nuevo | Email sin registro, RRHH | 201 saved/created; un Lead; Owner RRHH real; Slack confirmado; UI éxito. |
| TP-02 Lead existente | Repetir email con empresa/details modificados | 200 saved/updated; mismo ID; campos gestionados actualizados; aviso de actualización. |
| TP-03 Obligatorios | Omitir empresa/contacto/email/servicio, individualmente; vacío/espacios | 400 con error de campo; cero escrituras y cero mensajes. |
| TP-04 Email inválido | Formato incorrecto o tipo no string | 400; cero efectos laterales. |
| TP-05 Reglas | Un email único por RRHH, Legal y Automatización | Owner.id real correcto al leer Zoho, no solo texto. |
| TP-06 Sin regla | `serviceRequested=Otro` | 422 antes de guardar; no hay lead ni Slack. |
| TP-07 Owner no válido | ID inexistente/inactivo/no asignable | Error explícito; sin Owner implícito, lead exitoso ni Slack. |
| TP-08 Zoho auth/permisos | Credencial revocada o permiso insuficiente en prueba aislada | Error de integración; no Slack; ningún token expuesto. |
| TP-09 Conexión Zoho | Rechazo, desconexión y timeout controlados | Not saved solo si el rechazo es conocido; timeout tras envío es unknown y no hay Create ciego. |
| TP-10 Slack falla | Zoho confirmó; canal/permisos incorrectos | 201/200, persistence saved, notification failed/unconfirmed; UI indica aviso pendiente; un Lead. |
| TP-11 Reintento | Repetir solicitud después de respuesta perdida | Mismo Lead/ID; no duplicado innecesario; posible aviso repetido documentado. |
| TP-12 Reasignación | Mismo email cambia servicio RRHH→Legal | Mismo ID, Owner Legal según política; aviso actualizado; campos ajenos preservados. |
| TP-13 Solicitudes simultáneas | Dos envíos con email normalizado igual | Medir cantidad final; reconciliar sin Create ciego y documentar garantías reales. |
| TP-14 Límites/CORS | Valor máximo/+1, cuerpo grande, OPTIONS/POST desde distintos orígenes | Límites consistentes; origen permitido funciona; otros no reciben CORS; se demuestra que CORS no autentica llamadas directas. |
| TP-15 Resultado incierto | JSON corrupto, error de red, timeout Slack | UI no declara fallo de persistencia sin evidencia; Slack timeout = unconfirmed; no reenvío automático. |
| TP-16 Update no destructivo | details ausente/nulo/vacío, email mayúsculas, datos comerciales existentes | Email canónico coincide; Description se conserva si no hay valor; campos fuera del contrato intactos. |

Además, comprobar: build frontend; `docker compose config`; export importable sin credenciales; workflow inactivo hasta configurarlo; instalación y reinicio con volumen v2; UI sin CRM; inspección de bundle, logs y exports sin secretos/PII innecesaria.

## Casos de TICKET-003

Probar el export de validación inactivo con JSON sintético enviado como `text/plain` (el formulario usa esta representación para que el JSON malformado alcance el workflow). Los máximos del contrato son 160 caracteres para `companyName` y `contactName`, 320 para `email`, 100 para `serviceRequested` y 10.000 para `details` (límite de aplicación acordado, no máximo verificado de Zoho). Se cuenta la longitud después de `trim`. Comprobar el HTTP 400 y el error por campo, las cuatro propiedades obligatorias, claves adicionales, formatos/tipos de email y `details` omitido/nulo/tipo inválido. El caso positivo debe devolver el contrato normalizado y no una afirmación de persistencia. No activar este export como workflow final.

## Procedimiento con servicios externos

Completar TICKET-001 y configurar cuentas de prueba. Anotar estado de Zoho por email antes de cada caso. Ejecutar webhook de prueba/producción local según corresponda; verificar respuesta HTTP, leer Lead y Owner en Zoho, comparar conteos y revisar canal Slack/UI. Simular errores solo en entorno aislado y restaurar la configuración. Anonimizar evidencia. No desconectar credenciales reales ni eliminar registros ajenos.
