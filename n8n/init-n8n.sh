#!/bin/sh
set -eu

n8n start >/tmp/n8n-init.log 2>&1 &
n8n_pid=$!

stop_n8n() {
  kill "$n8n_pid" 2>/dev/null || true
  wait "$n8n_pid" 2>/dev/null || true
}

show_startup_error() {
  cat /tmp/n8n-init.log
  stop_n8n
  exit 1
}

attempt=0
until node -e "fetch('http://127.0.0.1:5678/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; do
  if ! kill -0 "$n8n_pid" 2>/dev/null; then
    show_startup_error
  fi

  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    echo "n8n did not become healthy in time."
    show_startup_error
  fi

  sleep 2
done

if ! node --input-type=module -e '
const endpoint = "http://127.0.0.1:5678/rest/owner/setup";
const body = JSON.stringify({
  email: process.env.N8N_OWNER_EMAIL,
  firstName: "LeadFlow",
  lastName: "Demo",
  password: process.env.N8N_OWNER_PASSWORD,
});
let response;
let responseBody;

for (let attempt = 0; attempt < 30; attempt += 1) {
  response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  const contentType = response.headers.get("content-type") ?? "";
  responseBody = await response.text();

  if (contentType.includes("application/json")) break;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

if (!response?.headers.get("content-type")?.includes("application/json")) {
  console.error(
    "n8n owner setup endpoint did not return JSON:",
    response?.status,
    responseBody?.slice(0, 300),
  );
  process.exit(1);
}

const result = JSON.parse(responseBody);
if (response.ok) {
  console.log("Created the local n8n owner account.");
} else if (
  response.status === 400 &&
  result.message === "Instance owner already setup"
) {
  console.log("The n8n owner account is already configured.");
} else {
  console.error("Could not initialize the n8n owner account:", result);
  process.exit(1);
}
'; then
  show_startup_error
fi

stop_n8n

workflow_id=leadflow-form-slack

if n8n list:workflow --onlyId | grep -Fxq "$workflow_id"; then
  if n8n list:workflow --active=true --onlyId | grep -Fxq "$workflow_id"; then
    echo "LeadFlow workflow is already installed and published; preserving its n8n configuration."
  else
    n8n publish:workflow --id="$workflow_id"
  fi
else
  n8n import:workflow --input=/data/lead-intake-to-slack.workflow.json
  n8n publish:workflow --id="$workflow_id"
fi
