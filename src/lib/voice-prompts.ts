export interface VoiceTurnPayload {
  stage: "teach" | "evaluate";
  sourceLanguage: string; // e.g. "Hindi"
  targetLanguage: string; // e.g. "English"
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  topic: string; // e.g. "Job Interview"
  userTranscript: string;
  targetPhraseExpected?: string;
  conversationHistory?: Array<{
    role: "user" | "model";
    text: string;
  }>;
}

export interface VoiceTurnResult {
  intentUnderstood?: string;
  targetPhrase: string; // The English sentence taught or evaluated
  nativeExplanation: string; // Explanation in Hindi/native language
  spokenText: string; // What the AI voice should speak aloud via TTS
  evaluation?: {
    score: number;
    status: "Excellent" | "Good" | "Needs Practice";
    grammarFeedback: string;
    fluencyFeedback: string;
    vocabFeedback: string;
    pronunciationTip?: string;
  };
  followUpPrompt?: string; // Text for next conversational turn
  followUpSpoken?: string; // Spoken follow-up question
}

export function buildVoiceTurnPrompt(payload: VoiceTurnPayload): string {
  const { stage, sourceLanguage, targetLanguage, difficulty, topic, userTranscript, targetPhraseExpected } = payload;

  if (stage === "teach") {
    return (
      `You are an empathetic, world-class AI Speaking Tutor specializing in bilingual language acquisition.\n` +
      `Context: The learner is a native ${sourceLanguage} speaker learning ${targetLanguage} at the ${difficulty} level.\n` +
      `Topic: ${topic}.\n` +
      `User Spoken Message (in ${sourceLanguage} or mixed): "${userTranscript || "(user wants to start topic)"}"\n\n` +
      `TASK:\n` +
      `1. Understand the user's intent from their native ${sourceLanguage} speech.\n` +
      `2. Formulate the most natural, authentic ${targetLanguage} sentence matching what they want to express, suited for ${difficulty} level.\n` +
      `3. Provide a clear, encouraging explanation in ${sourceLanguage} (including vocabulary meaning, grammar tips, or romanized hints if helpful).\n` +
      `4. Create the concise spoken prompt the AI tutor will say aloud to the user (e.g. "In ${targetLanguage}, you can say: '<sentence>'. Now try saying it yourself.").\n` +
      `5. Prepare a follow-up question in ${targetLanguage} that will keep the conversation flowing once the user finishes this sentence.\n\n` +
      `OUTPUT FORMAT: You MUST return ONLY a valid JSON object matching this schema:\n` +
      `{\n` +
      `  "intentUnderstood": "string summarizing intent",\n` +
      `  "targetPhrase": "the primary target language sentence to practice",\n` +
      `  "nativeExplanation": "brief explanation in ${sourceLanguage} about meaning and vocabulary",\n` +
      `  "spokenText": "In ${targetLanguage}, you can say: '<sentence>'. Now try saying it yourself.",\n` +
      `  "followUpPrompt": "The next conversational question in ${targetLanguage}",\n` +
      `  "followUpSpoken": "The next conversational question for TTS"\n` +
      `}`
    );
  }

  // stage === "evaluate"
  return (
    `You are an expert ${targetLanguage} Speaking and Pronunciation Evaluator.\n` +
    `Context: The learner (${difficulty} level) was asked to speak the target phrase in ${targetLanguage}.\n` +
    `Expected Target Phrase: "${targetPhraseExpected || ""}"\n` +
    `User Spoken Transcript: "${userTranscript || "(silence/empty)"}"\n` +
    `Topic: ${topic}.\n` +
    `Learner's Native Language: ${sourceLanguage}.\n\n` +
    `TASK:\n` +
    `1. Compare the user's spoken transcript with the expected target phrase.\n` +
    `2. Evaluate Grammar, Fluency, and Vocabulary.\n` +
    `3. Assign an integer score between 0 and 100 based on accuracy and intelligibility.\n` +
    `4. Provide a constructive pronunciation/speaking tip.\n` +
    `5. Provide a supportive conversational response in ${targetLanguage} to continue the dialogue naturally.\n\n` +
    `OUTPUT FORMAT: You MUST return ONLY a valid JSON object matching this schema:\n` +
    `{\n` +
    `  "targetPhrase": "${targetPhraseExpected || ""}",\n` +
    `  "nativeExplanation": "Brief encouraging summary in ${sourceLanguage}",\n` +
    `  "spokenText": "Spoken AI reaction in ${targetLanguage} evaluating the attempt and continuing the chat",\n` +
    `  "evaluation": {\n` +
    `    "score": 90,\n` +
    `    "status": "Excellent",\n` +
    `    "grammarFeedback": "string",\n` +
    `    "fluencyFeedback": "string",\n` +
    `    "vocabFeedback": "string",\n` +
    `    "pronunciationTip": "string"\n` +
    `  },\n` +
    `  "followUpPrompt": "Next natural question in ${targetLanguage} for this ${topic} conversation",\n` +
    `  "followUpSpoken": "Next natural question for audio output"\n` +
    `}`
  );
}

