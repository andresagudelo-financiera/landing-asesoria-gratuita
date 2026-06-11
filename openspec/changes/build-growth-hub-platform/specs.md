# Especificaciones: Growth Hub Platform

## 1. Separación de dominios

### Requisito 1.1 — Growth debe ser independiente de Vortex
**El sistema DEBE** desplegar Growth API, Growth Worker y Growth DB como componentes separados de Vortex.

#### Escenario
- Dado que Vortex tiene usuarios activos y datos financieros
- Cuando una campaña reciba tráfico alto
- Entonces Growth debe absorber leads/eventos sin añadir carga directa a la DB transaccional de Vortex.

### Requisito 1.2 — Fuente de verdad por dominio
**El sistema DEBE** documentar y respetar fuentes de verdad:

| Dominio | Fuente de verdad |
|---|---|
| Campañas | Growth DB |
| Landings config | Growth DB |
| Funnels config | Growth DB |
| Leads capturados | Growth DB |
| Atribución | Growth DB |
| Eventos comerciales | Growth DB |
| CRM operativo | GHL |
| Usuarios/producto | Vortex |
| Datos financieros de usuario | Vortex |
| Pagos operativos | Vortex / pasarela |
| Comisiones | Growth DB |

## 2. Campaign Engine

### Requisito 2.1 — Campañas dinámicas
**El sistema DEBE** permitir crear campañas sin crear una ruta nueva por campaña.

#### Escenario
- Dado un slug `mentoria-inversionistas`
- Cuando el usuario visita `/l/mentoria-inversionistas`
- Entonces el Landing Engine debe pedir la configuración a Growth API y renderizar la campaña correspondiente.

### Requisito 2.2 — Versionado y variantes
**El sistema DEBE** soportar variantes de campaña para A/B testing.

Campos mínimos:
- `campaign_id`
- `variant_key`
- `traffic_weight`
- `status`
- `metadata`

### Requisito 2.3 — Estilos controlados
**El sistema DEBE** representar estilos mediante `template`, `theme tokens`, `block variants` y overrides controlados.

**El sistema NO DEBE** ejecutar HTML/JS arbitrario almacenado en DB en el MVP.

## 3. Funnel Engine

### Requisito 3.1 — Funnels configurables
**El sistema DEBE** permitir funnels versionados con pasos, validaciones, scoring y outcomes.

### Requisito 3.2 — Respuestas auditables
**El sistema DEBE** guardar respuestas asociadas a:
- lead
- campaign
- funnel
- funnel version
- step id
- submitted_at

### Requisito 3.3 — Branching y scoring
**El sistema DEBE** soportar reglas configurables para clasificación del lead como mínimo:
- `Alta`
- `Media`
- `Baja`
- `No Aplica` si aplica por campaña.

## 4. Lead Intake

### Requisito 4.1 — Endpoint único de captura
**El sistema DEBE** exponer un endpoint central para captura:

```txt
POST /v1/leads
```

El payload mínimo debe incluir:
- campaign slug/id
- funnel id/version
- lead fields normalizados
- answers
- UTMs
- client metadata
- idempotency key

### Requisito 4.2 — Deduplicación
**El sistema DEBE** deduplicar por:
- email normalizado
- teléfono normalizado
- external identities
- idempotency key

### Requisito 4.3 — Respuesta rápida
**El sistema DEBE** responder al usuario después de guardar localmente en Growth DB, sin esperar integraciones externas.

## 5. Event Ledger

### Requisito 5.1 — Eventos idempotentes
**El sistema DEBE** guardar eventos con `event_key` o `idempotency_key` para evitar duplicados.

Eventos iniciales:
- `page_view`
- `cta_clicked`
- `funnel_started`
- `funnel_step_completed`
- `lead_submitted`
- `lead_qualified`
- `crm_sync_requested`
- `crm_synced`
- `crm_sync_failed`
- `appointment_created`
- `vortex_user_created`
- `payment_approved`
- `commission_generated`

### Requisito 5.2 — Raw payloads
**El sistema DEBE** guardar payloads crudos de webhooks críticos o su referencia en Object Storage para auditoría.

## 6. Identity Resolution

### Requisito 6.1 — IDs externos
**El sistema DEBE** mapear identidades externas por proveedor:

- `ghl_contact_id`
- `ghl_opportunity_id`
- `vortex_user_id`
- `hotmart_buyer_id`
- `hotmart_transaction_id`
- `calendly_invitee_id`
- `meta_event_id`

### Requisito 6.2 — Persona/lead unificado
**El sistema DEBE** poder reconstruir el recorrido de una persona desde primer toque hasta compra/comisión.

## 7. Integraciones

### Requisito 7.1 — Integraciones asíncronas
**El sistema DEBE** enviar datos a GHL, Meta CAPI, n8n, email y futuras integraciones mediante jobs/colas.

### Requisito 7.2 — Webhook gateway
**El sistema DEBE** tener endpoints para recibir webhooks:

```txt
POST /v1/webhooks/ghl
POST /v1/webhooks/vortex
POST /v1/webhooks/hotmart
POST /v1/webhooks/calendly
```

Cada webhook debe:
- validar firma/secreto
- persistir evento raw o referencia
- normalizar evento
- aplicar idempotencia
- emitir evento interno si corresponde

## 8. Comunicación Vortex ↔ Growth

### Requisito 8.1 — Vortex emite eventos
Vortex DEBE emitir eventos server-to-server hacia Growth para:
- `user.created`
- `user.activated`
- `subscription.started`
- `subscription.expired`
- `payment.approved`
- `payment.refunded`
- `onboarding.completed`
- `tool.used`

### Requisito 8.2 — Growth no replica datos financieros sensibles
Growth NO DEBE copiar movimientos financieros, presupuestos, activos/pasivos o datos sensibles detallados de Vortex salvo snapshots explícitamente aprobados.

## 9. Seguridad y cumplimiento

### Requisito 9.1 — Secrets y credenciales
**El sistema DEBE** almacenar credenciales en variables de entorno/secret manager, no en código.

### Requisito 9.2 — PII
**El sistema DEBE** normalizar y proteger PII.

### Requisito 9.3 — Acceso a DB
**El sistema DEBE** conectar a Growth DB por TLS y trusted sources/private network cuando aplique.

### Requisito 9.4 — Auditoría
**El sistema DEBE** registrar acciones administrativas críticas.

## 10. Escalabilidad mínima

### Requisito 10.1 — Separación de lectura/escritura futura
El diseño DEBE permitir añadir read replicas o analytics warehouse sin reescribir los flujos principales.

### Requisito 10.2 — 5.000+ usuarios activos en Vortex
Growth NO DEBE introducir dependencia síncrona crítica que bloquee login, uso o pagos de Vortex.

### Requisito 10.3 — Backpressure
El sistema DEBE tolerar fallas temporales de GHL/Meta/n8n mediante queue, retry y dead-letter.
