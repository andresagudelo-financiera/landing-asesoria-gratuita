## MODIFIED Requirements

### Requirement: CTA Triggers Lead Capture Mechanism
The "Asesoría Gratuita" Call-To-Action buttons across the landing page SHALL trigger the LeadFunnelContainer component (the interactive Modal) instead of the previous external Typebot dialog.

#### Scenario: User engages with the primary CTA
- **WHEN** the user clicks "Agenda tu Asesoría" or any equivalent button
- **THEN** the local React-based LeadFunnelContainer opens smoothly overriding the screen for the Dynamic Profiling Form, without navigating away from the index page.
