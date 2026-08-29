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
      model: "gemini-3.6-flash",
      contents,
    });

    return response.text || "I'm sorry, I couldn't process that response.";
  } catch (error: any) {
    console.error("Gemini Tutor error:", error);
    
    // Provide a smart conversational fallback when Gemini is not configured
    const lower = message.toLowerCase();
    if (lower.includes("interview")) {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "Excellent! Let's practice a job interview. 💼 I will act as the interviewer. To start, tell me: what role are you applying for, and why are you interested in it?";
    }
    if (lower.includes("perfect") || lower.includes("tense")) {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "The **Present Perfect** tense connects the past to the present (e.g., 'I have lived here for 2 years'). It is formed by: **Subject + have/has + Past Participle**.\n\nTry writing a sentence in the Present Perfect about something you did today, and I will check it!";
    }
    if (lower.includes("have a") || lower.includes("she have")) {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "💡 **Grammar Corrections:**\n1. Use **'has'** with 'she' (third-person singular).\n   * *Incorrect:* 'She have'\n   * *Correct:* 'She has'\n\n**Improved Sentence:** *'She has a dog and she went to school yesterday.'*";
    }
    return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
           "Hello! I am your English Tutor. How can I help you practice your conversation, grammar, or vocabulary skills today?";
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
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "user", parts: [{ text: message }] }
      ],
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Assistant error:", error);
    
    // Fallback based on type
    if (promptType === "translate") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "🌐 **Translation Fallback:**\nHere is a translation helper suggestion:\n* *Input:* '" + message + "'\n* *English translation suggestion:* '" + message + "' (looks like it is ready, or try typing another phrase to translate).";
    }
    if (promptType === "email") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "✉️ **Email Draft Fallback:**\n\nSubject: Follow-up on LingoAI\n\nDear Team,\n\nI hope this email finds you well. I would like to check on our progress.\n\nBest regards,\nUser";
    }
    if (promptType === "summarize") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "📝 **Summarization Fallback:**\n* The text emphasizes practicing English using AI-assisted tools.\n* Daily consistent reading helps reinforce vocabulary memory.";
    }
    return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
           "Hello! I am your AI Writing Assistant. Please let me know if you would like to translate, draft an email, or summarize text.";
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
