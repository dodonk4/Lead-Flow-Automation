# TICKET-005 — Persistir Leads mediante upsert por email

- **Estado:** BLOCKED
- **Prioridad:** P0
- **Objetivo:** crear o actualizar el Lead por email y asignar el Owner real.
- **Contexto técnico:** v1 siempre crea y no impone unicidad de email. Zoho ofrece upsert, pero un HTTP exitoso puede contener error por registro.
- **Dependencias:** TICKET-004 DONE.
- **Alcance:** mapping verificado, upsert nativo (o HTTP autenticado justificado), duplicate check Email, Owner.id, verificar resultado por registro/ID/acción y controlar errores/reconciliación. Slack todavía no se integra; mantener workflow no publicado como definitivo.
- **Fuera de alcance:** Slack, almacenamiento idempotente propio, migración de leads y limpieza automática de duplicados históricos.
- **Criterios de aceptación:** email nuevo crea; repetido mantiene ID y actualiza; Owner se recalcula; solo campos administrados cambian; details vacío/ausente no borra Description; error individual no se declara éxito; IDs permanecen strings; timeout resulta unknown y no provoca Create ciego; duplicados ambiguos se escalan.
- **Casos de prueba:** nuevo y lectura en Zoho; upsert mismo email con cambios; reasignación RRHH→Legal; detalles omitidos/vacíos; email con mayúsculas; Owner desactivado; OAuth/permiso/conexión; 2xx con error individual; timeout tras guardado y reenvío; dos solicitudes simultáneas.
- **Resultados esperados:** un registro para reintento secuencial, Owner y campos correctos; límites de concurrencia e incertidumbre documentados sin prometer exactly-once.
- **Evidencia de pruebas (2026-10-23):** no se inició la implementación ni se ejecutaron los casos de upsert. La dependencia TICKET-004 permanece BLOCKED. Su evidencia confirma las consultas autenticadas de los tres Owners y el rechazo de `Otro`, pero deja pendientes Owner desconocido/inactivo, error de permisos OAuth y cambio del mapping durante una ejecución. No se realizaron escrituras en Zoho como parte de esta ejecución.
- **Resultados de esta ejecución:** rama `feat/zoho-crm` verificada; TICKET-001 y TICKET-003 figuran DONE, pero TICKET-004 no cumple el estado requerido DONE. Los casos de este ticket (create, update por el mismo email, reasignación, preservación de Description/campos, mayúsculas, Owner no válido, errores OAuth/permisos/conexión, respuesta 2xx con error individual, timeout/reenvío y solicitudes simultáneas) quedan NOT_RUN. Detalle en [resultados de pruebas](../testing/test-results.md).
- **Notas de implementación:** ticket bloqueado antes de cambios por dependencia incompleta. Para desbloquear, completar los casos pendientes y marcar TICKET-004 DONE con evidencia; luego verificar capacidades y ejecutar el upsert con cuenta autorizada, sin dar por exitosos resultados por registro solo por el HTTP 2xx. Revisar automatizaciones Zoho que reasignen/notifiquen. Reconciliar por email tras timeout; no sobrescribir estado comercial ni otros campos. No se inició el siguiente ticket.
