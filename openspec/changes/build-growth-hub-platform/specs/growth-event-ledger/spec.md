## ADDED Requirements

### Requirement: Idempotent event ledger
The system SHALL store business and marketing events in an idempotent ledger using event keys or idempotency keys.

#### Scenario: Duplicate webhook event
- **WHEN** the same webhook event is received twice with the same idempotency key
- **THEN** the system SHALL store/process it once and mark duplicates as ignored or already processed.

### Requirement: Core event taxonomy
The system SHALL support a core event taxonomy for campaign, funnel, CRM, Vortex, payment, appointment, and commission events.

#### Scenario: Lead lifecycle event sequence
- **WHEN** a lead views a page, clicks a CTA, starts a funnel, submits a lead, syncs to CRM, and later becomes a Vortex user
- **THEN** the system SHALL be able to reconstruct the ordered event history for that lead.

### Requirement: Raw payload auditability
The system SHALL preserve raw payloads or raw payload references for critical webhook and integration events.

#### Scenario: Payment webhook audit
- **WHEN** a payment webhook is received
- **THEN** the system SHALL store the raw payload or a durable object-storage reference linked to the normalized event.
