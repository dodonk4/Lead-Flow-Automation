# LeadFlow frontend

Frontend mínimo en React + Vite con un formulario de envío de leads al webhook configurable de n8n. No incluye una vista CRM ni consulta el backend; la ruta `/crm` muestra el mismo formulario.

## Ejecutar en local

```sh
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Define `VITE_N8N_WEBHOOK_URL` con la URL del webhook de n8n que corresponda al flujo configurado. En la demo local el ejemplo es `http://localhost:5678/webhook/leadflow-form`. Vite incrusta esta URL en el bundle del frontend, por lo que no debe contener tokens ni credenciales. No pongas secretos en variables `VITE_*`.

La URL del webhook se configura al compilar (`VITE_N8N_WEBHOOK_URL`). El frontend no guarda leads ni llama a endpoints privados del backend.

El formulario envía JSON como `text/plain` para que n8n gestione también el JSON malformado. Acepta respuestas `201` (`created`) y `200` (`updated`) cuando Zoho confirma el guardado; los estados Slack `failed` y `unconfirmed` se muestran como guardado confirmado con aviso pendiente o rechazado. Los errores de validación se presentan como corregibles; ante timeout, red, respuesta inválida o resultado Zoho incierto, la interfaz conserva los valores y recomienda verificar antes de reenviar.

El presupuesto se envía como texto informativo dentro de `details`; no se valida moneda.

El workflow v2 devuelve `persistence.status=saved`, `operation=created|updated`, un ID string y `notification.status=sent|failed|unconfirmed`. La interfaz no muestra el ID ni metadatos del usuario Zoho. Los errores confirmados de validación o persistencia se distinguen de respuestas inciertas; no se reintenta automáticamente.

Configura los orígenes permitidos del nodo Webhook de n8n para el origen del frontend que despliegues (por ejemplo, `http://localhost:5173` en desarrollo). Evita un origen comodín en producción.
