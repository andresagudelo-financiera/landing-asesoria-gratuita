## ADDED Requirements

### Requirement: Versioned configurable funnels
The system SHALL support versioned funnels defined by configuration, including steps, field types, validation, scoring, routing, and metadata.

#### Scenario: Load funnel configuration
- **WHEN** a campaign references a funnel key and version
- **THEN** Growth API SHALL return the exact active funnel configuration associated with that campaign variant.

### Requirement: Funnel submissions
The system SHALL persist each funnel submission with campaign, variant, funnel version, answers, score, outcome, and submission timestamp.

#### Scenario: Submit completed funnel
- **WHEN** a visitor completes a funnel
- **THEN** the system SHALL store the submission and associate it with the resolved lead and campaign.

### Requirement: Lead qualification outcomes
The system SHALL support configurable qualification outcomes such as Alta, Media, Baja, and No Aplica.

#### Scenario: Weighted scoring
- **WHEN** a funnel has weighted scoring rules
- **THEN** the system SHALL calculate the score and persist the resulting qualification outcome with the submission.
