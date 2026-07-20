# Feature Details

## Quran Reader (Mushaf)
The reader implements a "Continuous Scroll" Mushaf layout.
- **Responsive Paging**: Single page on mobile, double page on desktop.
- **Adaptive Typography**: Users can adjust font size and type dynamically.

## Gemini Tafsir
Integrated via `GeminiPanel.tsx`.
- **Context-Aware**: Sends the current Surah content to the model.
- **Streaming**: Supports real-time response rendering for a better UX.
- **Safety**: Uses moderate filtering for sensitive topics.
