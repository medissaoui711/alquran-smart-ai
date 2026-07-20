// Cache keys prefix
const CACHE_KEY_PREFIX = 'gemini_cache_';

export const getSurahInsight = async (surahName: string, englishName: string, ayahCount: number): Promise<string> => {
  const cacheKey = `${CACHE_KEY_PREFIX}insight_${englishName}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `
      قدم ملخصاً روحانياً وتفسيرياً موجزاً لـ ${surahName}.
      عدد آياتها: ${ayahCount}.
      
      نظم الإجابة كالتالي باللغة العربية:
      1. المحاور الرئيسية (نقاط).
      2. سياق النزول (بإيجاز).
      3. درس مستفاد للحياة المعاصرة.
      
      اجعل الأسلوب محترماً، علمياً، وملهمًا. التنسيق: Markdown.
    `;

    const response = await fetch("/api/tafsir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify({ message: errorData.error || "Failed to fetch", retryDelay: errorData.retryDelay }));
    }
    const data = await response.json();
    
    const text = data.text || "لم يتم إنشاء محتوى.";
    
    // Save to cache
    if (data.text) {
        localStorage.setItem(cacheKey, text);
    }
    
    return text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    let errorMessage = "تعذر جلب التفسير في الوقت الحالي.";
    try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.message.includes("تجاوزت") || parsedError.retryDelay) {
            errorMessage = "لقد تجاوزت الحد المسموح للاستخدام المجاني حالياً. " + 
                (parsedError.retryDelay ? `يرجى المحاولة بعد ${Math.ceil(parsedError.retryDelay)} ثانية.` : "يرجى المحاولة لاحقاً.");
        }
    } catch (e) {
        if (error.message.includes("429") || error.message.includes("تجاوزت")) {
            errorMessage = "لقد تجاوزت الحد المسموح للاستخدام المجاني حالياً، يرجى المحاولة لاحقاً.";
        }
    }
    return errorMessage;
  }
};

export const getAyahExplanation = async (surahName: string, ayahNumber: number, ayahText: string): Promise<string> => {
  const cacheKey = `${CACHE_KEY_PREFIX}ayah_${surahName}_${ayahNumber}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `
      اشرح الآية التالية من ${surahName}، رقم الآية ${ayahNumber}:
      "${ayahText}"
      
      قدم تفسيراً موجزاً يوضح المعنى والحكمة منها باللغة العربية.
    `;

    const response = await fetch("/api/tafsir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify({ message: errorData.error || "Failed to fetch", retryDelay: errorData.retryDelay }));
    }
    const data = await response.json();
    
    const text = data.text || "لا يتوفر شرح حالياً.";

    // Save to cache
    if (data.text) {
        localStorage.setItem(cacheKey, text);
    }

    return text;
  } catch (error: any) {
    console.error("Gemini Ayah Error:", error);
    let errorMessage = "تعذر جلب الشرح.";
    try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.message.includes("تجاوزت") || parsedError.retryDelay) {
            errorMessage = "لقد تجاوزت الحد المسموح للاستخدام المجاني حالياً. " + 
                (parsedError.retryDelay ? `يرجى المحاولة بعد ${Math.ceil(parsedError.retryDelay)} ثانية.` : "يرجى المحاولة لاحقاً.");
        }
    } catch (e) {
        if (error.message.includes("429") || error.message.includes("تجاوزت")) {
            errorMessage = "لقد تجاوزت الحد المسموح للاستخدام المجاني حالياً، يرجى المحاولة لاحقاً.";
        }
    }
    return errorMessage;
  }
};
