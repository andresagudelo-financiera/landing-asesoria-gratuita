## ADDED Requirements

### Requirement: Dynamic campaign rendering
The system SHALL render marketing campaigns from configuration without requiring one source-code route per campaign.

#### Scenario: Render campaign by slug
- **WHEN** a visitor requests `/l/mentoria-inversionistas`
- **THEN** the Landing Engine SHALL fetch the campaign configuration by slug from Growth API and render the matching landing.

#### Scenario: Missing campaign
- **WHEN** a visitor requests an unknown campaign slug
- **THEN** the system SHALL return a controlled 404 or campaign-unavailable page without exposing internal errors.

### Requirement: Campaign variants
The system SHALL support campaign variants for A/B testing with explicit traffic weights and statuses.

#### Scenario: Active variant selection
- **WHEN** a campaign has multiple active variants
- **THEN** the system SHALL select a variant according to configured traffic weights and persist the selected variant in the visitor/session context.

### Requirement: Controlled visual flexibility
The system SHALL support templates, theme tokens, section blocks, and block variants while preventing arbitrary executable HTML or JavaScript from campaign configuration in the MVP.

#### Scenario: Campaign visual customization
- **WHEN** a marketer configures a campaign with a theme and block variants
- **THEN** the Landing Engine SHALL apply only known templates, known blocks, known variants, and validated theme tokens.
