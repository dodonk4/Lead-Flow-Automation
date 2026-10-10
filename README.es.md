[English](README.md) | **Español**

# LeadFlow

**De un formulario web a un asesor notificado en Slack, sin que nadie copie datos a mano.**

LeadFlow es una demo de automatización empresarial: toma el proceso de captar un contacto comercial, registrarlo, decidir quién debe atenderlo y avisarle. Está pensada para mostrar cómo analizar un proceso, conectar sistemas y automatizar una tarea repetitiva. No es un CRM comercial: el CRM es una simulación mínima al servicio del flujo.

## Problema empresarial

Cuando una empresa recibe consultas por un formulario, cada contacto debe llegar rápido a la persona correcta. Si ese traspaso depende de personas, aparecen errores previsibles: consultas que nadie ve, datos mal copiados, dudas sobre quién es responsable y retrasos en la primera respuesta.

## Proceso manual (el que se automatiza)

1. Llega el formulario a una bandeja de correo o a una hoja de cálculo.
2. Alguien lo lee y copia los datos al CRM.
3. Esa persona decide qué asesor corresponde según el servicio pedido.
4. Se lo asigna en el CRM.
5. Avisa al asesor por chat o correo.

Cada paso es repetitivo, depende de que alguien esté atento y puede fallar sin que se note.

## Solución

LeadFlow encadena esos pasos de forma automática y determinística:

- el formulario envía el lead a un flujo de **n8n**;
- el **backend** valida los datos, los guarda en PostgreSQL y asigna el asesor según reglas configurables;
- n8n usa la respuesta real del backend para **notificar por Slack** al equipo;
- una **vista de CRM** de solo lectura permite comprobar que el lead quedó registrado y asignado;
- si algo falla, el flujo lo informa de forma explícita en lugar de aparentar éxito.

Este proyecto no mide ahorros de tiempo ni resultados comerciales; muestra el proceso automatizado de punta a punta.

## Flujo de automatización

```text
Formulario (React)
      │  POST
      ▼
Webhook de n8n
      │  POST /api/leads
      ▼
Backend: validación (Zod) → guardado y asignación en una transacción → PostgreSQL
      │  lead + asesor asignado
      ▼
n8n: ¿hay asesor asignado?
      ├─ sí → mensaje en Slack → respuesta 201 al formulario
      └─ no → respuesta 201 sin notificación ("skipped")

Errores: la llamada al backend falla → 502; Slack no confirma → 502 con el ID del lead.
```

La asignación y el registro ocurren en una única transacción: si falla la asignación, no queda un lead a medias.

## Arquitectura

```text
frontend (React/Vite) ──► n8n (webhook) ──► backend (Express) ──► PostgreSQL
        │                       │
        │                       └──► Slack
        └──── solo lectura (GET /api/leads) ──► backend
```

- **Frontend:** formulario y CRM de solo lectura. El formulario habla con n8n, no con el backend, y la URL del webhook se configura con `VITE_N8N_WEBHOOK_URL`.
- **n8n:** orquesta el flujo e integra Slack. No contiene reglas de validación ni de asignación.
- **Backend:** capas `controller → service → repository → base de datos`. La lógica de negocio queda en el backend, donde puede probarse.
- **PostgreSQL:** guarda leads, asesores y reglas con Prisma.

Decisión de diseño: el reparto de responsabilidades evita duplicar lógica. n8n conecta sistemas; el backend decide.

## Tecnologías y por qué se usan

| Tecnología | Motivo |
| --- | --- |
| Node.js + TypeScript | Lenguaje único y tipado estricto en backend y frontend. |
| Express | API HTTP mínima, suficiente para el alcance. |
| Zod | Valida la entrada en el límite del sistema. |
| PostgreSQL + Prisma | Modelo relacional claro (lead ↔ asesor ↔ regla) y migraciones versionadas. |
| n8n | Orquestación visual y exportable; es lo que se muestra en la demo. |
| Slack | Notificación visible para demostrar el resultado. |
| React + Vite | Interfaz mínima sin añadir complejidad. |
| Docker Compose | Cualquier persona debería poder levantar la demo con pocos pasos. |

## Estructura del proyecto

```text
backend/    API Express, Prisma (schema, migración y seed), tests
frontend/   Formulario y CRM de solo lectura (React + Vite)
n8n/        Workflow exportado, script de inicialización y documentación
docker-compose.yml
```

`backend/` y `frontend/` son proyectos npm independientes; no hay `package.json` en la raíz. El detalle del backend está en [backend/README.es.md](backend/README.es.md).

