# TICKET-009 — Retirar backend y documentación v1 de esta rama

- **Estado:** TODO
- **Prioridad:** P1
- **Objetivo:** dejar `feat/zoho-crm` coherente con la arquitectura v2 después de migrar el flujo.
- **Contexto técnico:** `backend/` contiene Express/Prisma/PostgreSQL/tests; READMEs y archivos n8n existentes explican el flujo v1.
- **Dependencias:** TICKET-007 y TICKET-008 DONE.
- **Alcance:** retirar `backend/` y artefactos v1 de esta rama tras revisar cambios; actualizar READMEs inglés/español y guías frontend/n8n; quitar referencias operativas API/DB/CRM simulado y enlazar docs/tickets/testing. Aclarar que `main` conserva v1.
- **Fuera de alcance:** cambios en `main`, reescritura del historial, migración de leads y eliminación de volúmenes/bases.
- **Criterios de aceptación:** no quedan dependencias ejecutables de backend/Prisma/PostgreSQL en v2; documentación no se contradice; enlaces activos; solo se retiran archivos autorizados; volúmenes v1 intactos.
- **Casos de prueba:** búsqueda de referencias operativas; Compose config/build y frontend build sin backend; revisar enlaces; `git status/diff` para confirmar alcance y rama.
- **Resultados esperados:** documentación y repositorio de v2 describen únicamente el flujo objetivo; `main` y sus datos no cambian.
- **Evidencia de pruebas:** PENDIENTE; lista de archivos retirados, búsquedas, builds y revisión de enlaces.
- **Notas de implementación:** eliminación de código antiguo pertenece solo a este ticket futuro, no a la planificación. No duplicar v1 en carpeta `legacy`.
