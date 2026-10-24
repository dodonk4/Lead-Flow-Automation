# Tablero de tickets — LeadFlow v2

TICKET-001 está **DONE** por confirmación del usuario de que los casos pasaron. A petición del usuario, no se retuvieron entonces los detalles de metadata, mapping ni IDs; esa limitación afecta la reproducibilidad. Los Owner IDs de TICKET-004 se proporcionaron después y el usuario confirmó que están activos/asignables; las tres reglas se verificaron posteriormente mediante consulta OAuth real. No se inició el siguiente ticket.

| Orden | Ticket | Estado | Prioridad | Dependencias |
|---:|---|---|---|---|
| 1 | [TICKET-001 — Verificar Zoho, usuarios y contrato](TICKET-001.md) | DONE | P0 | — |
| 2 | [TICKET-002 — Docker mínimo y configuración segura](TICKET-002.md) | DONE | P0 | 001 |
| 3 | [TICKET-003 — Validación y normalización n8n](TICKET-003.md) | DONE | P0 | 001, 002 |
| 4 | [TICKET-004 — Reglas y propietarios Zoho](TICKET-004.md) | DONE | P0 | 001, 003 |
| 5 | [TICKET-005 — Upsert de Leads por email](TICKET-005.md) | BLOCKED | P0 | 004 |
| 6 | [TICKET-006 — Slack y respuestas honestas](TICKET-006.md) | TODO | P0 | 005 |
| 7 | [TICKET-007 — Formulario y retiro del CRM visual](TICKET-007.md) | TODO | P1 | 006 |
| 8 | [TICKET-008 — Seguridad y privacidad](TICKET-008.md) | TODO | P1 | 002, 006, 007 |
| 9 | [TICKET-009 — Retirar backend y guías v1 de esta rama](TICKET-009.md) | TODO | P1 | 007, 008 |
| 10 | [TICKET-010 — Validación integral y reproducibilidad](TICKET-010.md) | TODO | P1 | 009 |

Orden recomendado: 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010. TICKET-004 se cerró con autorización del usuario y dos pruebas externas documentadas como NOT_RUN. No iniciar el siguiente ticket sin autorización expresa.

## Reglas de seguimiento

- Antes de implementar, comprobar rama, leer `AGENTS.md`, este tablero y el ticket autorizado; verificar dependencias DONE con evidencia.
- Ejecutar un solo ticket por autorización. Marcar IN_PROGRESS antes del trabajo. Al terminar registrar pruebas reales y actualizar ticket/tablero/documentación.
- DONE requiere criterios de aceptación cumplidos y resultados verificables. No afirmar pruebas no ejecutadas; distinguir simulación de integración real.
- Si falta una cuenta, credencial, permiso, usuario o dato externo, marcar BLOCKED y documentar requisito y forma de desbloqueo.
- Consultar [plan de pruebas](../testing/test-plan.md) y [resultados](../testing/test-results.md). Nunca guardar secretos o evidencia sensible.

## Prioridades

- **P0:** bloquea el flujo empresarial funcional.
- **P1:** necesario para una demo segura, coherente y reproducible.
