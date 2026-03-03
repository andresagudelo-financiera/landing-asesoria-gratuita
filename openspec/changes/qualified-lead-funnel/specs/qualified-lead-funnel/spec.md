## ADDED Requirements

### Requirement: Qualified Lead Funnel Orchestration
The system SHALL orchestrate a 4-step lead qualification funnel consisting of Landing Page CTA, Dynamic Form, Calendar Picker, and Confirmation View.

#### Scenario: User navigates the funnel sequentially
- **WHEN** user clicks the primary CTA on the landing page
- **THEN** the system seamlessly transitions them through the Dynamic Form, conditionally to the Calendar Picker, and finally the Confirmation view without full page reloads where possible, emitting relevant Meta tracking pixels at each stage.
