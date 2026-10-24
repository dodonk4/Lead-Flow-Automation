# TICKET-008 — Verificar seguridad y privacidad

- **Estado:** TODO
- **Prioridad:** P1
- **Objetivo:** revisar exposición del webhook, credenciales, ejecución y retención dentro del alcance de demo local.
- **Contexto técnico:** CORS solo limita navegadores; configuración v1 permite acceso a variables de entorno en nodos y la retención n8n aún no se ha revisado.
- **Dependencias:** TICKET-002, TICKET-006 y TICKET-007 DONE.
- **Alcance:** revisar exports, ejemplos, bundle, CORS/OPTIONS, tamaño/longitudes, retención de ejecuciones y PII, protección del editor, acceso al entorno y checklist de condiciones para despliegue público.
- **Fuera de alcance:** WAF externo, CAPTCHA SaaS, autenticación de usuarios, Redis y garantías antiabuso distribuidas.
- **Criterios de aceptación:** secretos ausentes de Git/export/bundle/logs; CORS coincide con origen esperado; payload excesivo no alcanza Zoho/Slack; retención configurada y verificada; puertos/editor protegidos localmente; no afirmar rate limit inexistente. Exposición pública bloqueada hasta controles efectivos.
- **Casos de prueba:** OPTIONS/POST desde origen permitido y no permitido; petición directa sin Origin para evidenciar límites CORS; exceso de cuerpo; ráfaga controlada sin asumir rate limit; revisión de secretos/logs; comprobar retención sin borrar evidencia o datos ajenos.
- **Resultados esperados:** controles documentados con límites explícitos; evidencia sin PII sensible.
- **Evidencia de pruebas:** PENDIENTE; headers/opciones por versión y pruebas controladas en test-results.
- **Notas de implementación:** un secreto en frontend no protege el webhook. Honeypot no es limitador de tasa. Demo pública queda fuera hasta autorización y verificación.
