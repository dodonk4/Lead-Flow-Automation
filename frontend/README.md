# LeadFlow frontend

Minimal React + Vite frontend with a lead submission form and a read-only CRM view. The form submits through the configured n8n webhook; `/crm` reads real lead records from the backend.

## Run locally

```sh
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_N8N_WEBHOOK_URL` to the active n8n production webhook URL for the `leadflow-form` path. For local n8n this is typically `http://localhost:5678/webhook/leadflow-form`. Vite embeds this URL in the frontend bundle, so it must be a public, non-secret URL. Do not put tokens or credentials in `VITE_*` variables.

Set `VITE_API_BASE_URL` to the backend API base URL (for example, `http://localhost:3000/api`) to use the CRM page at `/crm`. The backend must be running and its `FRONTEND_ORIGIN` must match the frontend origin, normally `http://localhost:5173`.

The CRM view uses `GET /api/leads` and `GET /api/leads/:id`. Its status label is derived from whether the lead has an assigned advisor; it is not stored as a separate lead status.

The n8n workflow currently returns `201` with `{ data: lead, notification: { status: "sent" | "skipped" } }` when the flow completes. The lead includes `assignedAdvisorId` and, when assigned, `assignedAdvisor` (`id`, `name`, `email`); the form shows the advisor's name. A Slack delivery error returns `502` with `error: "slack_delivery_unconfirmed"` and `leadId`, which the UI reports as a registered lead with an unconfirmed notification. An API call error returns `502` with `error: "leadflow_api_request_unconfirmed"`; because the result may be ambiguous, the UI warns against blindly resubmitting.

The backend schema has no separate budget field. The form therefore puts `Presupuesto estimado: <amount>` in the existing `details` field so the unchanged n8n workflow can pass it through to the backend and include it in the Slack details. The UI leaves the currency unspecified and indicates that the amount uses the submitter's currency.

Configure the n8n Webhook node's allowed origins for the frontend origin you deploy (for example, `http://localhost:5173` during development). Avoid a wildcard origin in production.
