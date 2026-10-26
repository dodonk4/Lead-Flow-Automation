**English** | [Español](README.es.md)

# LeadFlow

LeadFlow is a small business-automation demo: a React form sends an inquiry to an n8n webhook, which validates and assigns it, saves it in Zoho CRM, notifies Slack, and returns separate persistence and notification results.

## Architecture and status

```text
React form → n8n webhook → validation and deterministic assignment
                         → Zoho CRM / Leads → Slack → form response
```

Zoho is the only persistent business record. n8n coordinates the workflow; Slack is only a notification channel. The frontend calls the configurable webhook and keeps no lead database or private integration credentials.

The `feat/zoho-crm` branch contains the v2 implementation only: Compose starts the frontend and n8n. Versioned integration workflows remain inactive until deliberately configured and enabled. The former v1 backend and its workflow have been removed from this branch; `main` retains v1. No lead migration or volume removal is part of this change.

## Run locally

Requirements: Docker Desktop with Docker Compose. From the repository root:

```powershell
docker compose config
docker compose up --build --detach
docker compose ps
```

Open the form at <http://localhost:5173> and n8n at <http://localhost:5678>. Both services bind to loopback. On first access, create the n8n owner account yourself. Compose does not import or publish workflows. `VITE_N8N_WEBHOOK_URL` can be set in the root `.env` before building; it must not contain credentials.

Stop the stack without deleting data:

```powershell
docker compose down
```

Do not use `docker compose down -v`. The named n8n v2 volume contains n8n configuration and credentials, not leads, and is separate from any v1 volume. Keep this demo local: CORS is not authentication, and public deployment is blocked until HTTPS, editor protection, and effective abuse controls are verified.

## Verify

```powershell
Set-Location frontend
npm ci
npm run build
Set-Location ..
docker compose config
docker compose build
```

The form and workflow cases, limitations, and recorded evidence are in the [test plan](docs/testing/test-plan.md) and [test results](docs/testing/test-results.md).

## Project guides

- [Architecture](docs/architecture.md)
- [Local setup and security limits](docs/setup.md)
- [Decisions](docs/decisions.md)
- [Frontend guide](frontend/README.md)
- [n8n guide](n8n/README.md)
- [Ticket index and scope](docs/tickets/README.md)

The `main` branch preserves the original v1 implementation; this branch does not alter it.
