# TICKET-010 — Validar demo integral y reproducibilidad

- **Estado:** TODO
- **Prioridad:** P1
- **Objetivo:** demostrar el flujo completo y que otra persona puede configurar la demo con documentación reproducible.
- **Contexto técnico:** tests de nodos aislados no prueban el vínculo entre HTTP, Owner real, Zoho, Slack y UI.
- **Dependencias:** TICKET-009 y todos los tickets anteriores DONE.
- **Alcance:** ejecutar matriz completa de `docs/testing/test-plan.md` con cuenta/canal de prueba; probar instalación/import inactivo, configuración, publicación explícita y reinicio con volumen v2 aislado; registrar evidencia y límites; corregir defectos necesarios para criterios sin ampliar funcionalidad.
- **Fuera de alcance:** producción pública, carga/benchmark comercial y garantías exactly-once.
- **Criterios de aceptación:** cada escenario requerido ejecutado con resultados reales; comprobar ID/cantidad/Owner/HTTP/Slack/UI; instalación reproducible sin API propia; export sin secretos; fallos corregidos. Si no hay cuentas, BLOCKED, no DONE parcial.
- **Casos de prueba:** TP-01 a TP-16 del plan; importación limpia permanece inactiva; reinicio conserva workflows/credenciales; repetir setup no publica workflow antiguo ni altera volumen v1.
- **Resultados esperados:** flujo integral verificable y límites publicados honestamente.
- **Evidencia de pruebas:** PENDIENTE; versiones, pasos, inputs sintéticos, observaciones, ejecución y capturas anonimizadas.
- **Notas de implementación:** usar datos sintéticos únicos. No eliminar registros de prueba ni limpiar datos sin autorización explícita.
