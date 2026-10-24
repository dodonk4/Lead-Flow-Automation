# TICKET-006 — Notificar Slack y devolver respuestas honestas

- **Estado:** TODO
- **Prioridad:** P0
- **Objetivo:** notificar solo después de confirmar el guardado y distinguir persistencia de entrega.
- **Contexto técnico:** workflow v1 devuelve 502 por fallo Slack aunque el backend ya guardó.
- **Dependencias:** TICKET-005 DONE; cuenta/canal Slack de prueba accesibles.
- **Alcance:** mensaje con empresa, contacto, servicio, detalles relevantes, asesor y tipo de operación; estados sent/failed/unconfirmed; respuesta final en todas las rutas; procedimiento de reparar solo la notificación.
- **Fuera de alcance:** DMs, bot, colas, exactly-once y reintento automático de timeout.
- **Criterios de aceptación:** Zoho fallido no produce mensaje; cada ruta responde una sola vez; Slack confirmado produce sent; Slack falla/timeout mantiene HTTP 201/200 y persistence=saved con advertencia; actualización se etiqueta; no reejecutar upsert para reparar Slack.
- **Casos de prueba:** alta y actualización con aviso; canal inválido/permisos; timeout Slack después de Zoho; rechazo Zoho y verificar cero Slack; reintento de email y documentar avisos repetidos; details con contenido tipo `@channel` no provoca mención masiva.
- **Resultados esperados:** el cliente no confunde fallo de Slack con fallo de registro; mensaje incluye datos exigidos.
- **Evidencia de pruebas:** PENDIENTE; JSON, lectura Zoho y Slack sanitizados.
- **Notas de implementación:** credenciales solo en n8n. Escapar contenido controlado por usuario según capacidades reales del nodo. Actualizar contrato/setup.
