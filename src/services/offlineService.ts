import { SurahDetail } from '../types';
import { getReciterById } from '../data/reciters';

const DB_NAME = 'MushafOfflineDB';
const DB_VERSION = 1;
const SURAH_STORE = 'surahDetails';
const AUDIO_CACHE_NAME = 'audio-v1';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SURAH_STORE)) {
        db.createObjectStore(SURAH_STORE, { keyPath: 'number' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save surah text and structure to IndexedDB
 */
export async function saveSurahToDB(surahDetail: SurahDetail): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readwrite');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.put(surahDetail);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save surah to IndexedDB:', err);
  }
}

/**
 * Get surah text from IndexedDB
 */
export async function getSurahFromDB(surahNumber: number): Promise<SurahDetail | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readonly');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.get(surahNumber);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get surah from IndexedDB:', err);
    return null;
  }
}

/**
 * Check if audio for a surah/reciter is cached
 */
export async function isAudioCached(url: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const match = await cache.match(url);
    return !!match;
  } catch (err) {
    return false;
  }
}

/**
 * Check if a surah is fully available offline (text + audio)
 */
export async function isSurahOfflineReady(surahNumber: number, reciterId: string): Promise<boolean> {
  const surahDetail = await getSurahFromDB(surahNumber);
  if (!surahDetail) return false;

  const reciter = getReciterById(reciterId);
  if (reciter.type === 'surah' && reciter.getSurahAudioUrl) {
    const audioUrl = reciter.getSurahAudioUrl(surahNumber);
    return await isAudioCached(audioUrl);
  } else if (reciter.type === 'ayah' && reciter.getAyahAudioUrl) {
    // Check first and last ayah audio
    const firstUrl = reciter.getAyahAudioUrl(surahNumber, 1);
    return await isAudioCached(firstUrl);
  }
  
  return true;
}

/**
 * Download Surah (Text + Audio) for Offline Access with Progress Callback
 */
export async function downloadSurahForOffline(
  surahDetail: SurahDetail,
  reciterId: string,
  onProgress?: (progress: number, label: string) => void
): Promise<void> {
  if (onProgress) onProgress(5, 'جاري حفظ النص القرآني...');

  // 1. Save text to IndexedDB
  await saveSurahToDB(surahDetail);
  if (onProgress) onProgress(20, 'تم حفظ النص! جاري تجهيز الملفات الصوتية...');

  if (!('caches' in window)) {
    if (onProgress) onProgress(100, 'تم حفظ النص (التخزين الصوتي غير مدعوم للمتصفح)');
    return;
  }

  const reciter = getReciterById(reciterId);
  const audioCache = await caches.open(AUDIO_CACHE_NAME);

  if (reciter.type === 'surah' && reciter.getSurahAudioUrl) {
    const audioUrl = reciter.getSurahAudioUrl(surahDetail.number);
    if (onProgress) onProgress(35, `جاري تحميل التلاوة الصوتية (${reciter.name})...`);

    try {
      const response = await fetch(audioUrl);
      if (response.ok || response.status === 206) {
        await audioCache.put(audioUrl, response.clone());
        if (onProgress) onProgress(100, `تم تحميل سورة ${surahDetail.name} بنجاح للأوفلاين!`);
      } else {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (err) {
      console.warn('Audio download error:', err);
      if (onProgress) onProgress(100, `تم حفظ النص (فشل تحميل الصوت: ${err instanceof Error ? err.message : 'خطأ شبكة'})`);
    }
  } else if (reciter.type === 'ayah' && reciter.getAyahAudioUrl) {
    const totalAyahs = surahDetail.ayahs.length;
    let completed = 0;

    for (const ayah of surahDetail.ayahs) {
      const url = reciter.getAyahAudioUrl(surahDetail.number, ayah.numberInSurah);
      try {
        const cached = await audioCache.match(url);
        if (!cached) {
          const res = await fetch(url);
          if (res.ok) {
            await audioCache.put(url, res.clone());
          }
        }
      } catch (e) {
        console.warn('Error caching ayah audio:', url, e);
      }
      completed++;
      const currentPercent = Math.min(99, 20 + Math.round((completed / totalAyahs) * 78));
      if (onProgress) {
        onProgress(currentPercent, `جاري تحميل الآية ${completed} من ${totalAyahs}...`);
      }
    }

    if (onProgress) onProgress(100, `تم تحميل سورة ${surahDetail.name} بالكامل للأوفلاين!`);
  }
}

/**
 * Remove downloaded offline audio and text for a surah
 */
export async function deleteOfflineSurah(surahNumber: number, reciterId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(SURAH_STORE, 'readwrite');
    tx.objectStore(SURAH_STORE).delete(surahNumber);

    if ('caches' in window) {
      const reciter = getReciterById(reciterId);
      const audioCache = await caches.open(AUDIO_CACHE_NAME);

      if (reciter.type === 'surah' && reciter.getSurahAudioUrl) {
        await audioCache.delete(reciter.getSurahAudioUrl(surahNumber));
      } else if (reciter.type === 'ayah' && reciter.getAyahAudioUrl) {
        // Remove ayah files
        const keys = await audioCache.keys();
        const padSurah = String(surahNumber).padStart(3, '0');
        for (const key of keys) {
          if (key.url.includes(padSurah)) {
            await audioCache.delete(key);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error deleting offline surah:', err);
  }
}

/**
 * Get total list of stored surah IDs in IndexedDB
 */
export async function getOfflineSurahNumbers(): Promise<number[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SURAH_STORE, 'readonly');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve((req.result as number[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}
