import { db } from "../prisma/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  let usersCount = 0;
  let connectionSuccess = false;
  let errorMsg = "";

  try {
    const users = await db.orm.public.User.all();
    usersCount = users.length;
    connectionSuccess = true;
  } catch (error: any) {
    console.error("Failed to fetch users from database:", error);
    errorMsg = error?.message || String(error);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans p-6 dark:bg-zinc-950">
      <main className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl mb-4">
          English AI Boilerplate
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Welcome to your Next.js application, integrated with TypeScript, Tailwind CSS, PostgreSQL, and Prisma Next!
        </p>

        <div className="rounded-xl p-6 bg-zinc-50 border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800/80 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
            Database Status
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${connectionSuccess ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          </h2>
          {connectionSuccess ? (
            <div>
              <p className="text-green-700 dark:text-green-400 font-medium mb-2">Successfully connected to PostgreSQL!</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Number of registered users: <span className="font-bold text-zinc-800 dark:text-zinc-200">{usersCount}</span>
              </p>
            </div>
          ) : (
            <div>
              <p className="text-red-700 dark:text-red-400 font-medium mb-2">Connection failed.</p>
              <p className="text-xs font-mono bg-red-50 text-red-800 p-3 rounded-lg overflow-x-auto dark:bg-red-950/40 dark:text-red-300">
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Next.js Docs
          </a>
          <a
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            Tailwind Docs
          </a>
        </div>
      </main>
    </div>
  );
}
