# Tareas: Build Growth Hub Platform

## 0. Decisiones y preparación

- [ ] 0.1 Confirmar región DigitalOcean para Growth DB y servicios.
- [ ] 0.2 Confirmar dominio/subdominios finales:
  - [ ] `api.growth.financieramentecu.co`
  - [ ] `campaigns.financieramentecu.co` o ruta en dominio existente
  - [ ] `admin.growth.financieramentecu.co` futuro
- [ ] 0.3 Confirmar ambiente inicial: QA + Prod o solo QA primero.
- [ ] 0.4 Confirmar si Growth API irá en Droplet Docker, App Platform o Kubernetes.
- [ ] 0.5 Confirmar presupuesto inicial para DB gestionada + Redis.
- [ ] 0.6 Definir propietarios de secretos: GHL, Meta, n8n, Vortex internal secret, Hotmart.

## 1. Infraestructura base DigitalOcean

- [ ] 1.1 Crear proyecto/recurso DigitalOcean para Growth Hub.
- [ ] 1.2 Crear Managed PostgreSQL cluster para Growth.
- [ ] 1.3 Crear base `growth_hub`.
- [ ] 1.4 Crear usuarios DB:
  - [ ] `growth_app`
  - [ ] `growth_migration`
  - [ ] `growth_readonly`
- [ ] 1.5 Configurar trusted sources para API/worker y equipo autorizado.
- [ ] 1.6 Descargar/guardar CA certificate de PostgreSQL si aplica.
- [ ] 1.7 Crear Redis/Valkey para queues.
- [ ] 1.8 Crear bucket DO Spaces para raw payloads/assets/exports.
- [ ] 1.9 Definir backup/retention inicial.
- [ ] 1.10 Documentar connection strings y secrets fuera del repo.

## 2. Repositorio y servicio Growth API

- [ ] 2.1 Decidir repo:
  - [ ] `growth-api-backend` separado recomendado
  - [ ] o `infrastructure/growth/growth-api` temporal
- [ ] 2.2 Scaffold NestJS API.
- [ ] 2.3 Configurar Prisma con PostgreSQL.
- [ ] 2.4 Configurar validación de envs.
- [ ] 2.5 Configurar healthcheck `/health`.
- [ ] 2.6 Configurar logging estructurado con correlation_id.
- [ ] 2.7 Configurar Dockerfile production.
- [ ] 2.8 Configurar CI build/push a GHCR.
- [ ] 2.9 Configurar despliegue QA.
- [ ] 2.10 Configurar despliegue Prod.

## 3. Modelo de datos Growth DB

- [ ] 3.1 Crear Prisma schema inicial.
- [ ] 3.2 Migración: `growth_campaigns`.
- [ ] 3.3 Migración: `growth_campaign_variants`.
- [ ] 3.4 Migración: `growth_themes`.
- [ ] 3.5 Migración: `growth_funnels`.
- [ ] 3.6 Migración: `growth_leads`.
- [ ] 3.7 Migración: `growth_lead_submissions`.
- [ ] 3.8 Migración: `growth_lead_events`.
- [ ] 3.9 Migración: `growth_attribution_touchpoints`.
- [ ] 3.10 Migración: `growth_external_identities`.
- [ ] 3.11 Migración: `growth_crm_syncs`.
- [ ] 3.12 Migración: `growth_webhook_events`.
- [ ] 3.13 Migración: `growth_vortex_user_snapshots`.
- [ ] 3.14 Migración: `growth_payment_events`.
- [ ] 3.15 Migración: `growth_commissions`.
- [ ] 3.16 Migración: `growth_integration_logs`.
- [ ] 3.17 Crear índices para email/teléfono/created_at/provider/external_id/event_key.
- [ ] 3.18 Crear seed de campaña `asesoria-gratuita`.
- [ ] 3.19 Crear seed de theme `claudia-premium-dark`.
- [ ] 3.20 Crear seed de funnel `diagnostico-financiero-v1`.

## 4. Growth API — Campaign/Funnel config

