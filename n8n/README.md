# LeadFlow form-to-Slack workflow

The repository-root Docker Compose configuration includes an `n8n-init` one-shot service that runs automatically before the main n8n service. On a fresh volume it imports the workflow and publishes it. The main n8n service starts only after initialization succeeds. On later starts, the init service detects the existing workflow and leaves it and its credentials/configuration untouched.

No account is created automatically: the first time you open `http://localhost:5678`, n8n asks you to register the local owner account.

To change an already imported workflow, edit it in the n8n interface. This avoids replacing the Slack credential selection when n8n restarts.

## Configuration

Set these environment variables on the n8n process/container:

```env
LEADFLOW_API_URL=http://host.docker.internal:3000/api/leads
LEADFLOW_SLACK_CHANNEL_ID=REPLACE_WITH_SLACK_CHANNEL_ID
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

`LEADFLOW_API_URL` is the existing backend endpoint, including `/api/leads`. If n8n and the backend run on the same Docker network, use the backend service name instead (for example, `http://backend:3000/api/leads`). `host.docker.internal` is suitable for reaching a host-run backend from Docker Desktop; adjust it for other deployments.

`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` is required for the workflow expressions to read the two non-secret configuration values. This also allows expressions and Code nodes to read the n8n process environment, so only use it when workflow editors are trusted. Do not put credentials or tokens in these variables; store Slack credentials in n8n's credential manager. After importing, open **Send lead notification to Slack** and select the configured credential in the node's credential field. Replace the example channel ID with the Slack channel ID.

When running with Docker Compose from the repository root, these values are provided by `docker-compose.yml`; the API URL is `http://backend:3000/api/leads` on the internal Compose network. The frontend is published on `http://localhost:5173` and calls the webhook at `http://localhost:5678/webhook/leadflow-form`. The exported Webhook node allows `http://localhost:5173`; if the frontend is hosted on another origin, update the node's **Allowed Origins (CORS)** option to that exact origin.

Restart n8n after changing its environment. Then activate the workflow and use the production webhook URL displayed by **Receive lead form**. Submit a JSON `POST` whose body uses the backend's existing fields:

```json
{
  "companyName": "Acme Inc.",
  "contactName": "Alex Example",
  "email": "alex@example.com",
  "serviceRequested": "Automation",
  "details": "Optional details"
}
```

The workflow passes the webhook body unchanged to `POST /api/leads`; validation and advisor assignment remain in the backend. The API responds with `{ "data": { ...lead fields... } }`. When the lead is assigned, `data.assignedAdvisor` contains the advisor's `id`, `name` and `email`, and Slack shows the advisor's name (falling back to the ID if it were missing).

## Outcomes and errors

- `201` and `notification.status: "sent"`: the API returned the created lead and n8n's Slack node confirmed the send.
- `201` and `notification.status: "skipped"`: the API created the lead but returned no assigned advisor, so the workflow did not send a Slack message.
- `502` with `slack_delivery_unconfirmed`: the API created the lead, but the Slack node did not confirm delivery. Inspect the failed node and n8n execution before retrying; this workflow does not retry Slack automatically.
- `502` with `leadflow_api_request_unconfirmed`: the API request failed or timed out. The outcome may be unknown if the connection failed after the backend committed the lead. Inspect the execution and verify whether the lead exists before resubmitting to avoid creating a duplicate.

No credentials are embedded in the exported workflow. Slack failures and backend-call failures are routed to explicit webhook responses; they are never represented as successful completion.
