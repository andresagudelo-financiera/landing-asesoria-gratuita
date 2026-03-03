## Context

La Landing Page actual de Asesoría Gratuita deriva tráfico a un chatbot externo (Typebot) para captar leads. Nuestro objetivo es reemplazar este flujo externo con un Funnel de Perfilamiento ("Profiling Funnel") alojado internamente en la aplicación web para centralizar datos, expandir lógica condicional (saber si son aptos para pólizas y seguros) e integrarse con Meta CAPI y el calendario de ventas.

## Goals / Non-Goals

**Goals:**
*   Implementar un Formulario Dinámico de calificación condicionado por un esquema JSON escalable.
*   Integrar disponibilidad de coaches conectando la información de personal en "Clint" con la API de "Google Calendar".
*   Garantizar una distribución justa de cargas de ventas a través de un Round-Robin persistente en base de datos.
*   Lograr tracking 100% certero enviando Pixels desde el Client y validaciones server-side hacia Meta CAPI.

**Non-Goals:**
*   Reescribir las vistas de otras páginas fuera de la Landing del funnel.
*   Construir un CMS completo para el Cuestionario Dinámico (se gestionará como config as code o JSON temporalmente).
*   Garantizar disponibilidad offline o offline fallback (el funnel depende fuertemente de APIs live).

## Decisions

1.  **Framework Híbrido Astro + React:** Aprovecharemos `Output: server` de Astro (SSR) para los endpoints críticos donde vivirá lógica privada (Round-Robin pointer, CAPI token, Google Cloud credenciales) al mismo tiempo que las etapas interactivas del form usarán React 19 para fluidez multi-step y GSAP para las animaciones estéticas en cliente.
2.  **Round-Robin Tracking (DigitalOcean Redis/SQLite):** Como Astro.js en SSR no posee un thread principal persistente entre lambdas o despliegues serverless (si está en Vercel/Netlify), levantar una base de datos ultraligera (Redis o SQLite) en un Droplet de DigitalOcean será el almacén seguro del "Pointer" o ID del último coach que recibió la cita.
3.  **Cross-Syncing (Clint + GCal):** Clint funge como el Source of Truth de *quiénes son los coaches disponibles*; Google Calendar funge como el Source of Truth de *qué horario tiene libre ese coach en particular*. El Endpoint `calendar/availability` cruzará esta data en vivo.

## Risks / Trade-offs

*   **Riesgo:** Limitación o rate-limit por consultar demasiados calendarios en GCal simultáneamente cada que abren el widget. 
    *   *Mitigación:* Se puede implementar un caché local o en Redis de 5-10 mins sobre las horas ocupadas de los coaches para evitar saturar las peticiones a la API de GCal constantemente, refetching solo justo antes del guardado ("`calendar/schedule`") para evitar solapamientos.
*   **Trade-off:** Añadir un backend centralizado para el estado del puntero incrementa latencias frente a una base de servidor sin estado puro, pero es la **única** forma nativa de lograr el Round-Robin con fiabilidad absoluta.
