import { QuranAPIResponse, Surah, SurahDetail } from '../types';
import { FALLBACK_SURAHS } from '../data/surahs';

const DIRECT_API_URL = 'https://api.alquran.cloud/v1';
const PROXY_API_URL = '/api/quran';

// In-memory cache
let surahListCache: Surah[] | null = null;
const surahDetailsCache = new Map<number, SurahDetail>();

// Helper to fetch JSON with automatic fallback between direct API and server proxy
async function fetchWithFallback<T>(path: string): Promise<T> {
  const urls = [
    `${DIRECT_API_URL}${path}`,
    `${PROXY_API_URL}${path}`
  ];

  let lastError: any = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${url}`);
      }
      const text = await response.text();
      // Ensure we received actual JSON and not an HTML fallback page (e.g., index.html on static deploys)
      if (text.trim().startsWith('<')) {
        throw new Error(`Received HTML instead of JSON from ${url}`);
      }
      const json = JSON.parse(text);
      if (json && (json.code === 200 || json.status === 'OK' || json.data)) {
        return json as T;
      }
      throw new Error(`Invalid JSON payload structure from ${url}`);
    } catch (err) {
      lastError = err;
      console.warn(`Fetch failed for ${url}:`, err);
    }
  }

  throw lastError || new Error(`All endpoints failed for path: ${path}`);
}

export const fetchSurahList = async (): Promise<Surah[]> => {
  if (surahListCache) return surahListCache;
  try {
    const json = await fetchWithFallback<QuranAPIResponse<Surah[]>>('/surah');
    if (json.data && Array.isArray(json.data) && json.data.length > 0) {
      surahListCache = json.data;
      return surahListCache;
    }
    throw new Error('Empty surah list data');
  } catch (error) {
    console.warn("Using embedded fallback surah list due to network error:", error);
    surahListCache = FALLBACK_SURAHS;
    return FALLBACK_SURAHS;
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<SurahDetail | null> => {
  if (surahDetailsCache.has(surahNumber)) {
    return surahDetailsCache.get(surahNumber)!;
  }
  
  try {
    // Attempt 1: Combined Uthmani script + Alafasy audio
    const path = `/surah/${surahNumber}/editions/quran-uthmani,ar.alafasy`;
    const json = await fetchWithFallback<any>(path);
    
    if (json.data && Array.isArray(json.data) && json.data.length >= 2) {
      const uthmaniData = json.data[0];
      const audioData = json.data[1];
      const mergedAyahs = uthmaniData.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        audio: audioData.ayahs?.[index]?.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
        audioSecondary: audioData.ayahs?.[index]?.audioSecondary || []
      }));
      const result: SurahDetail = {
        ...uthmaniData,
        ayahs: mergedAyahs
      };
      surahDetailsCache.set(surahNumber, result);
      return result;
    }

    if (json.data && json.data.ayahs) {
      const result: SurahDetail = json.data;
      surahDetailsCache.set(surahNumber, result);
      return result;
    }

    throw new Error("Unexpected surah detail response format");
  } catch (error) {
    console.warn(`Primary surah detail fetch failed for Surah ${surahNumber}, trying single edition fallback:`, error);
    
    // Attempt 2: Fallback to Uthmani text only, constructing audio URLs programmatically
    try {
      const singlePath = `/surah/${surahNumber}/quran-uthmani`;
      const json = await fetchWithFallback<QuranAPIResponse<any>>(singlePath);
      if (json.data && json.data.ayahs) {
        const uthmaniData = json.data;
        const mergedAyahs = uthmaniData.ayahs.map((ayah: any) => ({
          ...ayah,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
          audioSecondary: []
        }));
        const result: SurahDetail = {
          ...uthmaniData,
          ayahs: mergedAyahs
        };
        surahDetailsCache.set(surahNumber, result);
        return result;
      }
    } catch (fallbackError) {
      console.error(`All attempts failed to load Surah ${surahNumber}:`, fallbackError);
      throw fallbackError;
    }
  }

  return null;
};
