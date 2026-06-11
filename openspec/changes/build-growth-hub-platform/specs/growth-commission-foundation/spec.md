## ADDED Requirements

### Requirement: Commission event foundation
The system SHALL provide foundational models to associate payments, leads, advisors, teams, campaigns, products, and commission amounts.

#### Scenario: Payment approved creates commission candidate
- **WHEN** a payment-approved event is associated with a Growth lead and advisor
- **THEN** the system SHALL create or update a commission candidate record according to configured rules.

### Requirement: Commission status lifecycle
The system SHALL support commission lifecycle statuses at minimum: draft, approved, paid, and void.

#### Scenario: Manual approval future flow
- **WHEN** a draft commission is reviewed by an authorized operator
- **THEN** the system SHALL allow it to transition to approved without losing the original payment and attribution references.

### Requirement: Attribution-aware commissions
The system SHALL preserve campaign, source, advisor, and payment references needed to analyze commissions by business origin.

#### Scenario: Campaign commission reporting
- **WHEN** commissions are generated for paid customers
- **THEN** the system SHALL support reporting commission totals by campaign, source, advisor, and team.
