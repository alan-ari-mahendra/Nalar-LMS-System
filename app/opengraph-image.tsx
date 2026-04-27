import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Learnify — Precision in Learning"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#a78bfa",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#0a0012",
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.04em",
            }}
          >
            Learnify
          </div>
        </div>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#fafafa",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "24px",
            display: "flex",
          }}
        >
          Precision in Learning
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          High-quality online courses from industry experts.
        </div>
      </div>
    ),
    size
  )
}
