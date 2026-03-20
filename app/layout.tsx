import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { RootNav } from "@/components/RootNav";
import { RootMain } from "@/components/RootMain";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "DELO Copilot",
  description: "Manage creator-brand deals from inquiry to payout.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
            __html: `window.__PUBLIC_ENV__ = ${JSON.stringify(publicEnv)};`,
          }}
        />
        {/*
         * RootNav hides itself on /dashboard/** routes (dashboard has its own sidebar).
         * RootMain removes the max-w-3xl constraint on /dashboard/** routes so the
         * dashboard layout can use the full viewport width.
         */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KG22W3GSS1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KG22W3GSS1');
          `}
        </Script>
        <RootNav />
        <RootMain>{children}</RootMain>
        <CookieBanner />
      </body>
    </html>
  );
}
