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
      // Try to parse error details if available
      const details = error?.details || [];
      const retryInfo = details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
      const retryDelayStr = retryInfo ? retryInfo.retryDelay : null;
      // retryDelayStr might be in "43s" format
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
