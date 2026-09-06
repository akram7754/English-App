import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Gemini calls will fail.");
}

export const ai = new GoogleGenAI({
  apiKey,
});

export async function callGeminiFast(params: {
  contents: string | object[];
  config?: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<string> {
  const models = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite"];
  const timeoutMs = params.timeoutMs || 9500;

  for (const model of models) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        ...(params.config ? { config: params.config } : {}),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("CALL_TIMEOUT")), timeoutMs)
      );
      const res = (await Promise.race([callPromise, timeoutPromise])) as { text?: string };
      if (res?.text) return res.text;
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(`[Gemini Fast] Model ${model} failed or timed out (${errMsg}), attempting next...`);
    }
  }
  throw new Error("ALL_MODELS_FAILED");
}
