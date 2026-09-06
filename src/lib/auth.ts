import bcrypt from "bcryptjs";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "fallback-secret-key-32-chars-long-minimum-for-english-ai";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: any): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex");
  return `${Buffer.from(data).toString("base64")}.${signature}`;
}

export function verifySession(token: string): any {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  
  const [dataBase64, signature] = parts;
  try {
    const data = Buffer.from(dataBase64, "base64").toString("utf-8");
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest("hex");
    
    if (signature === expectedSignature) {
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore error
  }
  return null;
}

/**
 * Generates a cryptographically strong random hex token for password resets.
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes a SHA-256 hash of the reset token for secure database storage.
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

