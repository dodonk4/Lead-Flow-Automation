# LeadFlow frontend

Minimal React + Vite form for submitting leads to the configured n8n webhook. The form keeps entered values after errors and distinguishes confirmed Zoho persistence from Slack delivery status. It does not store leads or integration credentials.

## Run locally

```powershell
npm ci
Copy-Item ..\.env.example .env
npm run dev
```

Set `VITE_N8N_WEBHOOK_URL` to the webhook URL. Vite embeds it in the build, so the value must be public and must never contain a token or credential. The repository example targets `http://localhost:5678/webhook/leadflow-form`.

The form sends JSON as `text/plain` so the workflow can return a controlled response for malformed JSON. A successful response requires confirmed persistence; Slack `failed` or `unconfirmed` is reported as a notification issue without claiming that the saved lead failed. Timeout, network failure, malformed response, and uncertain persistence preserve the form values and require reconciliation before resubmission. There is no automatic retry.

Build:

```powershell
npm run build
```

See the [architecture](../docs/architecture.md), [test plan](../docs/testing/test-plan.md), [test results](../docs/testing/test-results.md), and [ticket index](../docs/tickets/README.md).
