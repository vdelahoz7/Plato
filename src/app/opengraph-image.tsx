import { ImageResponse } from "next/og";

export const alt = "Plato — cuenta calorías con una foto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F6E56",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
          }}
        >
          <div style={{ position: "absolute", top: 70, left: 52, width: 16, height: 16, borderRadius: "50%", background: "#2B2B29" }} />
          <div style={{ position: "absolute", top: 70, left: 112, width: 16, height: 16, borderRadius: "50%", background: "#2B2B29" }} />
          <div style={{ position: "absolute", top: 96, left: 66, width: 48, height: 24, borderBottom: "6px solid #2B2B29", borderRadius: "0 0 40px 40px" }} />
        </div>
        <div style={{ marginTop: 48, fontSize: 100, fontWeight: 700, color: "#ffffff", display: "flex" }}>
          Plato
        </div>
        <div style={{ marginTop: 6, fontSize: 40, color: "#d1fae5", display: "flex" }}>
          Cuenta tus calorías con una foto
        </div>
      </div>
    ),
    { ...size },
  );
}
