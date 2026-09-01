import { db } from "../prisma/db";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "./login/actions";
import { verifySession } from "../lib/auth";
import { seedLessonsAndVocabularyAction } from "./lessons/actions";
import WordOfTheDay from "./WordOfTheDay";
import MobileHeader from "./components/MobileHeader";
import { getPersonalizedLearningProfile } from "../lib/learning-engine";
import PersonalizedDashboardWidgets from "./components/PersonalizedDashboardWidgets";

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

    const dbUser = await db.orm.public.User.where({ email: user.email }).first();

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

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight text-white">English AI</span>
          </div>

          <nav className="space-y-1.5">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/voice-conversation" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition font-medium">
              <span className="text-base">🎙️</span>
              AI Voice Tutor
            </Link>
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              My Progress
            </Link>
            <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Tutor
            </Link>
            <Link href="/ai-chat" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </Link>
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Practice
            </Link>
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lessons / Skills
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Grammar Check
            </Link>
            <Link href="/speaking-score" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Speaking Score
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-left transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Logout / Exit
              </button>
            </form>
          </nav>
        </div>

        {/* Database Status Footer info */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionSuccess ? "bg-green-400" : "bg-red-400"}`} />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">{connectionSuccess ? "Learning Engine Active" : "DB Disconnected"}</p>
              <p className="opacity-75">{usersCount} system users</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <MobileHeader userName={userName} userInitials={userInitials} />
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/80 bg-white px-8 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800/80 shrink-0 hidden md:flex">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search lessons, vocabulary, grammar..."
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{userName}</p>
              <p className="text-xs text-zinc-400">Level: {profile?.level || "Beginner"}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {userInitials}
            </div>
          </div>
        </header>

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
      </main>
    </div>
  );
}
