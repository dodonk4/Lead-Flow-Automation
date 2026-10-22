# Arquitectura LeadFlow v2

## Estado del documento

Este es el diseño objetivo de `feat/zoho-crm`, no una afirmación de que ya esté implementado. Análisis del repositorio realizado el 2026-10-20. TICKET-001 se cerró por confirmación del usuario; la metadata y el mapping detallados no se conservaron, por lo que no se consideran reproducibles. La integración Zoho/Slack todavía no está configurada en el Compose.

## Arquitectura actual observada

```text
Formulario React → webhook n8n → Express/Zod → Prisma/PostgreSQL
                                             (crear + asignar)
                         n8n → Slack → respuesta al navegador
Vista CRM React → GET /api/leads y /api/leads/:id
```

El formulario de `frontend/src/App.tsx` ya envía POST al webhook `VITE_N8N_WEBHOOK_URL`, con `companyName`, `contactName`, `email`, `serviceRequested` y `details`. El presupuesto obligatorio se concatena en `details`. El backend valida esos campos, crea el lead y asigna mediante una transacción. `backend/prisma/seed.ts` define RRHH → Carlos Gómez, Legal → María López y Automatización → Ana Torres; son asesores de demostración con emails `example.com`, no usuarios Zoho comprobados. Sin regla, la versión actual guarda el lead sin asesor. No hay unicidad de email en el modelo Lead.

El workflow `n8n/lead-intake-to-slack.workflow.json` es el workflow v1: llama al backend y no es iniciado por el Compose v2. El Compose actual contiene únicamente frontend y n8n 2.5.0, enlazados a loopback; no inicia backend, PostgreSQL ni un servicio inicializador. La cuenta owner se crea manualmente en el editor y ningún workflow se importa o publica automáticamente. El volumen `leadflow-v2-compose-n8n-data` aísla los datos nuevos del volumen v1.

TICKET-003 añade `n8n/leadflow-form-validation.workflow.json` como export de prueba inactivo. El webhook `POST leadflow-form` acepta el JSON del formulario como texto `text/plain`, lo parsea y rechaza objetos/valores fuera del contrato antes de normalizar; no contiene integraciones ni guarda leads. El formulario usa este tipo de contenido para que el JSON malformado llegue a los nodos y reciba un 400 controlado en lugar del 422 previo al workflow de n8n. Un cliente que envíe sintaxis malformada como `application/json` todavía recibe ese 422 del parser n8n. Los límites de captura son los del contrato anterior (empresa/contacto 160, email 320, servicio 100); `details` tiene un máximo de aplicación de 10.000 caracteres, no atribuido a Zoho.

## Arquitectura objetivo

```text
Formulario React
  → POST webhook n8n
  → validar y normalizar
  → asignar servicio → Owner Zoho real
  → Zoho CRM / Leads: upsert por Email
  → validar resultado e ID por registro
  → Slack
  → respuesta que diferencia persistencia y notificación
```

### Responsabilidades

- **Frontend:** reutilizar el formulario; mostrar carga, éxito, validación, error y resultado incierto. No almacenar leads ni incluir credenciales. Seguir usando URL de webhook de build `VITE_N8N_WEBHOOK_URL`.
- **n8n:** validar el contrato, determinar asesor con nodos simples, llamar a Zoho, confirmar el éxito semántico, notificar Slack solo tras guardado y responder. Mantener export sin secretos ni datos fijados.
- **Zoho CRM:** único sistema de registro de leads. Usar módulo Leads, email como clave de coincidencia y Owner con ID real del usuario.
- **Slack:** aviso visual con empresa, contacto, servicio, detalles relevantes y asesor. No participa en persistencia.
- **Docker Compose:** solo frontend y n8n en la demo v2. Almacenamiento interno de n8n aislado del volumen v1. Inicialización OAuth, credenciales y publicación requieren configuración deliberada; no publicar un workflow incompleto automáticamente.

No habrá API Express, Prisma ni PostgreSQL de leads en v2. Los archivos de implementación v1 solo se retirarán en el ticket correspondiente, nunca durante este trabajo documental.

## Contrato propuesto

Se conserva el contrato actual para reducir cambios:

```json
{
  "companyName": "Empresa Demo",
  "contactName": "Alex Ejemplo",
  "email": "alex@example.com",
  "serviceRequested": "Automatización",
  "details": "Presupuesto estimado: 2500"
}
```

Empresa, contacto, email y servicio son obligatorios. `details` es opcional o nulo. Normalizar espacios y email a minúsculas sin alterar aliases del email; validar tipo, formato, límites y rechazar claves inesperadas. Límites definitivos dependen de metadatos reales de Zoho. El presupuesto permanece en `details`: no se inventará moneda ni campo numérico.

