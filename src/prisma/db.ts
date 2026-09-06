import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  console.error("FATAL: DATABASE_URL environment variable is missing or empty.");
}

export const db = postgres<Contract>({
  contractJson,
  url: databaseUrl || '',
});

/**
 * Safely verify database connectivity without logging passwords or secrets.
 */
export async function checkDatabaseHealth(): Promise<{ ok: boolean; error?: string }> {
  if (!databaseUrl) {
    return { ok: false, error: "DATABASE_URL environment variable is missing" };
  }
  try {
    // Quick probe using first user record
    await db.orm.public.User.first();
    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const safeMessage = message ? message.replace(/:[^:@]+@/, ':***@') : "Unknown database connection error";
    return { ok: false, error: safeMessage };
  }
}

