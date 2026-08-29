"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { ai } from "../../lib/gemini";

export async function getAttemptsAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return [];

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return [];

    // Query attempts from PostgreSQL
    const attempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();
    return attempts;
  } catch (error) {
    console.error("Failed to query voice practice attempts:", error);
    return [];
  }
}

export async function analyzeSpeakingAction(
  targetPhrase: string,
  userTranscript: string,
  difficulty: string
) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const prompt = 
      `You are an expert English Pronunciation and Speaking Evaluator.\n\n` +
      `Target Phrase: "${targetPhrase}"\n` +
      `User Spoken Transcript: "${userTranscript || '(silent or empty)'}"\n\n` +
      `Evaluate the speaking attempt. Identify:\n` +
      `1. Grammar Feedback: Any additions, omissions, or structural issues.\n` +
      `2. Fluency Feedback: Evaluate flow, substitutions, omissions of target words.\n` +
      `3. Vocabulary Feedback: Comments on vocabulary usage and alternatives if applicable.\n` +
      `4. Structured Score: Output an integer score between 0 and 100 based on accuracy matching the target phrase.\n\n` +
      `IMPORTANT: Your output MUST be a valid JSON object matching the following structure:\n` +
      `{\n` +
      `  "score": number,\n` +
      `  "grammar": "detailed string feedback",\n` +
      `  "fluency": "detailed string feedback",\n` +
      `  "vocab": "detailed string feedback"\n` +
      `}`;

    let result = {
      score: 50,
      grammar: "Please speak clearly into the microphone.",
      fluency: "Unable to detect speech stream.",
      vocab: "No vocabulary analysis possible."
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleanJSON = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJSON);
      if (typeof parsed.score === "number") result.score = parsed.score;
      if (parsed.grammar) result.grammar = parsed.grammar;
      if (parsed.fluency) result.fluency = parsed.fluency;
      if (parsed.vocab) result.vocab = parsed.vocab;
    } catch (apiError) {
      console.error("Gemini analysis error, using similarity calculation fallback:", apiError);
      const clean = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/).filter(Boolean);
      const w1 = clean(userTranscript);
      const w2 = clean(targetPhrase);
      let matches = 0;
      w1.forEach(word => { if (w2.includes(word)) matches++; });
      const fallbackScore = Math.round((matches / Math.max(w1.length, w2.length)) * 100) || 0;
      
      result.score = fallbackScore;
      result.grammar = `Offline Fallback: Spoke ${w1.length} words out of ${w2.length} target words.`;
      result.fluency = `Offline Fallback: Word match rate is ${fallbackScore}%.`;
      result.vocab = `Offline Fallback: Target phrase difficulty is ${difficulty}.`;
    }

    const status = result.score >= 90 ? "Excellent" : result.score >= 75 ? "Good" : "Needs Practice";

    const attempt = await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase: targetPhrase,
      score: result.score,
      difficulty,
      status,
      transcript: userTranscript,
      grammarFeedback: result.grammar,
      fluencyFeedback: result.fluency,
      vocabFeedback: result.vocab,
    });

    return { success: true, attempt };
  } catch (error: any) {
    console.error("Failed in analyzeSpeakingAction:", error);
    return { success: false, error: error.message || "Database action error" };
  }
}