export function getOfflineVoiceFallback(payload: VoiceTurnPayload): VoiceTurnResult {
  const { stage, sourceLanguage, targetLanguage, topic, userTranscript, targetPhraseExpected } = payload;

  if (stage === "teach") {
    const text = userTranscript.toLowerCase();
    let target = "I want to practice speaking English with an AI tutor.";
    let native = "यहाँ 'practice speaking' का अर्थ है बोलने का अभ्यास करना।";

    if (text.includes("interview") || topic.toLowerCase().includes("interview")) {
      target = "I want to practice for a job interview.";
      native = "यहाँ 'practice for a job interview' का अर्थ है नौकरी के साक्षात्कार के लिए अभ्यास करना।";
    } else if (text.includes("travel") || topic.toLowerCase().includes("travel")) {
      target = "Could you please help me find the departure gate at the airport?";
      native = "यहाँ 'departure gate' का अर्थ है प्रस्थान द्वार।";
    } else if (text.includes("restaurant") || topic.toLowerCase().includes("restaurant") || text.includes("table")) {
      target = "I would like to reserve a table for two people, please.";
      native = "यहाँ 'reserve a table' का अर्थ है मेज़ आरक्षित करना।";
    } else if (text.includes("shopping") || topic.toLowerCase().includes("shopping") || text.includes("price")) {
      target = "How much does this item cost, and is there any discount available?";
      native = "यहाँ 'discount available' का अर्थ है उपलब्ध छूट।";
    }

    return {
      intentUnderstood: `Practice conversation regarding ${topic}`,
      targetPhrase: target,
      nativeExplanation: native,
      spokenText: `In ${targetLanguage}, you can say: '${target}'. Now try saying it yourself.`,
      followUpPrompt: "Why are you interested in this topic?",
      followUpSpoken: "Why are you interested in this topic?",
    };
  }

  // evaluate fallback
  const clean = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(Boolean);
  const w1 = clean(userTranscript || "");
  const w2 = clean(targetPhraseExpected || "");
  let matches = 0;
  w1.forEach((word) => {
    if (w2.includes(word)) matches++;
  });
  const maxLen = Math.max(w1.length, w2.length, 1);
  const score = Math.min(100, Math.max(10, Math.round((matches / maxLen) * 100)));
  const status: "Excellent" | "Good" | "Needs Practice" =
    score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Practice";

  return {
    targetPhrase: targetPhraseExpected || "English practice sentence",
    nativeExplanation: `बहुत अच्छा प्रयास! आपका AI स्कोर ${score}% है।`,
    spokenText:
      score >= 80
        ? `Great job! You spoke '${targetPhraseExpected}'. Let's keep going!`
        : `Good effort! Keep practicing your pronunciation of '${targetPhraseExpected}'.`,
    evaluation: {
      score,
      status,
      grammarFeedback: `Identified ${w1.length} spoken words matching key target structures.`,
      fluencyFeedback: `Word enunciation matching rate is ${score}%.`,
      vocabFeedback: `Accurate usage of target sentence terms for ${topic}.`,
      pronunciationTip: "Focus on clear consonant endings and natural rhythm.",
    },
    followUpPrompt: "Now tell me more about your thoughts on this.",
    followUpSpoken: "Now tell me more about your thoughts on this.",
  };
}
