import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon: the CurrentKosh mark (open book + live dot) on the brand blue.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#4f46e5" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M7 11.2c3-1.4 6.1-1.2 9 .9 2.9-2.1 6-2.3 9-.9v11.1c-3-1.4-6.1-1.2-9 .9-2.9-2.1-6-2.3-9-.9z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 12.2v10.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="25" cy="7" r="3" fill="#f97316" />
        </svg>
      </div>
    ),
    size,
  );
}
