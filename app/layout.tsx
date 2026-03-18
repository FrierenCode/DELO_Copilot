import type { Metadata } from "next";
import "./globals.css";
import { RootNav } from "@/components/RootNav";
import { RootMain } from "@/components/RootMain";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Creator Deal Copilot",
  description: "Manage creator-brand deals from inquiry to payout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PUBLIC_ENV__ = ${JSON.stringify(publicEnv)};
try {
  var savedTheme = window.localStorage.getItem("landing-theme");
  document.documentElement.dataset.landingTheme =
    savedTheme === "light" ? "light" : "dark";
} catch (e) {
  document.documentElement.dataset.landingTheme = "dark";
}`,
          }}
        />
        {/*
         * RootNav hides itself on /dashboard/** routes (dashboard has its own sidebar).
         * RootMain removes the max-w-3xl constraint on /dashboard/** routes so the
         * dashboard layout can use the full viewport width.
         */}
        <RootNav />
        <RootMain>{children}</RootMain>
        <CookieBanner />
      </body>
    </html>
  );
}
