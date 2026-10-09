## Contexto del proyecto

LeadFlow es una demostración de una automatización empresarial cuyo objetivo es automatizar el proceso:

Formulario web → recepción del lead → validación → CRM simulado → asignación de asesor → notificación por Slack.

El proyecto debe demostrar que puedo analizar un proceso empresarial, conectar sistemas y automatizar tareas repetitivas.

No estoy construyendo un CRM comercial real. El CRM es únicamente una simulación minimalista para demostrar el flujo.

## Objetivo técnico

El sistema debe permitir:

1. Recibir un lead desde un formulario web.
2. Validar sus datos.
3. Registrar el lead en un CRM simulado.
4. Determinar automáticamente qué asesor corresponde.
5. Actualizar el lead con el asesor asignado.
6. Enviar una notificación al asesor mediante Slack.
7. Mostrar visualmente el lead y su asignación.
8. Manejar errores básicos del proceso.

El flujo principal debe poder demostrarse de punta a punta.

## Entidades principales

Mantener inicialmente un modelo pequeño:

* Lead
* Advisor
* AssignmentRule
* Notification

No crear entidades adicionales salvo que exista una necesidad concreta.

## Arquitectura

Utilizar una arquitectura modular y sencilla.

Como referencia:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

La lógica de asignación debe estar separada de la lógica principal del lead.

La lógica de notificaciones debe estar separada y permitir integrar Slack.

No introducir patrones arquitectónicos complejos si no aportan un beneficio concreto.

No utilizar microservicios.

No utilizar event-driven architecture, CQRS, DDD, buses, factories, dependency injection frameworks u otros patrones avanzados salvo que exista una razón técnica clara y documentada.

## Tecnologías

La implementación puede utilizar:

* Node.js
* TypeScript
* Express
* PostgreSQL
* Prisma
* Zod
* Jest
* Supertest
* Docker / Docker Compose
* n8n
* Slack

Estas tecnologías no son obligatorias por sí mismas. Si una tecnología no aporta valor al proyecto, recomendar no utilizarla.

## n8n

n8n forma parte de la demostración de automatización.

La arquitectura debe evitar duplicar responsabilidades innecesariamente entre n8n y el backend.

Antes de implementar una funcionalidad, determinar si pertenece naturalmente a:

* formulario/frontend
* n8n
* backend
* base de datos
* Slack

n8n debería utilizarse principalmente para orquestar el flujo e integrar sistemas, mientras que la lógica empresarial que necesite consistencia y pruebas debe permanecer en el backend.

No convertir n8n en un reemplazo innecesario del backend.

## Reglas de asignación

La asignación debe ser determinística y sencilla.

Ejemplo:

```text
RRHH → Carlos
Legal → María
Automatización → Ana
```

Las reglas deben poder modificarse fácilmente sin tener que reescribir toda la aplicación.

No utilizar IA para decidir el asesor.

## Notificaciones

Slack debe utilizarse como demostración visual de la automatización.

Una notificación debería incluir como mínimo:

* empresa
* nombre del contacto
* servicio solicitado
* información relevante del lead
* asesor asignado

La integración debe estar aislada para poder probarla y modificarla sin afectar la lógica principal.

## Estructura del repositorio

El repositorio Git contiene tres áreas independientes:

```text
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── config/
│   └── app.ts
├── tests/
├── prisma/
├── package.json
└── .env.example

frontend/
├── src/
├── package.json
└── .env.example

n8n/
```

Backend y frontend son proyectos npm independientes: instalar dependencias y ejecutar scripts desde su respectiva carpeta. No agregar workspaces ni orquestadores en la raíz salvo que exista una razón concreta y acordada.

`n8n/` contiene el workflow y su documentación de configuración.

No crear carpetas o capas únicamente para aumentar la cantidad de abstracciones.

## Estilo de código

* TypeScript estricto.
* Preferir funciones y módulos sobre clases cuando ambas opciones sean apropiadas.
* Código simple y explícito.
* Nombres descriptivos.
* Evitar abstracciones prematuras.
* Evitar duplicación significativa.
* Validar entradas en los límites del sistema.
* Mantener la lógica empresarial fácilmente testeable.
* No mezclar acceso a base de datos con lógica empresarial.
* Manejar errores explícitamente.
* No ocultar errores con `catch` innecesarios.

## Testing

Los tests deben concentrarse en el comportamiento importante.

Priorizar:

* validación de leads
* creación de leads
* reglas de asignación
* actualización del asesor
* manejo de errores
* flujo HTTP principal
* integración con Slack cuando sea razonable

No escribir tests simplemente para aumentar artificialmente la cobertura.

## Docker

El proyecto debe poder ejecutarse de forma sencilla mediante Docker Compose.

La configuración debe estar orientada a que otra persona pueda clonar el repositorio y levantar la demo sin realizar una configuración manual extensa.

## Alcance

Este proyecto debe permanecer pequeño.

No implementar inicialmente:

* autenticación
* usuarios reales
* roles y permisos
* multi-tenancy
* billing
* CRM completo
* pipeline complejo
* dashboard avanzado
* IA
* microservicios
* Kubernetes
* Redis
* WebSockets
* sistemas de auditoría complejos
* funcionalidades que no sean necesarias para demostrar el flujo

Si una funcionalidad parece interesante pero no es necesaria para demostrar el objetivo principal, señalarla como posible mejora futura en lugar de implementarla automáticamente.

## Forma de trabajar

Antes de realizar cambios importantes:

1. Revisar el código existente.
2. Identificar qué parte del flujo se está implementando.
3. Explicar brevemente la decisión cuando existan varias alternativas.
4. Elegir la solución más simple que cumpla el objetivo.
5. Implementar.
6. Ejecutar o proponer los tests relevantes.
7. Revisar si la solución introdujo complejidad innecesaria.

No modificar archivos no relacionados con la tarea.

No realizar refactors generales mientras se implementa una funcionalidad específica, salvo que sean necesarios para completar correctamente la tarea.

## Criterio principal

Ante dos soluciones técnicamente válidas, preferir:

**la más simple, mantenible, demostrable y fácil de explicar a un potencial cliente.**

El objetivo del proyecto no es demostrar cuántas tecnologías o patrones conozco.

El objetivo es demostrar que puedo tomar un proceso empresarial y convertirlo en una automatización funcional.

Cuando detectes sobreingeniería, señálala explícitamente y recomienda una alternativa más simple.
