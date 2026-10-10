**English** | [Español](README.es.md)

# LeadFlow

**From a web form to an advisor notified on Slack, with nobody copying data by hand.**

LeadFlow is a business automation demo: it takes the process of capturing a sales inquiry, registering it, deciding who should handle it and notifying them. It is meant to show how to analyze a process, connect systems and automate a repetitive task. It is not a commercial CRM: the CRM is a minimal simulation that serves the flow.

## Business problem

When a company receives inquiries through a form, each contact must quickly reach the right person. If that handoff depends on people, predictable errors appear: inquiries nobody sees, badly copied data, doubts about who is responsible and delays in the first response.

## Manual process (the one being automated)

1. The form arrives in an email inbox or a spreadsheet.
2. Someone reads it and copies the data into the CRM.
3. That person decides which advisor corresponds based on the requested service.
4. They assign it in the CRM.
5. They notify the advisor by chat or email.

Every step is repetitive, depends on someone paying attention and can fail unnoticed.

## Solution

LeadFlow chains those steps automatically and deterministically:

- the form sends the lead to an **n8n** workflow;
- the **backend** validates the data, stores it in PostgreSQL and assigns the advisor according to configurable rules;
- n8n uses the backend's actual response to **notify the team on Slack**;
- a read-only **CRM view** lets you verify that the lead was registered and assigned;
- if something fails, the flow reports it explicitly instead of pretending it succeeded.

This project does not measure time savings or business results; it shows the automated process end to end.

## Automation flow

```text
Form (React)
      │  POST
      ▼
n8n webhook
      │  POST /api/leads
      ▼
Backend: validation (Zod) → save and assign in one transaction → PostgreSQL
      │  lead + assigned advisor
      ▼
n8n: is there an assigned advisor?
      ├─ yes → Slack message → 201 response to the form
      └─ no  → 201 response without notification ("skipped")

Errors: backend call fails → 502; Slack does not confirm → 502 with the lead ID.
```

Registration and assignment happen in a single transaction: if the assignment fails, no half-created lead remains.

## Architecture

```text
frontend (React/Vite) ──► n8n (webhook) ──► backend (Express) ──► PostgreSQL
        │                       │
        │                       └──► Slack
        └──── read-only (GET /api/leads) ──► backend
```

- **Frontend:** form and read-only CRM. The form talks to n8n, not to the backend, and the webhook URL is configured with `VITE_N8N_WEBHOOK_URL`.
- **n8n:** orchestrates the flow and integrates Slack. It contains no validation or assignment rules.
- **Backend:** `controller → service → repository → database` layers. Business logic stays in the backend, where it can be tested.
- **PostgreSQL:** stores leads, advisors and rules through Prisma.

Design decision: this split of responsibilities avoids duplicating logic. n8n connects systems; the backend decides.

## Technologies and why they are used

| Technology | Reason |
| --- | --- |
| Node.js + TypeScript | A single language with strict typing in backend and frontend. |
| Express | Minimal HTTP API, enough for the scope. |
| Zod | Validates input at the system boundary. |
| PostgreSQL + Prisma | Clear relational model (lead ↔ advisor ↔ rule) and versioned migrations. |
| n8n | Visual, exportable orchestration; it is what the demo showcases. |
| Slack | Visible notification to demonstrate the result. |
| React + Vite | Minimal interface without added complexity. |
| Docker Compose | Anyone should be able to start the demo in a few steps. |

## Project structure

```text
backend/    Express API, Prisma (schema, migration and seed), tests
frontend/   Form and read-only CRM (React + Vite)
n8n/        Exported workflow, initialization script and documentation
docker-compose.yml
```

`backend/` and `frontend/` are independent npm projects; there is no `package.json` at the root. Backend details are in [backend/README.md](backend/README.md).

## Assignment rules

Assignment is deterministic: the requested service is matched exactly against an active rule, and only active advisors are considered. No AI is involved.

| Service | Advisor | Email (fictitious) |
| --- | --- | --- |
| `RRHH` (HR) | Carlos Gómez | `carlos.gomez@example.com` |
| `Legal` | María López | `maria.lopez@example.com` |
| `Automatización` (Automation) | Ana Torres | `ana.torres@example.com` |

The service values are stored in Spanish, exactly as the form sends them. Rules live in the `assignment_rules` table, so they can be changed without touching the code. The seed (`npm run db:seed`, run automatically by Compose) loads them idempotently and does not overwrite existing records. If a service has no rule, the lead is saved without an advisor.

## n8n integration

The workflow `n8n/lead-intake-to-slack.workflow.json` receives the form through a webhook, calls the backend and responds to the form according to the actual result. Compose includes an `n8n-init` service that, before n8n starts, creates the local owner account, imports the workflow and publishes it. Whoever clones the repository does not have to import anything manually. On later starts it preserves the existing workflow and configuration. More details in [n8n/README.md](n8n/README.md).

## Slack integration

The Slack node posts a message with company, contact, requested service, email, details and assigned advisor. Slack credentials are stored in n8n's credential manager, never in the repository or the frontend. To enable it:

1. In n8n, assign your Slack credential to the **Send lead notification to Slack** node.
2. Set `LEADFLOW_SLACK_CHANNEL_ID` in `.env`.
3. Recreate n8n: `docker compose up -d --force-recreate n8n`.

If Slack is not configured, the lead is still registered and the form reports that the notification is pending confirmation; the flow does not present it as sent.

## How to run the project

Requirement: Docker Desktop with Docker Compose. From the repository root, in PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Compose starts PostgreSQL, applies migrations and the seed, starts the backend, initializes and starts n8n, and serves the frontend.

| Service | URL |
| --- | --- |
| Form | <http://localhost:5173> |
| CRM (read-only) | <http://localhost:5173/crm> |
| n8n | <http://localhost:5678> |
| Backend health | <http://localhost:3000/health> |

Local n8n credentials (development only, ports bound to `127.0.0.1`): `leadflow@example.com` / `LeadFlow2026!`; you can change them in `.env`. Data persists in the `postgres_data` and `n8n_data` volumes.

```powershell
docker compose down       # stops and keeps the data
docker compose down -v    # also deletes the data (irreversible)
```

## How to run the tests

The backend tests use Node's test runner with `tsx` and do not need a database. From `backend/`:

```powershell
npm ci
npm test
```

They cover lead validation and creation, assignment rules, transactional creation and assignment, persistence error handling, read endpoints and CORS. There are no automated tests for the n8n workflow or the frontend.

## How to run the demo

1. Start the project with Docker Compose and confirm `/health` responds.
2. (Optional) Configure Slack as described above.
3. Open the form, fill in the data and choose a service.
4. Watch the result: lead received, processing and assigned advisor.
5. Show the Slack message, if configured.
6. Open `/crm` and check the lead with its advisor.
7. To show the assignment logic, repeat with the three services and compare the resulting advisor.

## Limitations

- It is a demo, not a CRM: no authentication, users, roles or multi-tenancy.
- The lead status in the CRM is derived from whether it has an assigned advisor; there is no pipeline.
- The `notifications` table exists in the model, but the current flow does not record sends in it.
- There are no automatic retries: if the result is uncertain, the form asks to verify before resubmitting, to avoid duplicate leads.
- The n8n webhook has no authentication or abuse protection.
- Default credentials are for local use only; the configuration must be hardened for any deployment.
- No time savings or business results have been measured.

## Possible future improvements

- Record every send in `notifications` with its status.
- Protect the webhook (for example, with a shared secret).
- Integration tests with PostgreSQL and of the complete flow.
- Lead statuses and basic editing in the CRM.
- Managing assignment rules from the interface.
