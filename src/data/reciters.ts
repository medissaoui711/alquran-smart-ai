export interface Reciter {
  id: string;
  name: string;
  subtext: string;
  type: 'surah' | 'ayah';
  getSurahAudioUrl?: (surahNum: number) => string;
  getAyahAudioUrl?: (surahNum: number, ayahNum: number) => string;
}

const pad = (n: number, len: number) => String(n).padStart(len, '0');

export const RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    name: 'مشاري راشد العفاسي',
    subtext: 'تلاوة آية بآية (تزامن دقيق 100%)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Alafasy_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    subtext: 'المصحف المرتل (تزامن آية بآية)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Minshawy_Murattal_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    subtext: 'المصحف المرتل (تزامن آية بآية)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    subtext: 'المصحف المرتل (تزامن آية بآية)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Husary_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'maher',
    name: 'ماهر المعيقلي',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/MaherAlMuaiqly128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Saood_ash-Shuraym_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'ghamdi',
    name: 'سعد الغامدي',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Ghamadi_40kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Abu_Bakr_Shatri_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'dosari',
    name: 'ياسر الدوسري',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'hudhaify',
    name: 'علي الحذيفي',
    subtext: 'تلاوة آية بآية (تزامن دقيق)',
    type: 'ayah',
    getAyahAudioUrl: (surahNum: number, ayahNum: number) => 
      `https://everyayah.com/data/Hudhaify_128kbps/${pad(surahNum, 3)}${pad(ayahNum, 3)}.mp3`
  },
  {
    id: 'alaa_aql',
    name: 'علاء عقل',
    subtext: 'تلاوة خاشعة مرتلة (سورة كاملة)',
    type: 'surah',
    getSurahAudioUrl: (surahNum: number) => `https://archive.org/download/AlaaAql/${pad(surahNum, 3)}.mp3`
  }
];

export const DEFAULT_RECITER_ID = 'alafasy';

export function getReciterById(id: string): Reciter {
  return RECITERS.find(r => r.id === id) || RECITERS[0];
}
