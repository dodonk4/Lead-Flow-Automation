# n8n in LeadFlow v2

The v2 Compose stack runs n8n locally at <http://localhost:5678>. Create the owner account manually on first access. Compose does not import or activate workflows; inspect, configure, test, and enable a workflow deliberately.

## Versioned workflows

- `leadflow-form-validation.workflow.json`: isolated contract-validation test artifact; no Zoho or Slack writes.
- `leadflow-zoho-assignment.workflow.json`: inactive Owner lookup test.
- `leadflow-zoho-upsert.workflow.json`: inactive Zoho Leads upsert candidate.
- `leadflow-zoho-slack.workflow.json`: inactive candidate that notifies only after confirmed Zoho persistence.
- `leadflow-zoho-qualification.workflow.json`: manual account-qualification tests; the default case reads field metadata.

These artifacts are not automatically imported or published. Their test scope, observed results, and remaining limitations are recorded in the [test results](../docs/testing/test-results.md). The `main` branch retains v1; this branch contains the v2 workflow set.

## Credentials and safety

Store Zoho and Slack credentials only in n8n's credential manager. After manual import, select the correct credentials and a verified test channel; never add credentials, channel IDs, live user lists, or sensitive execution data to workflow exports or frontend configuration.

The frontend webhook is configured at build time with `VITE_N8N_WEBHOOK_URL`; it must not contain secrets. Compose binds services to loopback and keeps n8n data in a separate v2 volume. Do not expose the editor or webhook publicly: CORS does not authenticate direct clients, and no effective rate limit has been verified. Do not use `docker compose down -v` to stop the demo.

The form sends JSON as `text/plain` for controlled malformed-JSON handling. A timeout or transport failure does not prove whether Zoho saved a record. Reconcile before resubmitting. If Slack fails after a confirmed save, repair only the missing notification; do not rerun the full upsert.

See [setup](../docs/setup.md), [architecture](../docs/architecture.md), [test plan](../docs/testing/test-plan.md), [test results](../docs/testing/test-results.md), and the [ticket index](../docs/tickets/README.md).
