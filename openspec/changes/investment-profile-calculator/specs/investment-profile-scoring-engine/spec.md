## ADDED Requirements

### Requirement: Weighted Score Calculation
The system SHALL compute a total investment profile score (0-100) based on weighted percentages of four distinct blocks: Capacidad Financiera (CF) - 40%, Tolerancia al Riesgo (TR) - 30%, Horizonte/Objetivo (HO) - 20%, and Conocimiento y Experiencia (CE) - 10%.

#### Scenario: All answers are neutral
- **WHEN** all input answers correspond to the mid-value "3" out of 5
- **THEN** the system calculates a score that lands exactly at 60 (out of 100), mapping to a "Moderado" profile, provided no restrictive gates are triggered.

### Requirement: Critical Security Gates
The system MUST evaluate specific business "gates" prior to finalizing the score. These gates override the mathematical score if safety thresholds are not met.

#### Scenario: No emergency fund (CF Gate)
- **WHEN** the user selects option "1" for the emergency fund question (Less than 1 month)
- **THEN** the final result is forced to "No Aplica" regardless of their risk tolerance, and the system recommends the 90-180 day action plan.

#### Scenario: High debt ratio (CF Gate)
- **WHEN** the user selects option "1" for the debt question (More than 40% of income goes to debt)
- **THEN** the final result is capped at a "Conservador" profile, even if their math score was 90/100 (Agresivo).

#### Scenario: Zero loss tolerance (CF Gate)
- **WHEN** the user states they cannot afford a 20% drop without affecting their life
- **THEN** the final result is forced to "No Aplica" (Not ready for risk), prescribing a capital protection strategy.

#### Scenario: Short investment horizon (HO Gate)
- **WHEN** the user needs the money in less than 1 year
- **THEN** the system limits any variable income (renta variable) recommendation to a strict maximum of 20%, enforcing a "Conservador" profile.

### Requirement: Profile Mapping
The system SHALL map the final calculated 0-100 score to one of four predefined investment profiles if all gates pass.

#### Scenario: Score between 0 and 34
- **WHEN** the computed score is 25 and no gates are violated
- **THEN** the system maps the result to the "Conservador" profile (80-100% Fixed Income, 0-20% Variable Income).

#### Scenario: Score between 35 and 54
- **WHEN** the computed score is 45 and no gates are violated
- **THEN** the system maps the result to the "Moderado Conservador" profile (60-80% Fixed Income, 20-40% Variable Income).

#### Scenario: Score between 55 and 74
- **WHEN** the computed score is 65 and no gates are violated
- **THEN** the system maps the result to the "Moderado" profile (40-60% Fixed Income, 40-60% Variable Income).

#### Scenario: Score between 75 and 100
- **WHEN** the computed score is 85 and no gates are violated
- **THEN** the system maps the result to the "Agresivo" profile (20-40% Fixed Income, 60-80% Variable Income).
