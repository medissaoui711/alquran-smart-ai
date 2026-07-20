# Development Workflow

## Setup
1.  `npm install`: Install dependencies.
2.  `npm run dev`: Start Vite development server.
3.  Configure `GEMINI_API_KEY` in environment for AI features.

## Coding Standards
- **TypeScript**: Strict mode is enabled. Avoid `any`.
- **Styling**: Use the `theme-*` semantic classes defined in `index.css`.
- **RTL Support**: Use logical properties (padding-inline, margin-inline) where possible, or rely on the global `dir="rtl"` layout.
- **Components**: Prefer functional components and custom hooks for shared logic.

## AI Integration Policy
All AI features must follow the **AI Agent Project Constitution** (`tutti.toml`).
- Use the Interaction API for advanced Gemini capabilities.
- Always provide a fallback/loading state for AI responses.
