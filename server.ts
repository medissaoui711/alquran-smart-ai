import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Tafsir API route
  app.post("/api/tafsir", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const { prompt } = req.body;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);

      const details = error?.details || [];
      const retryInfo = details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
      const retryDelayStr = retryInfo ? retryInfo.retryDelay : null;
      const retryDelay = retryDelayStr ? parseFloat(retryDelayStr) : null;
      
      if (error?.status === 429 || error?.message?.includes("429") || error?.code === 429) {
        res.status(429).json({ 
          error: "لقد تجاوزت الحد المسموح للاستخدام المجاني، يرجى المحاولة لاحقاً.",
          retryDelay: retryDelay
        });
      } else {
        res.status(500).json({ error: "Failed to generate content" });
      }
    }
  });

  // Quran API proxy route using Express middleware app.use
  app.use("/api/quran", async (req, res) => {
    const targetUrl = `https://api.alquran.cloud/v1${req.url}`;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: `Quran API returned ${response.status}` });
      }
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Quran API Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch from Quran API" });
    }
  });

  // Vite middleware for development & static serving for production
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(process.cwd(), "public")));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use(express.static(path.join(process.cwd(), "public")));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
