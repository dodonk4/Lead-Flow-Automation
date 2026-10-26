# Frontend de LeadFlow

Formulario mínimo en React + Vite para enviar leads al webhook configurable de n8n. Conserva los valores si hay errores y distingue el guardado confirmado en Zoho del resultado de entrega en Slack. No almacena leads ni credenciales de integración.

## Ejecución local

```powershell
npm ci
Copy-Item ..\.env.example .env
npm run dev
```

Configura `VITE_N8N_WEBHOOK_URL` con la URL del webhook. Vite la incrusta en el build: debe ser pública y nunca contener tokens o credenciales. El ejemplo del repositorio apunta a `http://localhost:5678/webhook/leadflow-form`.

El formulario envía JSON como `text/plain` para que el workflow pueda responder de forma controlada ante JSON malformado. Una respuesta exitosa requiere persistencia confirmada; Slack `failed` o `unconfirmed` se muestra como un problema de notificación, sin afirmar que falló el guardado. Timeout, error de red, respuesta malformada y persistencia incierta conservan los valores y requieren reconciliar antes de reenviar. No hay reintentos automáticos.

Compilación:

```powershell
npm run build
```

Consulta la [arquitectura](../docs/architecture.md), el [plan de pruebas](../docs/testing/test-plan.md), los [resultados](../docs/testing/test-results.md) y el [índice de tickets](../docs/tickets/README.md).
