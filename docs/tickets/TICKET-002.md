# TICKET-002 — Preparar Docker mínimo y configuración segura v2

- **Estado:** DONE
- **Prioridad:** P0
- **Objetivo:** ejecutar frontend y n8n sin backend ni PostgreSQL de leads.
- **Contexto técnico:** Compose actual tiene postgres, backend, n8n, n8n-init y frontend. El initializer depende del backend y publica el workflow v1. No borrar/reutilizar el volumen existente.
- **Dependencias:** TICKET-001 DONE.
- **Alcance:** Compose v2 solo con frontend/n8n; retirar dependencias/API/DB y auto-publicación del initializer; nuevo volumen aislado; alta owner guiada; ejemplos sin secretos/contraseña predeterminada; usar versión n8n verificada; mantener puertos loopback. Actualizar guía de configuración.
- **Fuera de alcance:** workflow funcional Zoho/Slack, exposición pública, borrar datos/volúmenes v1 y rediseñar UI.
- **Criterios de aceptación:** `docker compose config` válido; arranque saludable; frontend y editor accesibles localmente; no arranca backend/Postgres ni se publica workflow incompleto; reinicio conserva configuración de prueba; volumen v2 distinto; variables documentadas y sin secretos.
- **Casos de prueba:** Compose config; build/arranque; comprobar servicios; crear workflow de prueba y reiniciar; revisar que el volumen v1 no fue alterado y que ejemplos/bundle no contienen secretos.
- **Resultados esperados:** stack mínimo reproducible y persistente, sin inicialización de workflow no configurado.
- **Evidencia de pruebas:** PASS para configuración, build, arranque saludable, accesibilidad, servicios/puertos, volumen aislado, persistencia tras `docker compose down/up` y ausencia de marcadores de secretos; evidencia y límites en [resultados](../testing/test-results.md). Sin integración Zoho/Slack, fuera de este ticket.
- **Notas de implementación:** no usar `docker compose down -v`. Backend puede permanecer en disco hasta TICKET-009; el CRM visual se retira en TICKET-007.
