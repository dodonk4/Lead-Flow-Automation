# LeadFlow frontend

Minimal React + Vite form for submitting leads through the n8n workflow. The frontend calls only the configured n8n webhook; it never calls the backend directly.

## Run locally

```sh
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_N8N_WEBHOOK_URL` to the active n8n production webhook URL for the `leadflow-form` path. For local n8n this is typically `http://localhost:5678/webhook/leadflow-form`. Vite embeds this URL in the frontend bundle, so it must be a public, non-secret URL. Do not put tokens or credentials in `VITE_*` variables.

The n8n workflow currently returns `201` with `{ data: lead, notification: { status: "sent" | "skipped" } }` when the flow completes. The lead includes `assignedAdvisorId`; the backend response does not include an advisor name. A Slack delivery error returns `502` with `error: "slack_delivery_unconfirmed"` and `leadId`, which the UI reports as a registered lead with an unconfirmed notification. An API call error returns `502` with `error: "leadflow_api_request_unconfirmed"`; because the result may be ambiguous, the UI warns against blindly resubmitting.

The backend schema has no separate budget field. The form therefore puts `Presupuesto estimado: <amount>` in the existing `details` field so the unchanged n8n workflow can pass it through to the backend and include it in the Slack details. The UI leaves the currency unspecified and indicates that the amount uses the submitter's currency.

Configure the n8n Webhook node's allowed origins for the frontend origin you deploy (for example, `http://localhost:5173` during development). Avoid a wildcard origin in production.
