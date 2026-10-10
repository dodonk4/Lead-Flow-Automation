# LeadFlow frontend

Frontend mínimo en React + Vite con un formulario de envío de leads y una vista de CRM de solo lectura. El formulario envía a través del webhook de n8n configurado; `/crm` lee los leads reales del backend.

## Ejecutar en local

```sh
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Define `VITE_N8N_WEBHOOK_URL` con la URL del webhook de producción activo de n8n para la ruta `leadflow-form`. En un n8n local suele ser `http://localhost:5678/webhook/leadflow-form`. Vite incrusta esta URL en el bundle del frontend, por lo que debe ser una URL pública y no secreta. No pongas tokens ni credenciales en variables `VITE_*`.

Define `VITE_API_BASE_URL` con la URL base de la API del backend (por ejemplo, `http://localhost:3000/api`) para usar la página de CRM en `/crm`. El backend debe estar en ejecución y su `FRONTEND_ORIGIN` debe coincidir con el origen del frontend, normalmente `http://localhost:5173`.

La vista de CRM usa `GET /api/leads` y `GET /api/leads/:id`. Su etiqueta de estado se deriva de si el lead tiene un asesor asignado; no se guarda como un estado separado del lead.

El workflow de n8n devuelve actualmente `201` con `{ data: lead, notification: { status: "sent" | "skipped" } }` cuando el flujo termina. El lead incluye `assignedAdvisorId` y, cuando está asignado, `assignedAdvisor` (`id`, `name`, `email`); el formulario muestra el nombre del asesor. Un error de entrega de Slack devuelve `502` con `error: "slack_delivery_unconfirmed"` y `leadId`, que la interfaz informa como lead registrado con notificación sin confirmar. Un error en la llamada a la API devuelve `502` con `error: "leadflow_api_request_unconfirmed"`; como el resultado puede ser ambiguo, la interfaz advierte contra reenviar sin verificar.

El esquema del backend no tiene un campo de presupuesto separado. Por eso el formulario coloca `Presupuesto estimado: <monto>` en el campo `details` existente, para que el workflow de n8n sin cambios lo pase al backend y lo incluya en los detalles de Slack. La interfaz deja la moneda sin especificar e indica que el monto usa la moneda de quien lo envía.

Configura los orígenes permitidos del nodo Webhook de n8n para el origen del frontend que despliegues (por ejemplo, `http://localhost:5173` en desarrollo). Evita un origen comodín en producción.
