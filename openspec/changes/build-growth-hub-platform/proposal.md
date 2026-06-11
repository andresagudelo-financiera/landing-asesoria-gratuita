# Propuesta: Growth Hub Platform para campañas, funnels, leads, CRM, Vortex y comisiones

## Intento y alcance

Construir una plataforma centralizada llamada **Growth Hub** para operar campañas, landings dinámicas, funnels, trazabilidad de leads, sincronización CRM, atribución, eventos de negocio, relación con Vortex y gestión futura de comisiones.

La decisión arquitectónica principal es **separar Growth Hub de Vortex**: Vortex seguirá siendo la app transaccional para usuarios y datos financieros; Growth Hub será la fuente de verdad para campañas, funnels, leads, atribución, eventos comerciales, CRM sync y comisiones.

## Contexto actual

El ecosistema actual tiene:

- Landing Astro actual en `/Users/andres/Documents/financieramente/landing-asesoria-gratuita`.
- Infraestructura Docker en `/Users/andres/Documents/financieramente/infrastructure`.
- Vortex con Next.js frontend, Laravel backend y MySQL en Docker.
- `mia-api-backend` NestJS/Prisma conectado a la DB de Vortex.
- GHL/n8n/webhooks usados actualmente desde endpoints de landing.
- Necesidad de lanzar múltiples campañas/funnels sin crear rutas y código manual por cada una.

## Problemas que resuelve

1. Las landings actuales tienden a crecer como rutas individuales (`/mentoria`, `/calculadora-perfil`, etc.), lo cual no escala.
2. Los leads y respuestas están dispersos entre landing, GHL, Vortex, webhooks y DBs locales.
3. No existe un identificador central para reconstruir el recorrido completo de una persona.
4. La trazabilidad de campaña → lead → CRM → cita → usuario Vortex → pago → comisión no está centralizada.
5. Vortex debe escalar a 5.000+ usuarios activos y no debe cargar con analítica, campañas ni eventos de marketing.
6. GHL es útil como CRM operativo, pero no debe ser la única fuente de verdad para datos estratégicos.

## Objetivos

- Crear un **Growth Hub independiente** con API, DB y workers propios.
- Crear una **Growth DB en PostgreSQL gestionado en DigitalOcean**.
- Crear una **Landing/Funnel Engine** configurable para campañas dinámicas.
- Centralizar leads, respuestas, eventos, atribución, IDs externos y sincronizaciones.
- Integrar con GHL, n8n, Meta CAPI, Vortex, pagos y futuras fuentes mediante adaptadores.
- Diseñar desde el inicio con idempotencia, colas, webhooks, auditoría y separación de dominios.
- Mantener Vortex como sistema transaccional independiente y comunicarlo por eventos/snapshots.
- Permitir que el alcance inicial sea pequeño sin bloquear escalabilidad futura.

## No objetivos iniciales

- No construir un clon completo de Webflow/GHL visual desde el inicio.
- No migrar Vortex a PostgreSQL en esta fase.
- No mover todos los datos financieros de Vortex a Growth.
- No construir BI avanzado ni data warehouse en la primera iteración.
- No guardar HTML/JS arbitrario de campañas en base de datos.
- No capturar eventos excesivos de bajo valor como mousemove/scroll granular en el MVP.

## Decisión arquitectónica principal

Se construirá Growth Hub como plataforma separada:

```txt
Vortex = producto/app transaccional para usuarios y datos financieros.
Growth = campañas, funnels, leads, atribución, CRM, eventos comerciales y comisiones.
```

## Capacidades nuevas

### `growth-campaign-management`
Gestionar campañas, landings dinámicas, variantes, themes, secciones y metadata SEO/tracking.

### `growth-funnel-engine`
Gestionar funnels configurables, pasos, validaciones, scoring, branching, respuestas y outcomes.

### `growth-lead-intake`
Recibir leads desde landings y otras fuentes con deduplicación, normalización, UTMs y trazabilidad.

### `growth-event-ledger`
Registrar eventos de negocio y marketing de forma idempotente y auditable.

