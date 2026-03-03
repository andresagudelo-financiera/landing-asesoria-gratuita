## ADDED Requirements

### Requirement: JSON-Driven Form Rendering
The Dynamic Profiling Form SHALL be fully driven by a JSON configuration file to dictate questions, options, and conditional logic.

#### Scenario: Updating questions without code changes
- **WHEN** marketing needs to change a profiling question
- **THEN** they only need to update the central JSON configuration file, and the Dynamic Form component will instantly reflect the changes without requiring React code refactoring.

### Requirement: Lead Routing based on Answers
The form MUST evaluate user answers in real-time to decide if the lead is "Qualified" for the Calendar flow or "Disqualified".

#### Scenario: A user meets the qualification criteria
- **WHEN** the user provides answers matching the "Qualified" conditions defined in the configuration
- **THEN** they are seamlessly transitioned to the Calendar Picker step.
