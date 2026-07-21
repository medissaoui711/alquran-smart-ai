import { QuranAPIResponse, Surah, SurahDetail } from '../types';

const BASE_URL = '/api/quran';

// In-memory cache
const surahListCache: Surah[] | null = null;
const surahDetailsCache = new Map<number, SurahDetail>();

export const fetchSurahList = async (): Promise<Surah[]> => {
  if (surahListCache) return surahListCache;

  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error('Failed to fetch Surah list');
    const json: QuranAPIResponse<Surah[]> = await response.json();
    return json.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<SurahDetail | null> => {
  if (surahDetailsCache.has(surahNumber)) {
    return surahDetailsCache.get(surahNumber)!;
  }

  try {
    // Fetching with audio and Uthmani script
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,ar.alafasy`);
    if (!response.ok) throw new Error('Failed to fetch Surah details');
    
    // The API returns an array of editions in the data field for this endpoint structure
    const json = await response.json();
    
    // We merge the text from index 0 (Uthmani) and audio from index 1 (Alafasy)
    const uthmaniData = json.data[0];
    const audioData = json.data[1];

    const mergedAyahs = uthmaniData.ayahs.map((ayah: any, index: number) => ({
      ...ayah,
      audio: audioData.ayahs[index].audio,
      audioSecondary: audioData.ayahs[index].audioSecondary
    }));

    const result = {
      ...uthmaniData,
      ayahs: mergedAyahs
    };

    // Save to cache
    surahDetailsCache.set(surahNumber, result);

    return result;

  } catch (error) {
    console.error(error);
    throw error;
  }
};