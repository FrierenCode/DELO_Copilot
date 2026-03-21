import { ImageResponse } from "next/og";

export const alt = "DELO | Creator Deal Copilot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, rgb(30, 27, 75) 0%, rgb(49, 46, 129) 55%, rgb(67, 56, 202) 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "18px",
              background: "rgba(99, 102, 241, 0.35)",
              border: "2px solid rgba(99, 102, 241, 0.6)",
              fontSize: "40px",
            }}
          >
            D
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "-3px",
            }}
          >
            DELO
          </div>
        </div>

        <div
          style={{
            fontSize: "52px",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "24px",
          }}
        >
          Creator Deal Copilot
        </div>

        <div
          style={{
            fontSize: "28px",
            textAlign: "center",
            color: "rgba(199, 210, 254, 0.9)",
            lineHeight: 1.5,
          }}
        >
          Brand inquiry parsing, quote guidance, reply drafts, and deal tracking
        </div>
      </div>
    ),
    size
  );
}
