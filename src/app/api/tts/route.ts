import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim();
  const lang = (searchParams.get("lang") || "ar").toLowerCase().split("-")[0];

  if (!text) {
    return new NextResponse("Missing text parameter", { status: 400 });
  }

  // Sanitize text: collapse newlines, strip markdown, cap length to prevent abuse
  const cleanText = text
    .replace(/[\r\n]+/g, " ")
    .replace(/[*_~`#]/g, "")
    .trim();
  const safeText = cleanText.slice(0, 300);

  try {
    const encodedText = encodeURIComponent(safeText);
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;

    const res = await fetch(googleTTSUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!res.ok) {
      return new NextResponse("TTS upstream fetch failed", { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[API TTS Error]:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
