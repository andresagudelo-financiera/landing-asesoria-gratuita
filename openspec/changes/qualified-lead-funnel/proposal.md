## Why

El actual chatbot en la página principal debe ser reemplazado por un embudo de ventas dinámico ("Profiling Funnel") que no solo permita agendar una "Asesoría Gratuita", sino que califique proactivamente si el prospecto es idóneo para planes de pólizas o seguros. Esto optimizará el tiempo de los *Money Strategists*, derivará leads cualificados automáticamente a través de un sistema Round-Robin justificado con disponibilidad real de sus Google Calendars, e impulsará un seguimiento efectivo mediante Meta CAPI.

## What Changes

*   **Reemplazo del Chatbot:** Se removerá la integración actual de Typebot de la Landing Page.
*   **Formulario Dinámico de Calificación:** Implementación de un formulario paso a paso alimentado por una configuración JSON dinámica para segregar el flujo del lead.
*   **Agendamiento Nativo Integrado:** Creación de un UI Calendar Picker que consulta disponibilidad real.
*   **Lógica Backend Round-Robin:** Backend que evalúa la fuente de asignación (Clint), y reserva en el calendario manteniendo el turno en una base de datos persistente (Redis/SQLite en DigitalOcean).
*   **Tracking y Eventos de Píxeles:** Disparo redundante mediante Front (Pixels) y Backend (Conversions API) de eventos clave a Meta ("Landing", "Lead", "Schedule").

## Capabilities

### New Capabilities
*   `qualified-lead-funnel`: El orquestador principal del embudo reactivo (Landing -> Formulario -> Calendario -> Confirmación).
*   `round-robin-assigner`: Lógica de asignación justa verificando calendarios de Google en base a la lista de Clint.
*   `dynamic-profiling-form`: Motor de renderizado y enrutamiento del cuestionario guiado mediante configuración JSON.
*   `meta-capi-tracker`: Sistema de disparo CAPI unificado desde backend para robustecer el seguimiento (tracking).

### Modified Capabilities
*   `landing-page-actions`: Los botones CTA actuales que apuntan a Typebot ahora deben detonar el modal/componente de "LeadFunnelContainer".

## Impact

*   **Páginas:** `src/pages/index.astro`, `src/layouts/MainLayout.astro`
*   **Nuevas APIS:** Rutas SSR de Astro (`calendar/availability`, `calendar/schedule`, `tracking/meta-capi`).
*   **Dependencias Adicionales:** Cliente de Google APIs (p/ Calendar), Cliente de Redis/SQLite, y conexión con la API de Clint para los coaches.
*   **Infraestructura:** Requerirá que en DigitalOcean se instancie una DB ligera para mantener el puntero en estado persistente y habilitar SSR Output en Astro.
