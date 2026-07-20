// Place API mocks and MSW handlers here
import { vi } from 'vitest';

export const mockGeminiResponse = (text: string) => ({
  response: {
    text: () => text
  }
});
