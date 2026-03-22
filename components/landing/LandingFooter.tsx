import Image from "next/image";
import Link from "next/link";

const LINKS = {
  제품: [
    { label: "문의 분석하기", href: "/parse" },
    { label: "작동 방식", href: "/how-it-works" },
    { label: "무료 시작하기", href: "/signup" },
  ],
  회사: [
    { label: "DELO 소개", href: "/about" },
    { label: "피드백", href: "/dashboard" },
  ],
  법적: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export function LandingFooter() {
  return (
    <footer
      className="border-t px-6 py-12 transition-colors"
      style={{ borderColor: "var(--landing-border)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image src="/fox-icon.svg" width={22} height={22} alt="DELO" />
              <span
                className="text-base font-black tracking-tighter transition-colors"
                style={{ color: "var(--landing-accent, #a3a6ff)" }}
              >
                DELO
              </span>
            </Link>

            {/* Social */}
            <div className="mb-5 flex items-center gap-3">
              <a
                href="https://twitter.com/delo_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--landing-muted)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            <p className="text-xs transition-colors" style={{ color: "var(--landing-footer)" }}>
              © 2026 DELO
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h3
                className="mb-3 text-xs font-black uppercase tracking-widest transition-colors"
                style={{ color: "var(--landing-text)" }}
              >
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm transition-colors"
                      style={{ color: "var(--landing-muted)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
