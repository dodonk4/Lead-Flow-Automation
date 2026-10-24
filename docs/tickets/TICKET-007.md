# TICKET-007 — Adaptar formulario y retirar CRM visual

- **Estado:** TODO
- **Prioridad:** P1
- **Objetivo:** conservar formulario y mostrar estados compatibles con el contrato v2; eliminar vista CRM simulada.
- **Contexto técnico:** `App.tsx` ya llama al webhook, pero sus tipos y estados modelan la respuesta del backend y `slack-failed` 502. `/crm` usa `VITE_API_BASE_URL`.
- **Dependencias:** TICKET-006 DONE.
- **Alcance:** actualizar tipos/validación/mensajes para created, updated, Slack pendiente, 4xx, configuración y resultado incierto; impedir doble submit; retirar navegación/import CRM y variable API, `CrmPage` y `crm.css`; `/crm` no debe mostrar un CRM.
- **Fuera de alcance:** rediseño, dashboard, OAuth en navegador, almacenamiento local y backend.
- **Criterios de aceptación:** estados loading/success/error accesibles; Slack fallido informa guardado; timeout/respuesta corrupta queda incierta sin reintento; conserva valores ante fallo; build pasa; no backend, token o persistencia en bundle; webhook configurado al build.
- **Casos de prueba:** respuestas 201/200; Slack failed/unconfirmed con guardado; 400, 422, 503; timeout/red/JSON corrupto; doble submit; ruta `/crm`; inspección Network/bundle sin llamadas API privadas.
- **Resultados esperados:** experiencia clara y coherente con persistencia real, sin vista CRM.
- **Evidencia de pruebas:** PENDIENTE; `npm run build` en frontend y capturas/casos navegador reales.
- **Notas de implementación:** no mostrar email/metadata privada del usuario Zoho. El presupuesto permanece informativo; no afirmar validación de moneda.
