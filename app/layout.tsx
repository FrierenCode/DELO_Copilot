import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Deal Copilot",
  description: "SaaS foundation for creator-brand deal operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
