# Decisiones arquitectónicas

Decisiones propuestas para LeadFlow v2 en `feat/zoho-crm`. Las que dependen de cuenta externa permanecen pendientes hasta verificarse en TICKET-001. No describen comportamiento ya implementado.

1. **Dos implementaciones por rama.** `main` conserva v1; `feat/zoho-crm` contiene v2. No mergear ni migrar datos como parte de la planificación.
2. **Zoho como registro único.** Evita mantener backend, ORM y base de leads redundantes; permite demostrar integración SaaS real.
3. **n8n asume validación y reglas simples.** Cambio deliberado de responsabilidad respecto a v1; evita repartir la lógica del flujo entre backend y workflow.
4. **Nodos nativos primero, con fallback sujeto a prueba.** En la imagen local n8n 2.5.0, la inspección estática confirma Zoho Lead `Get Fields` y `Create or Update`, pero no expone Owner/`duplicate_check_fields` y reduce la respuesta sin `action`. HTTP Request con credencial OAuth es el candidato para esos campos/resultados; la llamada real y credencial aún requieren validación en TICKET-001. No introducir Code sin justificación.
5. **Upsert por email.** Reduce nuevos registros ante reintentos; no elimina duplicados históricos ni garantiza exactamente una notificación. Verificar soporte real y el resultado por registro.
6. **Sin regla equivale a rechazo 422.** Evita guardar un lead sin propietario real o que Zoho asigne uno implícito. Es un cambio explícito frente a v1.
7. **Owner real activo obligatorio.** La propiedad es `Owner.id`, no un campo de texto. IDs y permisos se obtienen de la cuenta; los asesores ficticios del seed no prueban que existan usuarios.
8. **Reasignar en cada actualización.** La regla del servicio prevalece sobre cambios manuales; actualizar solo campos controlados por el formulario. Hacer visible esta decisión en pruebas.
9. **Slack se envía después del guardado.** Cada upsert confirmado genera aviso etiquetado como creado/actualizado. Reintentos pueden repetir avisos; exactly-once y cola de reintentos quedan fuera.
10. **Persistencia y notificación son resultados independientes.** Slack fallido no convierte en fallido un guardado confirmado. Timeout de Zoho representa incertidumbre, no rechazo automático.
11. **Nombre completo en Last_Name.** Preserva el dato sin inferir partición de nombres; comprobar límite y presentación en la organización.
12. **SQLite interno de n8n y volumen v2 separado.** Es infraestructura para n8n, no fuente de leads. Compose usa `leadflow-v2-compose-n8n-data`; no reutilizar ni eliminar el volumen v1 automáticamente.
13. **Demo local por defecto.** CORS no es control antiabuso; despliegue público queda pendiente de HTTPS, rate limit efectivo y protección del editor.
14. **Configuración externa guiada y publicación explícita.** La cuenta owner se crea manualmente en el editor; OAuth, credenciales y usuarios reales requieren intervención. No se incluye initializer ni autoimportación/publicación de workflows.
