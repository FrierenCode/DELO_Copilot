import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://delo-app.com";
  const disallow = ["/dashboard/", "/api/", "/settings/", "/history/", "/onboarding/", "/deal/", "/auth/"];

  return {
    rules: [
      {
        // Yeti: 네이버 공식 크롤러. 명시적으로 허용/차단을 지정하면
        // 크롤 예산을 효율적으로 사용하고 네이버 색인 품질이 개선됩니다.
        userAgent: "Yeti",
        allow: ["/", "/parse", "/how-it-works", "/signup", "/login", "/terms", "/privacy"],
        disallow,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
