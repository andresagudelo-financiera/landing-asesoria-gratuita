## ADDED Requirements

### Requirement: External identity mapping
The system SHALL map a Growth lead to external identities from providers such as GHL, Vortex, Hotmart, Calendly, Meta, and n8n.

#### Scenario: GHL contact linked to lead
- **WHEN** a lead is synced to GHL and an external contact ID is returned
- **THEN** the system SHALL persist a `ghl:contact` identity linked to the Growth lead.

### Requirement: Customer journey reconstruction
The system SHALL reconstruct a person's journey across campaigns, funnels, CRM, Vortex, payments, and commissions using lead IDs and external identities.

#### Scenario: Lead becomes Vortex user
- **WHEN** Vortex emits a user-created event with matching email or explicit lead reference
- **THEN** Growth SHALL link the Vortex user identity to the existing Growth lead.

### Requirement: Minimal Vortex snapshots
The system SHALL store only approved Vortex snapshots and identifiers, not full sensitive financial data from Vortex.

#### Scenario: Vortex subscription snapshot
- **WHEN** Vortex emits a subscription-started event
- **THEN** Growth SHALL store subscription status, plan, vortex user ID, and timestamp without copying financial transaction details unrelated to business attribution.
