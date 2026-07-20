# Testing Strategy

## Overview
We employ a "Testing Trophy" approach, prioritizing integration and component tests for the highest ROI.

### Test Layers
1.  **Unit Tests (`tests/unit`)**: Pure functions, store logic, and service helpers.
2.  **Component Tests (`tests/components`)**: UI rendering and interaction logic using Vitest + RTL.
3.  **Integration Tests (`tests/integration`)**: Testing the data flow between stores and services.
4.  **E2E Tests (`tests/e2e`)**: Critical user paths (e.g., "User opens Surah and asks Gemini for Tafsir").

## Coverage Goals
- Store Logic: 90%
- Services: 80%
- Critical UI: 70%

## Commands
- `npm run test`: Run Vitest in watch mode.
- `npm run test:ui`: Open Vitest UI dashboard.
- `npm run coverage`: Generate coverage report.
