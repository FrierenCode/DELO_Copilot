import Image from "next/image";
import Link from "next/link";

const LINKS = [
  {
    title: "제품",
    links: [
      { label: "문의 분석하기", href: "/parse" },
      { label: "작동 방식", href: "/how-it-works" },
      { label: "가격", href: "/pricing" },
      { label: "무료 시작하기", href: "/signup" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "DELO 소개", href: "/about" },
      { label: "피드백", href: "/dashboard" },
    ],
  },
  {
    title: "법적",
    links: [
      { label: "이용약관", href: "/terms" },
      { label: "개인정보처리방침", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      className="border-t px-6 py-8 transition-colors"
      style={{
        backgroundColor: "var(--footer-bg)",
        borderColor: "var(--footer-border)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 w-full md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image src="/fox-icon.svg" width={22} height={22} alt="DELO" />
              <span
                className="text-base font-black"
                style={{ color: "var(--footer-brand)" }}
              >
                DELO
              </span>
            </Link>
            <div className="mb-5">
              <a
                href="https://twitter.com/delo_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="transition-colors hover:opacity-70"
                style={{ color: "var(--footer-icon)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <p className="text-xs" style={{ color: "var(--footer-copy)" }}>
              © 2026 DELO
            </p>
          </div>

          {/* Link columns */}
          {LINKS.map(({ title, links }) => (
            <div key={title}>
              <h3
                className="mb-3 text-xs font-black uppercase tracking-widest"
                style={{ color: "var(--footer-heading)" }}
              >
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="site-footer-link text-sm">
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
