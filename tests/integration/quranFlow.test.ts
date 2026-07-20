import { describe, it, expect } from 'vitest';
import { fetchSurahList } from '../../src/services/quranService';

// We mock the fetch for service tests
global.fetch = vi.fn();

describe('Quran Service', () => {
  it('should fetch surah list successfully', async () => {
    const mockSurahs = {
      data: [
        { number: 1, name: 'سُورَةُ ٱلْفَاتِحَةِ', englishName: 'Al-Fatiha' }
      ]
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockSurahs,
    });

    const result = await fetchSurahList();
    expect(result).toEqual(mockSurahs.data);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/surah'));
  });

  it('should handle API errors gracefully', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    });

    await expect(fetchSurahList()).rejects.toThrow();
  });
});