- [ ] 4.1 Implementar `CampaignsModule`.
- [ ] 4.2 Endpoint `GET /v1/campaigns/:slug`.
- [ ] 4.3 Resolver variante activa.
- [ ] 4.4 Incluir theme tokens y secciones en respuesta.
- [ ] 4.5 Incluir funnel config asociado.
- [ ] 4.6 Cachear config con TTL corto.
- [ ] 4.7 Tests unitarios de resolución de campaña/variante.

## 5. Growth API — Lead intake

- [ ] 5.1 Implementar `LeadsModule`.
- [ ] 5.2 Endpoint `POST /v1/leads`.
- [ ] 5.3 Validar payload con DTO/Zod/class-validator.
- [ ] 5.4 Normalizar email.
- [ ] 5.5 Normalizar teléfono Colombia/internacional.
- [ ] 5.6 Generar `lead_uid` si no viene.
- [ ] 5.7 Aplicar idempotency key.
- [ ] 5.8 Upsert de lead.
- [ ] 5.9 Guardar submission.
- [ ] 5.10 Guardar respuestas.
- [ ] 5.11 Guardar touchpoints UTM.
- [ ] 5.12 Guardar eventos `lead_submitted` y `lead_qualified`.
- [ ] 5.13 Enqueue job `lead-sync`.
- [ ] 5.14 Responder sin esperar integraciones externas.
- [ ] 5.15 Tests de deduplicación.

## 6. Growth API — Event ingestion

- [ ] 6.1 Implementar `EventsModule`.
- [ ] 6.2 Endpoint `POST /v1/events`.
- [ ] 6.3 Validar event_name permitido.
- [ ] 6.4 Aplicar event_key/idempotency.
- [ ] 6.5 Asociar lead/campaign/session cuando sea posible.
- [ ] 6.6 Tests de idempotencia.

## 7. Growth Worker y colas

- [ ] 7.1 Configurar Redis/BullMQ.
- [ ] 7.2 Crear proceso `growth-worker`.
- [ ] 7.3 Cola `lead-sync`.
- [ ] 7.4 Cola `tracking-sync`.
- [ ] 7.5 Cola `webhook-normalization`.
- [ ] 7.6 Retry policy exponencial.
- [ ] 7.7 Dead-letter handling.
- [ ] 7.8 Integration logs por intento.
- [ ] 7.9 Healthcheck worker.

## 8. Integración GHL/n8n inicial

- [ ] 8.1 Crear `GhlAdapter`.
- [ ] 8.2 Mapear payload actual de landing a payload GHL.
- [ ] 8.3 Crear/actualizar contacto en GHL vía webhook/API definida.
- [ ] 8.4 Guardar `growth_crm_syncs`.
- [ ] 8.5 Guardar external identity `ghl:contact` si GHL retorna ID.
- [ ] 8.6 Crear `N8nAdapter` opcional.
- [ ] 8.7 Tests con mock HTTP.

## 9. Webhook gateway

- [ ] 9.1 Endpoint `POST /v1/webhooks/ghl`.
- [ ] 9.2 Endpoint `POST /v1/webhooks/vortex`.
- [ ] 9.3 Endpoint `POST /v1/webhooks/hotmart`.
- [ ] 9.4 Endpoint `POST /v1/webhooks/calendly`.
- [ ] 9.5 Validar secrets/signatures.
- [ ] 9.6 Guardar raw payload/ref.
- [ ] 9.7 Normalizar eventos.
- [ ] 9.8 Crear external identities.
- [ ] 9.9 Tests de idempotencia y seguridad.

## 10. Vortex integration

- [ ] 10.1 Definir contrato server-to-server Vortex → Growth.
- [ ] 10.2 Agregar env `GROWTH_API_URL` y `GROWTH_INTERNAL_SECRET` en Vortex backend.
- [ ] 10.3 Emitir evento `vortex.user.created`.
- [ ] 10.4 Emitir evento `vortex.subscription.started`.
- [ ] 10.5 Emitir evento `vortex.payment.approved`.
- [ ] 10.6 Emitir evento `vortex.payment.refunded`.
- [ ] 10.7 Guardar snapshots mínimos en Growth.
- [ ] 10.8 Garantizar que fallas de Growth no bloqueen UX crítica de Vortex.

