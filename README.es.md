[English](README.md) | **Español**

# LeadFlow

LeadFlow es una demo pequeña de automatización empresarial: un formulario React envía una consulta a un webhook n8n, que la valida, asigna determinísticamente, la guarda en Zoho CRM, notifica por Slack y devuelve por separado los resultados del guardado y de la notificación.

## Arquitectura y estado

```text
Formulario React → webhook n8n → validación y asignación determinística
                                  → Zoho CRM / Leads → Slack → respuesta
```

Zoho es el único registro empresarial persistente. n8n coordina el flujo y Slack solo notifica. El frontend llama al webhook configurable y no mantiene una base de leads ni credenciales privadas de integración.

La rama `feat/zoho-crm` contiene únicamente la implementación v2: Compose inicia frontend y n8n. Los workflows de integración versionados permanecen inactivos hasta configurarlos y habilitarlos deliberadamente. El backend v1 y su workflow se retiraron de esta rama; `main` conserva v1. Este cambio no migra leads ni elimina volúmenes.

## Ejecución local

Requisitos: Docker Desktop y Docker Compose. Desde la raíz:

```powershell
docker compose config
docker compose up --build --detach
docker compose ps
```

Abre el formulario en <http://localhost:5173> y n8n en <http://localhost:5678>. Ambos servicios se enlazan a loopback. En el primer acceso, crea manualmente el usuario owner de n8n. Compose no importa ni publica workflows. Puedes definir `VITE_N8N_WEBHOOK_URL` en el `.env` de la raíz antes de compilar; no debe contener credenciales.

Detén los servicios sin borrar datos:

```powershell
docker compose down
```

No uses `docker compose down -v`. El volumen n8n v2 almacena configuración y credenciales de n8n, no leads, y está separado de cualquier volumen v1. Mantén la demo en local: CORS no autentica, y la exposición pública está bloqueada hasta verificar HTTPS, protección del editor y controles efectivos contra abuso.

## Verificación

```powershell
Set-Location frontend
npm ci
npm run build
Set-Location ..
docker compose config
docker compose build
```

El [plan de pruebas](docs/testing/test-plan.md) y los [resultados](docs/testing/test-results.md) contienen casos, límites y evidencia registrada.

## Guías del proyecto

- [Arquitectura](docs/architecture.md)
- [Configuración local y límites de seguridad](docs/setup.md)
- [Decisiones](docs/decisions.md)
- [Guía del frontend](frontend/README.es.md)
- [Guía de n8n](n8n/README.es.md)
- [Índice y alcance de tickets](docs/tickets/README.md)

La rama `main` conserva la implementación v1 original; esta rama no la modifica.
