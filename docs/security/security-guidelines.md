# Security Guidelines

## API Keys
- Never commit `GEMINI_API_KEY` to version control.
- Use the AI Studio platform's environment variable management.

## Content Integrity
- The Quran text is fetched from reputable sources (AlQuran.cloud).
- AI-generated Tafsir is clearly labeled as "AI-generated" to ensure user awareness of potential hallucinations.

## Data Privacy
- User settings (theme, font size) and bookmarks are stored locally in the browser (`localStorage`) via Zustand persistence.
- No personal user data is sent to external servers except for the necessary Quran context for Gemini Tafsir requests.
