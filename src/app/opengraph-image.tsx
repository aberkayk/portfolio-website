import { ImageResponse } from "next/og";

export const alt = "Ahmet Berkay Koçak — Software Engineer & Hybrid Athlete";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0A0A0A",
          color: "#F2F2F2",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#0A0A0A" />
            <path
              d="M8 18.5 L16 9.5 L24 18.5"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 24.5 H21.5"
              fill="none"
              stroke="#8C8C8C"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700 }}>
            ABK
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
          Ahmet Berkay Koçak
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#A3A3A3",
            marginTop: 16,
          }}
        >
          Software Engineer &amp; Hybrid Athlete
        </div>
      </div>
    ),
    { ...size }
  );
}