### `growth-identity-resolution`
Unificar identidad entre lead, GHL contact, Vortex user, payment buyer, Calendly invitee y otros IDs externos.

### `growth-integration-adapters`
Enviar/recibir datos desde GHL, n8n, Meta CAPI, Vortex, Hotmart/pagos, Calendly y futuras fuentes.

### `growth-commission-foundation`
Base para calcular y auditar comisiones por asesor/equipo/fuente/campaña/producto.

## Impacto esperado

- Las nuevas landings se crearán como configuraciones, no como rutas manuales.
- Los formularios/funnels se podrán versionar y reutilizar.
- La operación comercial tendrá un historial central por lead/persona.
- El equipo podrá medir ROI real por campaña/fuente/asesor.
- Vortex no será afectado por cargas analíticas de marketing.
- Se habilita un camino claro hacia BI, dashboards, automatización y comisiones.

## Riesgos y mitigaciones

### Riesgo: sobre-arquitectura inicial
Mitigación: construir primero un MVP pequeño con fundamentos sólidos: Growth API, Growth DB, leads, eventos, campaigns, funnels y GHL sync.

### Riesgo: duplicidad de datos entre GHL, Growth y Vortex
Mitigación: definir fuente de verdad por dominio y guardar IDs externos + snapshots mínimos, no réplicas completas.

### Riesgo: pérdida de eventos por fallas de integraciones
Mitigación: usar colas, idempotency keys, logs de integración y reintentos.

### Riesgo: exponer datos sensibles
Mitigación: separar PII, usar roles DB, secrets en DO, TLS, trusted sources, auditoría y payload redaction.

### Riesgo: afectar Vortex
Mitigación: Vortex solo emite eventos/snapshots; Growth no consulta masivamente la DB transaccional de Vortex.

## Actualización: repositorios separados y criterio de inversión vs GHL

Después de revisar la infraestructura actual y el objetivo de escalar Vortex como app de usuarios, se decide que Growth Hub **no debe vivir como código de negocio dentro del repositorio `infrastructure`**.

Repositorios recomendados:

- `growth-api-backend`: API, worker, Prisma schema, integraciones, eventos y comisiones.
- `landing-engine`: Astro SSR, Campaign Renderer, Funnel Renderer, templates, blocks y themes.
- `growth-admin`: panel administrativo futuro; no obligatorio en el MVP.
- `infrastructure`: solo orquestación, Caddy/App Platform specs, runbooks, CI/CD e IaC.

### Criterio profesional de inversión

El esfuerzo vale la pena **si Financieramente quiere que campañas, funnels, atribución, datos comerciales, Vortex, pagos y comisiones sean un activo propio** y no una colección de automatizaciones dispersas en GHL/n8n/landings.

El esfuerzo NO valdría la pena si el único objetivo fuera crear 2 o 3 landings al año y recibir leads básicos en GHL. En ese escenario, GHL + buenas plantillas + n8n sería suficiente.

La recomendación es ejecutar un **MVP delgado, no la plataforma completa de una vez**:

1. Growth DB gestionada.
2. Growth API mínima.
3. Endpoint único `/v1/leads`.
4. Event ledger básico.
5. Sync asíncrono a GHL.
6. Landing actual enviando a Growth.
7. Una campaña dinámica piloto.

No construir todavía:

- Growth Admin completo.
- BI avanzado.
- Page builder visual.
- Sistema complejo de comisiones.
- Multi-CRM avanzado.
- Data warehouse separado.

### Justificación frente a GHL

GHL debe seguir siendo usado como CRM operativo. Growth Hub no compite con GHL inicialmente; lo complementa.

GHL sirve para:

- operación comercial,
- pipelines,
- seguimiento,
- automatizaciones,
- tareas del equipo comercial.

Growth Hub sirve para:

- fuente de verdad de campañas y funnels,
- trazabilidad propia,
- datos limpios de leads y respuestas,
- atribución cross-sistema,
- relación con Vortex,
- base futura de comisiones,
- independencia estratégica de proveedores.

