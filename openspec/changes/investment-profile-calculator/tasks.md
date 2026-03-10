## 1. Setup & Scoring Logic

- [x] 1.1 Create the `scoringEngine.ts` utility file for pure math and gate logic.
- [x] 1.2 Implement the `calculateScore` function with weights (CF: 40%, TR: 30%, HO: 20%, CE: 10%).
- [x] 1.3 Implement the critical security gates (Emergency Fund, Debt, Loss Tolerance, Horizon).
- [x] 1.4 Write unit tests for `scoringEngine.ts` to validate math accuracy and gate overrides.

## 2. Core UI Components

- [x] 2.1 Create the main `<ProfileCalculator />` container component and establish local state for answers.
- [x] 2.2 Create the `<QuestionStep />` component to render individual questions and their 5 options.
- [x] 2.3 Create the `<ProgressBar />` component to indicate progress (Step X of 14).
- [x] 2.4 Create the `<ResultView />` component with conditional rendering for "Profiles" vs "Plan Semilla".

## 3. Integration & Routing

- [x] 3.1 Create the new page route (e.g., `src/pages/calculadora-perfil.astro`) and mount the `<ProfileCalculator />`.
- [x] 3.2 Connect the `<QuestionStep />` selections to the main state to allow auto-advancing.
- [x] 3.3 Implement the "Back" functionality to revisit previous answers.
- [x] 3.4 Wire the final state submission to the `scoringEngine.ts` and pass the result to `<ResultView />`.

## 4. Polish & Optional Features

- [x] 4.1 Add CSS/Tailwind styling to ensure mobile-first responsiveness and generic "Typeform-like" UX.
- [x] 4.2 (Optional) Add a lead capture form step before rendering the final result. (Decided to just add the agendar button on result view for now).
- [x] 4.3 Add basic `sessionStorage` persistence so users don't lose progress on accidental refresh.
