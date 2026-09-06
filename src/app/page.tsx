import { db } from "../prisma/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "./login/actions";
import { verifySession } from "../lib/auth";
import { seedLessonsAndVocabularyAction } from "./lessons/actions";
import WordOfTheDay from "./WordOfTheDay";
import MobileHeader from "./components/MobileHeader";
import UserProfileDropdown from "./components/UserProfileDropdown";
import { getPersonalizedLearningProfile } from "../lib/learning-engine";
import PersonalizedDashboardWidgets from "./components/PersonalizedDashboardWidgets";
import UserPanelShell from "./components/UserPanelShell";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? verifySession(userCookie) : null;
  if (!user) {
    redirect("/login");
  }

  // Seed default lessons & vocabulary if empty
  await seedLessonsAndVocabularyAction();

  const userName = user.name || "Sarah Jenkins";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SJ";

  let usersCount = 0;
  let connectionSuccess = false;
  let isAdmin = false;
  let dbUser: any = null;

  // Word of the day variables
  let wordOfTheDay = {
    id: 1,
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere.",
    partOfSpeech: "adjective",
    example: "Cell phones are ubiquitous in modern society.",
  };
  let wordSaved = false;

  try {
    const users = await db.orm.public.User.all();
    usersCount = users.length;
    connectionSuccess = true;

    dbUser = await db.orm.public.User.where({ email: user.email }).first();
    isAdmin = dbUser?.role === "admin";

    // Query word of the day from seeded DB
    const vocabularyList = await db.orm.public.Vocabulary.all();
    if (vocabularyList.length > 0) {
      const index = new Date().getDate() % vocabularyList.length;
      const dbWord = vocabularyList[index];
      wordOfTheDay = {
        id: dbWord.id,
        word: dbWord.word,
        definition: dbWord.definition,
        partOfSpeech: dbWord.partOfSpeech || "noun",
        example: dbWord.example || "",
      };

      if (dbUser) {
        const savedRecord = await db.orm.public.UserVocabularyProgress.where({
          userId: dbUser.id,
          vocabId: dbWord.id,
        }).first();
        wordSaved = !!savedRecord;
      }
    }
  } catch (error: any) {
    console.error("Failed to query dashboard metrics:", error);
  }

  // Fetch Phase 8 Personalized Profile
  const profile = await getPersonalizedLearningProfile(user.email);

  const realUserName = dbUser?.name || dbUser?.username || user.name || "Learner";
  const realUserEmail = dbUser?.email || user.email;
  const realUserLevel = profile?.level || dbUser?.level || "Beginner";
  const realUserInitials = realUserName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "US";

  return (
    <UserPanelShell
      activeNav="dashboard"
      userName={realUserName}
      userEmail={realUserEmail}
      userLevel={realUserLevel}
      userInitials={realUserInitials}
      isAdmin={isAdmin}
    >
      {/* Dashboard Content */}
      <div className="p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Phase 8 Personalized Dashboard Widgets */}
          {profile && <PersonalizedDashboardWidgets initialProfile={profile} />}

          {/* Feature Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
            {/* AI Voice Tutor Spotlight Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between border border-indigo-800 relative overflow-hidden lg:col-span-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider">
                      ✨ Two-Way Voice Speaking Tutor
                    </span>
                    <span className="text-xs text-indigo-200">
                      {profile?.nativeLanguage || "Hindi"} ➔ {profile?.targetLanguage || "English"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Practice Speaking With AI Audio Feedback</h2>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Speak your thought in your native language and the AI will immediately teach you the natural English expression, pronounce it aloud, and score your spoken pronunciation attempt!
                  </p>
                </div>
                <Link
                  href="/voice-conversation"
                  className="px-6 py-3.5 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-sm transition shadow-lg shrink-0 flex items-center gap-2"
                >
                  <span className="text-lg">🎙️</span>
                  Start Voice Practice
                </Link>
              </div>
            </div>

            {/* Chat with AI Tutor */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Adaptive AI Tutor</h3>
                  <p className="text-zinc-500 text-sm mt-1">
                    Personalized conversation practice with dynamic feedback targeting your identified weak grammar areas.
                  </p>
                </div>
              </div>
              <Link href="/ai-tutor" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition mt-6 dark:bg-indigo-600 dark:hover:bg-indigo-700 flex items-center justify-center">
                Start Chatting
              </Link>
            </div>

            {/* Sentence Improver */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center dark:bg-purple-950/30 dark:text-purple-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Sentence Improver</h3>
                  <p className="text-zinc-500 text-sm mt-1">Paste your writing and get real-time recommendations, synonyms, and natural corrections.</p>
                </div>
              </div>
              <Link href="/grammar-correction" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-xl text-sm transition mt-6 dark:bg-purple-600 dark:hover:bg-purple-700 flex items-center justify-center">
                Improve Now
              </Link>
            </div>

            {/* Word of the Day */}
            <WordOfTheDay
              word={wordOfTheDay.word}
              definition={wordOfTheDay.definition}
              partOfSpeech={wordOfTheDay.partOfSpeech}
              example={wordOfTheDay.example}
              initialSaved={wordSaved}
            />
          </div>

        </div>
    </UserPanelShell>
  );
}