La validación del webhook aplica los máximos de contrato que ya estaban definidos en el backend (160/160/320/100) y un límite de aplicación de 10.000 caracteres para `details`. Este último limita el tamaño aceptado por LeadFlow; no afirma ser el máximo de Zoho `Description`.

### Mapeo Zoho pendiente de confirmación (TICKET-001)

| Entrada | Mapeo previsto |
|---|---|
| `companyName` | `Company` |
| `contactName` | `Last_Name`, usando nombre completo sin inferir apellidos |
| `email` | `Email`, coincidencia de upsert |
| `serviceRequested` | Campo de servicio; API name, tipo y disponibilidad por verificar |
| `details` | `Description`, con límite real por verificar |
| regla asignada | `Owner.id` de usuario activo y asignable |

No se conocen el API name del campo servicio, layout, campos obligatorios, edición, región, permisos ni usuarios de la cuenta. Confirmar todo mediante metadatos y pruebas con una cuenta de prueba; no inventar valores. Si el módulo requiere campos adicionales, actualizar el contrato y la documentación antes de implementar.

Inspección estática del paquete incluido en la imagen local n8n 2.5.0: el nodo Zoho CRM tiene `Get Fields` y `Create or Update` para Leads, y admite Email en campos adicionales. Su configuración de Lead no expone Owner ni `duplicate_check_fields`, y su ejecución descarta `action` al devolver `data[0].details`. Esto apunta a HTTP Request con credencial Zoho OAuth para upsert explícito/Owner y para conservar la respuesta completa. Es una observación del código del nodo, no una prueba contra la cuenta; el fallback debe validarse con el workflow de calificación y no se considera confirmado hasta ejecutar TICKET-001.

## Respuestas objetivo

- Creado: HTTP 201; actualizado: HTTP 200, solo si Zoho/nodo permite verificar la operación.
- Respuesta exitosa mínima: `{ "persistence": {"status":"saved","operation":"created"}, "data": {"id":"<Zoho ID como string>"}, "notification": {"status":"sent"}, "message":"Consulta registrada correctamente." }`.
- Si Slack falla después del guardado: mantener 201/200 y `persistence.status=saved`; indicar `notification.status=failed` o `unconfirmed`. No comunicar fallo de registro ni pedir reenviar el lead.
- Validación: 400 con errores de campo. Servicio sin regla: 422 antes de guardar. Configuración/propietario no disponible: error explícito sin éxito. Fallo confirmado de Zoho: no guardado. Timeout/resultado ambiguo: estado `unknown`; reconciliar por email antes de cualquier nueva creación.
- Nunca exponer errores internos, tokens, email de usuarios ni el registro Zoho completo al frontend.

## Actualización, duplicados y notificaciones

Usar upsert por email en lugar de búsqueda seguida de creación para reducir duplicados por reintento. Confirmar en TICKET-001 el soporte del nodo/versión para duplicate-check por Email y Owner. Upsert no garantiza ausencia de duplicados históricos, concurrencia perfecta ni idempotencia de Slack.

Política propuesta: al actualizar, recalcular Owner según servicio; por tanto, la regla puede sobrescribir una asignación manual. Actualizar solo los campos administrados por el formulario; no tocar estado comercial ni otros campos. Si `details` está ausente, nulo o vacío, conservar Description; un valor no vacío reemplaza solo el texto administrado. Verificar automatizaciones del tenant que puedan cambiar Owner.

Notificar cada upsert confirmado, etiquetando creado/actualizado. Un reintento puede generar aviso duplicado. No reintentar automáticamente Slack tras timeout ni volver a ejecutar el upsert para reparar un aviso; inspeccionar y reejecutar, si procede, solo la notificación del registro confirmado.

## Reutilización y retirada planeada

Reutilizar formulario/estilos, React/Vite, webhook configurable y conceptos de ramas IF/Respond to Webhook y Slack. Adaptar tipos y contrato de respuesta. La vista `CrmPage`, `crm.css`, navegación CRM, URL `VITE_API_BASE_URL`, backend, PostgreSQL y variables relacionadas quedarán obsoletos en esta rama y se retirarán solo en tickets posteriores. `main` conserva v1; no se migran datos automáticamente ni se eliminan volúmenes.

## Seguridad y operación

Credenciales de Zoho/Slack en el almacén seguro de n8n. CORS permite el origen del frontend, pero no autentica peticiones ni previene spam. Aplicación local por defecto; antes de exponer públicamente, exigir HTTPS, límites efectivos, protección del editor y revisión de retención de ejecuciones/PII. No añadir servicios externos sin justificarlo.

## Fuentes consultadas

- [n8n Zoho CRM node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zohocrm/)
- [n8n Zoho credentials](https://docs.n8n.io/integrations/builtin/credentials/zoho/)
- [Zoho CRM API v8 Upsert Records](https://www.zoho.com/crm/developer/docs/api/v8/upsert-records.html)

La documentación pública confirma capacidades generales; no confirma la cuenta, edición o versión local.
