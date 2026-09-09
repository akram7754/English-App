import { cookies, headers } from "next/headers";

/**
 * Determines whether the current request is over a secure (HTTPS) connection.
 * 
 * Safely differentiates between:
 * 1. Real production HTTPS deployments (Vercel, AWS, Cloudflare, Nginx reverse proxy)
 *    where x-forwarded-proto === "https" or Origin/Referer is https://.
 * 2. Local LAN HTTP testing (e.g. http://192.168.254.53:3000) where mobile browsers
 *    strictly reject cookies marked with `Secure` over cleartext HTTP.
 * 3. Local desktop development (http://localhost:3000).
 */
export async function isRequestSecure(): Promise<boolean> {
  // Explicit administrative overrides if configured
  if (process.env.FORCE_SECURE_COOKIES === "true") return true;
  if (process.env.FORCE_INSECURE_COOKIES === "true") return false;

  // In development and test environments, default to insecure
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  try {
    const headerList = await headers();
    if (!headerList) return false;

    // 1. Check standard proxy protocol header (x-forwarded-proto)
    const proto = headerList.get("x-forwarded-proto");
    if (proto) {
      const firstProto = proto.split(",")[0].trim().toLowerCase();
      if (firstProto === "https") return true;
      if (firstProto === "http") return false;
    }

    // 2. Check x-forwarded-ssl header
    const ssl = headerList.get("x-forwarded-ssl")?.toLowerCase();
    if (ssl === "on") return true;

    // 3. Check RFC 7239 Forwarded header (e.g., proto=https)
    const forwarded = headerList.get("forwarded")?.toLowerCase();
    if (forwarded) {
      if (forwarded.includes("proto=https")) return true;
      if (forwarded.includes("proto=http")) return false;
    }

    // 4. Check Origin header (sent on POST/Server Actions by modern browsers)
    const origin = headerList.get("origin")?.toLowerCase();
    if (origin) {
      if (origin.startsWith("https://")) return true;
      if (origin.startsWith("http://")) return false;
    }

    // 5. Check Referer header (fallback if origin is absent)
    const referer = headerList.get("referer")?.toLowerCase();
    if (referer) {
      if (referer.startsWith("https://")) return true;
      if (referer.startsWith("http://")) return false;
    }

    // 6. Check canonical APP_URL or NEXT_PUBLIC_APP_URL if defined
    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").toLowerCase();
    if (appUrl.startsWith("https://")) return true;
    if (appUrl.startsWith("http://")) return false;

    // 7. Check Host header: If host is an IP address or localhost, it's a direct LAN HTTP connection
    const host = headerList.get("host")?.toLowerCase() || "";
    const isIpOrLocalhost = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(host) || host.startsWith("localhost");
    if (isIpOrLocalhost) {
      return false;
    }

    // Default to true in production for domains
    return true;
  } catch {
    // Outside request scope (e.g. standalone scripts or CLI test runners)
    return false;
  }
}

export interface SessionCookieOptions {
  path: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
}

/**
 * Returns canonical session cookie options with dynamically resolved `secure` flag.
 */
export async function getSessionCookieOptions(): Promise<SessionCookieOptions> {
  const secure = await isRequestSecure();
  return {
    path: "/",
    maxAge: 86400 * 7, // 7 days
    httpOnly: true,
    secure,
    sameSite: "lax",
  };
}

/**
 * Sets the "user" session cookie using standardized options.
 */
export async function setSessionCookie(sessionToken: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const options = await getSessionCookieOptions();
    cookieStore.set("user", sessionToken, options);
  } catch (cookieErr: unknown) {
    const message = cookieErr instanceof Error ? cookieErr.message : String(cookieErr);
    if (message.includes("outside a request scope")) {
      // Safe fallback in standalone test contexts
    } else {
      throw cookieErr;
    }
  }
}

/**
 * Deletes the "user" session cookie.
 */
export async function deleteSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("user");
  } catch (cookieErr: unknown) {
    const message = cookieErr instanceof Error ? cookieErr.message : String(cookieErr);
    if (message.includes("outside a request scope")) {
      // Safe fallback in standalone test contexts
    } else {
      throw cookieErr;
    }
  }
}
