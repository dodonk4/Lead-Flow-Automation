# TICKET-003 — Recibir, validar y normalizar el formulario en n8n

- **Estado:** DONE
- **Prioridad:** P0
- **Objetivo:** validar el contrato en el límite n8n antes de cualquier integración.
- **Contexto técnico:** el formulario envía el JSON como texto `text/plain` para que n8n gestione sintaxis malformada dentro del workflow. Mantener POST `leadflow-form`, nombres de campos existentes y CORS local exacto.
- **Dependencias:** TICKET-001 y TICKET-002 DONE.
- **Alcance:** export de workflow inicialmente inactivo; validar JSON/objeto, tipos, claves, requeridos, email y longitudes verificadas; trim y email minúsculas; límite de details; errores 400 comprensibles por campo usando nodos estándar.
- **Fuera de alcance:** Zoho, asignación, Slack y cualquier respuesta que afirme persistencia.
- **Criterios de aceptación:** entradas válidas emiten contrato normalizado; entradas inválidas enviadas como JSON `text/plain` terminan antes de integraciones con 400; export sin credenciales ni datos fijados; ningún camino devuelve estado saved; workflow de validación no se publica como flujo final.
- **Casos de prueba:** JSON malformado como `text/plain`, objeto/array; espacios y mayúsculas se normalizan; cada obligatorio ausente/vacío/solo espacios rechaza; email inválido/tipo incorrecto rechaza; clave extra y longitud mayor rechazan; details ausente/nulo acepta; límite exacto acepta.
- **Resultados esperados:** respuestas determinísticas y sin stack/details internos.
- **Evidencia de pruebas:** PASS con entradas HTTP sintéticas, build frontend y export importado en n8n 2.5.0; detalle en [resultados](../testing/test-results.md).
- **Notas de implementación:** un servicio desconocido debe llegar a TICKET-004 para responder 422; no convertir presupuesto textual en validación monetaria no existente. `details` se limita a 10.000 caracteres como regla de aplicación, no como límite atribuido a Zoho. n8n devuelve 422 antes del workflow cuando recibe JSON malformado como `application/json`; el formulario usa `text/plain` para procesar el error dentro del workflow y devolver 400. CORS se mantiene como header local, no como protección contra llamadas directas.
