## ADDED Requirements

### Requirement: Dynamic Coach Roster Synchronization
The system MUST dynamically fetch the active coach list and URLs from Clint to avoid maintaining two separate sets of truth.

#### Scenario: System retrieves coach roster
- **WHEN** evaluating availability for the lead funnel
- **THEN** the backend fetches the up-to-date coach data from Clint.

### Requirement: Persistent Round-Robin Pointer
The system SHALL maintain a global, persistent pointer in a lightweight database (Redis/SQLite on DigitalOcean) to trace the last assigned coach.

#### Scenario: Advancing the queue after booking
- **WHEN** a user successfully schedules a meeting with Coach A
- **THEN** the pointer in DigitalOcean is updated to jump to Coach B (or Coach A+1) for the very next visitor requesting a timeslot.

### Requirement: Live Availability Cross-Check
The system MUST iterate through the Round-Robin queue and verify against the Google Calendar API if the selected coach has a free slot for the requested time before confirming.

#### Scenario: Handling occupied timeslots gracefully
- **WHEN** a user requests 10:00 AM, and the chosen Round-Robin coach is busy on Google Calendar at 10:00 AM
- **THEN** the system skips that coach and checks the Next+1 coach until a free slot is found, successfully booking the appointment.
