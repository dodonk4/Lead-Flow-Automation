# n8n in LeadFlow v2

The `feat/zoho-crm` Compose stack runs n8n `2.5.0` at `http://localhost:5678`, bound only to `127.0.0.1`. There is no `n8n-init` service: on first access, create the n8n owner manually in its setup wizard and choose your own password.

Startup does not import or publish workflows. `lead-intake-to-slack.workflow.json` belongs to v1 and depends on the backend; do not activate it as a v2 workflow. Zoho/Slack configuration and a functional workflow will be handled by later tickets.

`leadflow-form-validation.workflow.json` is an inactive TICKET-003 validation artifact. It accepts POST requests at `leadflow-form`, validates and normalizes the form contract, and returns the normalized fields without saving a lead. It has no Zoho/Slack integrations and must not be activated or presented as the final workflow.

`leadflow-zoho-assignment.workflow.json` is the inactive TICKET-004 artifact. It accepts a normalized service at `leadflow-assignment-check`, applies the RRHH/Legal/Automatización mapping in n8n, and queries `users?type=ActiveUsers` before returning an Owner ID. An unmapped service returns HTTP 422; a lookup failure or Owner missing from the active-user response returns an explicit error. It does not save leads or send Slack. Do not connect this check to the frontend or expose it publicly.

To test it, import the export without activating it and select the Zoho OAuth credential in `Verify owner in active Zoho users`. The versioned API base is `https://www.zohoapis.com/crm/v8`, supplied by the account owner. The Owner IDs were provided and the user confirmed they are active/assignable; all three mappings were subsequently verified with a real OAuth lookup. Do not share the complete user list, tokens, or sensitive execution output.

The form sends JSON text as `text/plain` so n8n can pass even malformed JSON to the workflow for a controlled HTTP 400 response; the workflow parses it safely before field validation. A direct caller sending malformed JSON as `application/json` gets n8n's parser-level HTTP 422 before the workflow runs. This transport does not make CORS an anti-abuse control.

## Configuration

The configurable webhook URL compiled into Vite is `VITE_N8N_WEBHOOK_URL`. Its local example is `http://localhost:5678/webhook/leadflow-form`, with no credentials or tokens. Optionally configure it in the repository-root `.env`; rebuild the frontend to apply Vite changes:

```powershell
docker compose up --build --detach
```

No environment variables are needed for passwords, Zoho Owners, or Slack credentials. Add those credentials to n8n's credential manager only when the corresponding workflow is ready; never put them in the frontend, `.env.example`, or workflow exports.

Compose keeps access local, uses HTTP for development, and sets `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`. `N8N_SECURE_COOKIE=false` is needed only for the local HTTP interface. Do not bind ports to a public interface or expose the editor. CORS does not authenticate requests or impose usage limits.

## Persistence

The `leadflow-v2-compose-n8n-data` volume stores n8n configuration, credentials, workflows, and its internal database; it is not lead storage. Data survives restarts and is separate from the v1 `n8n_data` volume. `docker compose down` preserves configuration; do not use `docker compose down -v` or delete volumes as cleanup.

See the [setup guide](../docs/setup.md) to start the stack and back up its data.
