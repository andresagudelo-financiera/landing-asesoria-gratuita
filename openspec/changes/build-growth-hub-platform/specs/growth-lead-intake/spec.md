## ADDED Requirements

### Requirement: Central lead intake endpoint
The system SHALL expose a central lead intake endpoint that all landings and funnels use instead of sending directly to GHL, n8n, or other external tools.

#### Scenario: Lead submitted from landing
- **WHEN** a landing submits a lead payload to `POST /v1/leads`
- **THEN** Growth API SHALL validate, normalize, persist, and acknowledge the lead before external integrations run.

### Requirement: Lead deduplication
The system SHALL deduplicate leads using normalized email, normalized phone, external identities, and idempotency keys.

#### Scenario: Duplicate email
- **WHEN** two submissions arrive with the same normalized email
- **THEN** the system SHALL resolve them to the same lead record and preserve each submission as a separate touch/submission event when appropriate.

### Requirement: Fast user response
The system SHALL not block user-facing responses on CRM, tracking, email, or calendar integrations.

#### Scenario: GHL unavailable
- **WHEN** GHL is temporarily unavailable during lead submission
- **THEN** the user SHALL still receive a successful local submission response if Growth DB persistence succeeds, and GHL sync SHALL be retried asynchronously.
