## ADDED Requirements

### Requirement: Asynchronous integration adapters
The system SHALL communicate with external systems through adapters executed by workers/queues rather than direct synchronous calls from landing submissions.

#### Scenario: Lead sync job
- **WHEN** a lead is submitted
- **THEN** the system SHALL enqueue a lead-sync job and the worker SHALL send the mapped payload to GHL/n8n according to routing rules.

### Requirement: Webhook gateway
The system SHALL expose a webhook gateway for GHL, Vortex, Hotmart/payment providers, Calendly, and future providers.

#### Scenario: Authenticated provider webhook
- **WHEN** a provider sends a webhook
- **THEN** the system SHALL validate the provider secret/signature before processing the payload.

### Requirement: Integration retry and dead-letter handling
The system SHALL retry failed integrations and persist dead-letter failures for manual review.

#### Scenario: External API timeout
- **WHEN** an external API times out
- **THEN** the job SHALL be retried according to policy and eventually moved to dead-letter if retries are exhausted.
