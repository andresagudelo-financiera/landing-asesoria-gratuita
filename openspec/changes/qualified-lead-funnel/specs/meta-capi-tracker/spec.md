## ADDED Requirements

### Requirement: Redundant Server-Side Tracking via Meta CAPI
The system MUST fire key conversion events (Landing, Lead, Schedule) directly to the Meta Conversions API from secure Astro backend endpoints to ensure events are tracked even when client-side pixels fail or are blocked.

#### Scenario: Triggering the 'Lead' Event
- **WHEN** a user successfully passes the Dynamic Profiling Form
- **THEN** the backend fires a 'Lead' event to the Meta CAPI using the System User Access Token and Pixel ID, including standard deduplication IDs.
