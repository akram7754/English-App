"use server";

import { ai } from "../../lib/gemini";
import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";

export async function askTutorAction(history: { sender: "user" | "ai"; text: string }[], message: string) {
  if (!message) return "Please enter a message.";

  const systemInstruction = 
    `You are a friendly and encouraging English AI Tutor. Your goals are:\n` +
    `1. Help the user improve their English spelling, grammar, and pronunciation.\n` +
    `2. Analyze the user's message for grammar mistakes. If any errors are found, highlight them clearly under a "💡 **Grammar Corrections:**" section showing the incorrect text, explanation, and the corrected version.\n` +
    `3. Keep your conversational response natural, clear, and vocabulary-appropriate for an Intermediate English learner.\n` +
    `4. Suggest one follow-up question or scenario at the very end of your message to keep the conversation going.\n\n` +
    `Example output style:\n` +
    `"Hi there! Yes, let's practice.\n\n💡 **Grammar Corrections:**\n* *Incorrect:* 'She have'\n* *Correct:* 'She has' (use singular verbs with third-person pronoun 'she').\n\nNow, to continue, tell me about your day!"`;

  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return response.text || "I'm sorry, I couldn't process that response.";
  } catch (error: any) {
    console.error("Gemini Tutor error:", error);
    return "Failed to get AI response. Please make sure your GEMINI_API_KEY is configured.";
  }
}

export async function askAssistantAction(message: string, promptType: string) {
  if (!message) return "Please enter a message.";

  let systemInstruction = "You are a helpful AI writing assistant for English learners.";

  if (promptType === "translate") {
    systemInstruction = 
      "You are an English Translation Helper. Translate the user's input phrase into natural, clear English. " +
      "If the input is already in English, refine it to sound more native, and provide brief explanations of synonyms or idioms used.";
  } else if (promptType === "email") {
    systemInstruction = 
      "You are a Professional Email Drafting Helper. Help the user write a structured, professional email draft based on their input prompts. " +
      "Explain key professional phrases or formal phrasings used in your draft so they can learn.";
  } else if (promptType === "summarize") {
    systemInstruction = 
      "You are a Reading Summarization Helper. Summarize the user's input paragraph in clear, simple bullet-points. " +
      "Highlight 3 useful vocabulary words from the text and explain their meanings.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "user", parts: [{ text: message }] }
      ],
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Assistant error:", error);
    return "Failed to get AI Assistant response. Please check your GEMINI_API_KEY.";
  }
}

export async function saveAttemptAction(phrase: string, score: number, difficulty: string) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const status = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Practice";

    const attempt = await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase,
      score,
      difficulty,
      status,
      user: (u) => u.connect({ id: user.id }),
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error("Failed to save voice attempt:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getAttemptsAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return [];

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return [];

    // Query attempts from PostgreSQL
    const attempts = await db.orm.public.PracticeAttempt.where({ userId: user.id }).orderBy((m) => m.createdAt.desc()).all();
    return attempts;
  } catch (e) {
    console.error("Failed to query attempts:", e);
    return [];
  }
}
