import { ImageResponse } from "next/og";

export const alt = "DELO — 크리에이터 딜 관리 플랫폼";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Noto Sans KR — weight 700, for Korean text rendering
  const fontData = await fetch(
    "https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5CgmOelzI7bgWsWo.woff"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Noto Sans KR', sans-serif",
          padding: "80px",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "rgba(99, 102, 241, 0.35)",
              border: "2px solid rgba(99, 102, 241, 0.6)",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "42px",
            }}
          >
            🦊
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-3px",
            }}
          >
            DELO
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: "1.25",
            marginBottom: "28px",
          }}
        >
          크리에이터 딜 관리 플랫폼
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(199, 210, 254, 0.85)",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          브랜드 문의 분석 · 견적 산정 · 응답 초안 · 계약 관리
        </div>

        {/* CTA badge */}
        <div
          style={{
            marginTop: "56px",
            background: "rgba(99, 102, 241, 0.25)",
            border: "1.5px solid rgba(99, 102, 241, 0.55)",
            borderRadius: "100px",
            padding: "14px 36px",
            color: "#c7d2fe",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          무료로 시작하기
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
