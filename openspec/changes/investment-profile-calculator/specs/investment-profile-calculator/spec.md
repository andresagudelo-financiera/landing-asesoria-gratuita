## ADDED Requirements

### Requirement: Interactive Step-by-Step UI
The system SHALL present the 14-question profile calculator as a step-by-step interactive wizard, showing one question at a time to minimize cognitive load.

#### Scenario: Advancing to next question
- **WHEN** the user selects an option (1-5) for the current question
- **THEN** the system automatically transitions to the next question without requiring a "Next" button click

#### Scenario: Progress indication
- **WHEN** the user is answering a question
- **THEN** a progress bar or indicator shows the current step relative to the total (e.g., "Paso 3 de 14")

### Requirement: Data Collection and State
The system SHALL maintain the state of the user's answers throughout the wizard navigation, allowing backward and forward movement.

#### Scenario: Navigating backward
- **WHEN** the user clicks a "Back" button
- **THEN** the previous question is displayed with their previously selected answer highlighted

### Requirement: Conditional Result Rendering
The system SHALL render a distinct result view depending on the mathematical outcome and gate evaluation from the scoring engine.

#### Scenario: User triggers a restrictive security gate (No Aplica)
- **WHEN** the scoring engine returns a status indicating the user is not ready for risk investments (e.g., no emergency fund)
- **THEN** the UI displays the "Plan Semilla" (a 90-180 day action plan) instead of a traditional investment profile and explicitly explains why they must wait.

#### Scenario: User is assigned a valid investment profile
- **WHEN** the scoring engine returns a valid profile (Conservador, Moderado, etc.) based on the score
- **THEN** the UI displays the profile name, a graphical representation of the recommended portfolio mix (e.g., 80% Renta Fija / 20% Renta Variable), and actionable next steps.

### Requirement: Lead Capture (Optional Step)
The system SHALL offer a lead capture form before or alongside displaying the final result to qualify prospects for the advisory team.

#### Scenario: Submitting contact info
- **WHEN** the user completes the final question
- **THEN** a form asks for Name and Email, and upon submission, sends this data along with the calculated profile to the CRM/Backend.
