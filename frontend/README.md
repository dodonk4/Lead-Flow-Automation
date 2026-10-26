# LeadFlow frontend

Minimal React + Vite frontend with a lead submission form that posts to a configurable n8n webhook. It has no CRM view or backend API calls; `/crm` displays the same form.

## Run locally

```sh
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Set `VITE_N8N_WEBHOOK_URL` to the URL of the configured n8n workflow. The local demo example is `http://localhost:5678/webhook/leadflow-form`. Vite embeds this URL in the frontend bundle, so it must not contain tokens or credentials. Do not put secrets in `VITE_*` variables.

The webhook URL is configured at build time through `VITE_N8N_WEBHOOK_URL`. The frontend does not store leads or call private backend endpoints.

The form sends JSON as `text/plain` so n8n can also handle malformed JSON. It accepts `201` (`created`) and `200` (`updated`) responses only when Zoho confirms persistence; Slack `failed` and `unconfirmed` states are shown as saved with a rejected or pending notification. Validation errors are actionable; on timeout, network failure, invalid response, or uncertain Zoho result, the form preserves its values and asks the submitter to verify before resending.

The budget is sent as informational text in `details`; the frontend does not validate its currency.

The v2 workflow returns `persistence.status=saved`, `operation=created|updated`, a string ID, and `notification.status=sent|failed|unconfirmed`. The UI does not display the ID or Zoho user metadata. Confirmed validation or persistence errors are distinguished from uncertain responses; the frontend does not automatically retry.

Configure the n8n Webhook node's allowed origins for the frontend origin you deploy (for example, `http://localhost:5173` during development). Avoid a wildcard origin in production.