## 11. Landing Engine migration

- [ ] 11.1 Crear ruta dinámica `/l/[slug]` en Astro.
- [ ] 11.2 Crear cliente Growth API.
- [ ] 11.3 Crear `LandingRenderer`.
- [ ] 11.4 Crear block registry.
- [ ] 11.5 Crear theme token application.
- [ ] 11.6 Crear `FunnelRenderer` basado en config.
- [ ] 11.7 Migrar landing actual a config `asesoria-gratuita`.
- [ ] 11.8 Cambiar envío de lead actual a `POST /v1/leads`.
- [ ] 11.9 Mantener fallback temporal al endpoint actual.
- [ ] 11.10 Verificar pixel/GA/Clarity con nuevo lead_uid.

## 12. Seguridad y operación

- [ ] 12.1 Remover secretos hardcodeados de landing actual.
- [ ] 12.2 Configurar CORS restringido.
- [ ] 12.3 Rate limiting en endpoints públicos.
- [ ] 12.4 Validar payload size limits.
- [ ] 12.5 Configurar logs sin PII sensible.
- [ ] 12.6 Configurar alerts de errores de integración.
- [ ] 12.7 Documentar runbooks de replay/retry.
- [ ] 12.8 Documentar backup/restore DB.

## 13. Comisiones — foundation

- [ ] 13.1 Crear modelo de commission rules.
- [ ] 13.2 Crear modelo `growth_commissions`.
- [ ] 13.3 Registrar evento `commission_candidate_created` desde pago aprobado.
- [ ] 13.4 Calcular borrador de comisión con regla simple.
- [ ] 13.5 Permitir aprobación manual futura.

## 14. QA, validación y rollout

- [ ] 14.1 Crear ambiente QA completo.
- [ ] 14.2 Probar landing → lead → Growth DB.
- [ ] 14.3 Probar lead → GHL sync.
- [ ] 14.4 Probar webhook GHL → Growth.
- [ ] 14.5 Probar Vortex → Growth event.
- [ ] 14.6 Probar idempotencia con payload duplicado.
- [ ] 14.7 Probar caída de GHL y reintentos.
- [ ] 14.8 Load test básico de lead intake.
- [ ] 14.9 Checklist de seguridad.
- [ ] 14.10 Activar primera campaña real.

## 15. Validación costo/beneficio antes de implementación

- [ ] 15.1 Estimar número esperado de campañas/funnels por trimestre.
- [ ] 15.2 Estimar volumen mensual de leads y eventos.
- [ ] 15.3 Estimar costo actual de operar landings/funnels en GHL/n8n/manual.
- [ ] 15.4 Estimar costo de oportunidad por falta de atribución y trazabilidad.
- [ ] 15.5 Confirmar si Growth Hub se justifica ahora o si conviene una fase táctica ligera.
- [ ] 15.6 Definir presupuesto máximo del MVP.
- [ ] 15.7 Decidir si Valkey será gestionado desde el inicio o contenedor temporal.
- [ ] 15.8 Decidir si `growth-admin` se crea ahora o se aplaza.
- [ ] 15.9 Crear repos separados aprobados.
- [ ] 15.10 Registrar decisión final de inversión antes de implementar.

## 16. Repositorios

- [ ] 16.1 Crear repo `growth-api-backend`.
- [ ] 16.2 Crear repo `landing-engine`.
- [ ] 16.3 Crear repo `growth-admin` solo si se aprueba para la fase actual.
- [ ] 16.4 Mantener `infrastructure` como orquestador/IaC/runbooks.
- [ ] 16.5 Configurar branch strategy QA/main en cada repo.
- [ ] 16.6 Configurar GitHub Actions por repo.
- [ ] 16.7 Configurar secrets por repo.
