import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lingoai.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/lessons", "/voice-practice"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/profile",
          "/notifications",
          "/dashboard",
          "/achievements",
          "/recommendations",
          "/study-plan",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
