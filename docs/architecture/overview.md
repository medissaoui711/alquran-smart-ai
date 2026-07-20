# Architecture Overview

## System Design
The application follows a **Client-Side Heavy (SPA)** architecture with a decoupled **Service Layer** for external data fetching.

### Core Pillars
1.  **State Management**: Handled by **Zustand**. We use a persistent store for user settings and a transient store for Quran data to optimize memory usage.
2.  **Service Layer**: Encapsulates all external API logic (Quran API and Gemini Pro).
3.  **UI Components**: Atomic design principles where possible, using a custom adaptive theme system.

## Folder Structure
- `src/components`: UI components organized by feature.
- `src/services`: Stateless functions for API communication.
- `src/store.ts`: Global state definitions.
- `src/types.ts`: Domain-specific TypeScript interfaces.

## Architectural Decisions (ADR)
- **ADR-001: Adaptive Theme System**: We use CSS variables synchronized with operative system preferences to provide a native-feeling dark/light experience.
- **ADR-002: Modular Store**: Instead of one giant store, we split logic into domain-specific hooks (Settings, UI, Quran).
