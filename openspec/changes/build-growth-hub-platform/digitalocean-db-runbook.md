# Runbook: Crear Growth DB en DigitalOcean

## Objetivo

Crear una base PostgreSQL gestionada para Growth Hub, separada de Vortex, preparada para campañas, leads, eventos, CRM sync, snapshots y comisiones.

## Decisión recomendada

- Producto: DigitalOcean Managed Databases.
- Motor: PostgreSQL.
- Nombre cluster: `growth-postgres-prod` y `growth-postgres-qa`.
- Base: `growth_hub`.
- Región: misma región/VPC donde vivan Growth API/Worker.
- Acceso: trusted sources/private network cuando aplique.
- Conexión: TLS obligatorio.

## Paso a paso por UI DigitalOcean

1. Entrar al panel de DigitalOcean.
2. Ir a **Create** → **Managed Database**.
3. Seleccionar **PostgreSQL** como motor.
4. Elegir versión estable disponible.
5. Elegir región igual a la de los servicios Growth.
6. Elegir VPC donde correrán Growth API/Worker.
7. Elegir tamaño inicial.
   - QA: tamaño pequeño.
   - Prod MVP: mínimo con margen para eventos y conexiones.
   - Producción con pauta: subir CPU/RAM antes de campañas fuertes.
8. Crear cluster con nombre:
   - `growth-postgres-qa`
   - `growth-postgres-prod`
9. En el cluster, crear DB:
   - `growth_hub`
10. Crear usuarios:
   - `growth_app`: lectura/escritura app.
   - `growth_migration`: migraciones Prisma.
   - `growth_readonly`: reporting/BI.
11. Configurar trusted sources:
   - IP/servicio de Growth API.
   - IP/servicio de Growth Worker.
   - IPs administrativas mínimas.
12. Descargar o copiar CA certificate si DO lo entrega para conexión verificada.
13. Copiar connection string con SSL.
14. Guardar secrets en el mecanismo elegido:
   - GitHub Actions secrets.
   - DigitalOcean App env vars.
   - `.env` solo local y nunca versionado.
15. Probar conexión desde máquina autorizada.
16. Ejecutar migraciones iniciales.
17. Crear backup/restore checklist.

## Paso a paso con `doctl` conceptual

> Ajustar región, size y nombres antes de ejecutar.

```bash
# 1. Autenticarse
doctl auth init

# 2. Crear cluster PostgreSQL
# Revisar opciones disponibles antes:
doctl databases options engines
#doctl databases options versions pg
#doctl databases options regions
#doctl databases options slugs

# Ejemplo conceptual:
doctl databases create growth-postgres-prod \
  --engine pg \
  --version <PG_VERSION> \
  --region <REGION> \
  --size <SIZE_SLUG> \
  --num-nodes 1

# 3. Crear DB
doctl databases db create <CLUSTER_ID_OR_NAME> growth_hub

# 4. Crear usuarios
doctl databases user create <CLUSTER_ID_OR_NAME> growth_app
#doctl databases user create <CLUSTER_ID_OR_NAME> growth_migration
#doctl databases user create <CLUSTER_ID_OR_NAME> growth_readonly

# 5. Ver connection info
doctl databases connection <CLUSTER_ID_OR_NAME>
```

## Roles SQL recomendados

Conectar como usuario con permisos suficientes y ejecutar equivalente:

```sql
-- DB: growth_hub
CREATE SCHEMA IF NOT EXISTS public;

-- Permisos app
GRANT CONNECT ON DATABASE growth_hub TO growth_app;
GRANT USAGE ON SCHEMA public TO growth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO growth_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO growth_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO growth_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO growth_app;

-- Permisos readonly
GRANT CONNECT ON DATABASE growth_hub TO growth_readonly;
GRANT USAGE ON SCHEMA public TO growth_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO growth_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO growth_readonly;
```

## Variables de entorno necesarias

```txt
DATABASE_URL=postgresql://growth_app:***@host:25060/growth_hub?sslmode=require
MIGRATION_DATABASE_URL=postgresql://growth_migration:***@host:25060/growth_hub?sslmode=require
REDIS_URL=redis://...
GROWTH_PUBLIC_API_ORIGINS=https://financieramentecompany.com,https://campaigns.financieramentecu.co
GROWTH_INTERNAL_WEBHOOK_SECRET=...
GHL_WEBHOOK_URL=...
GHL_API_KEY=...
N8N_WEBHOOK_URL=...
META_PIXEL_ID=...
META_ACCESS_TOKEN=...
VORTEX_WEBHOOK_SECRET=...
HOTMART_HOTTOK=...
```

## Checklist de validación

- [ ] Growth API conecta con SSL.
- [ ] Migraciones corren con usuario migration.
- [ ] App no usa usuario migration en runtime.
- [ ] Readonly no puede escribir.
- [ ] Trusted sources bloquean IPs no autorizadas.
- [ ] Backup automático activo.
- [ ] Alerta configurada para CPU/mem/storage/connections.
- [ ] Runbook de restore documentado.

## Qué necesito del equipo/usuario

1. Acceso o acompañamiento al panel de DigitalOcean.
2. Región preferida o región actual de Vortex.
3. Decisión de entorno inicial: QA primero o QA+Prod.
4. Presupuesto inicial mensual aceptado para Managed Postgres + Redis.
5. Dominio/subdominio deseado para Growth API.
6. Secrets de GHL/n8n/Meta/Hotmart o responsable que los gestione.
7. Confirmar si usaremos App Platform, Droplet Docker o Kubernetes para Growth API/Worker.
8. Confirmar si se creará repo separado `growth-api-backend`.

## Opción de gasto controlado

Si el presupuesto inicial es una preocupación, usar este orden:

1. Crear solo ambiente QA para validar.
2. Crear PostgreSQL gestionado pequeño.
3. Usar Valkey gestionado solo si se aprueba; si no, usar Redis/Valkey en contenedor temporal para QA.
4. No crear Growth Admin todavía.
5. Migrar solo una campaña piloto.
6. Medir valor real antes de activar Prod.

## Criterios para pasar a producción

- La campaña piloto registra leads correctamente.
- GHL recibe leads desde Growth Worker.
- Existe idempotencia probada.
- Los eventos básicos se reconstruyen por lead.
- El costo mensual proyectado es aceptado.
- El equipo confirma que la trazabilidad obtenida justifica la inversión.