## Reglas de asignación

La asignación es determinística: el servicio solicitado se compara de forma exacta con una regla activa, y solo se consideran asesores activos. No interviene IA.

| Servicio | Asesor | Email (ficticio) |
| --- | --- | --- |
| `RRHH` | Carlos Gómez | `carlos.gomez@example.com` |
| `Legal` | María López | `maria.lopez@example.com` |
| `Automatización` | Ana Torres | `ana.torres@example.com` |

Las reglas viven en la tabla `assignment_rules`, así que se pueden cambiar sin tocar el código. El seed (`npm run db:seed`, ejecutado automáticamente en Compose) los carga de forma idempotente y no sobrescribe registros existentes. Si un servicio no tiene regla, el lead se guarda sin asesor.

## Integración con n8n

El workflow `n8n/lead-intake-to-slack.workflow.json` recibe el formulario por webhook, llama al backend y responde al formulario según el resultado real. Compose incluye un servicio `n8n-init` que, antes de iniciar n8n, crea la cuenta local de propietario, importa el workflow y lo publica. Quien clone el repositorio no tiene que importar nada manualmente. En arranques posteriores conserva el workflow y la configuración existentes. Más detalles en [n8n/README.es.md](n8n/README.es.md).

## Integración con Slack

El nodo de Slack publica un mensaje con empresa, contacto, servicio solicitado, email, detalles y asesor asignado. Las credenciales de Slack se guardan en el gestor de credenciales de n8n, nunca en el repositorio ni en el frontend. Para activarlo:

1. En n8n, asigna tu credencial de Slack al nodo **Send lead notification to Slack**.
2. Define `LEADFLOW_SLACK_CHANNEL_ID` en `.env`.
3. Recrea n8n: `docker compose up -d --force-recreate n8n`.

Si Slack no está configurado, el lead se registra igualmente y el formulario informa que el aviso quedó pendiente de confirmar; el flujo no lo presenta como enviado.

## Cómo ejecutar el proyecto

Requisito: Docker Desktop con Docker Compose. Desde la raíz, en PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Compose levanta PostgreSQL, aplica migraciones y seed, inicia el backend, inicializa y arranca n8n, y sirve el frontend.

| Servicio | URL |
| --- | --- |
| Formulario | <http://localhost:5173> |
| CRM (solo lectura) | <http://localhost:5173/crm> |
| n8n | <http://localhost:5678> |
| Health del backend | <http://localhost:3000/health> |

Credenciales locales de n8n (solo desarrollo, puertos en `127.0.0.1`): `leadflow@example.com` / `LeadFlow2026!`; puedes cambiarlas en `.env`. Los datos persisten en los volúmenes `postgres_data` y `n8n_data`.

```powershell
docker compose down       # detiene y conserva los datos
docker compose down -v    # borra también los datos (irreversible)
```

## Cómo ejecutar los tests

Los tests del backend usan el runner de Node con `tsx` y no necesitan base de datos. Desde `backend/`:

```powershell
npm ci
npm test
```

Cubren validación y creación de leads, reglas de asignación, creación y asignación en transacción, manejo de errores de persistencia, endpoints de lectura y CORS. No hay tests automatizados del workflow de n8n ni del frontend.

## Cómo realizar la demo

1. Levanta el proyecto con Docker Compose y confirma que `/health` responde.
2. (Opcional) Configura Slack como se indica arriba.
3. Abre el formulario, completa los datos y elige un servicio.
4. Observa el resultado: lead recibido, procesamiento y asesor asignado.
5. Muestra el mensaje en Slack, si está configurado.
6. Abre `/crm` y comprueba el lead con su asesor.
7. Para enseñar la lógica de asignación, repite con los tres servicios y compara el asesor resultante.

## Limitaciones

- Es una demo, no un CRM: sin autenticación, usuarios, roles ni multi-tenancy.
- El estado del lead en el CRM se deriva de si tiene asesor asignado; no hay pipeline.
- La tabla `notifications` existe en el modelo, pero el flujo actual no registra en ella los envíos.
- No hay reintentos automáticos: si el resultado es incierto, el formulario pide verificar antes de reenviar, para no duplicar leads.
- El webhook de n8n no tiene autenticación ni protección contra abuso.
- Las credenciales por defecto son solo para uso local; la configuración requiere endurecerse para cualquier despliegue.
- No se han medido ahorros de tiempo ni resultados de negocio.