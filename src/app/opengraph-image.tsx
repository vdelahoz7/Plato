import { ImageResponse } from "next/og";

export const alt = "Bocado — cuenta calorías con una foto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// El mismo platito kawaii del logo de la app (ojos con brillo, cachetes y sonrisa).
const mascot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <ellipse cx="60" cy="62" rx="46" ry="44" fill="#ffffff"/>
  <circle cx="47" cy="56" r="6.5" fill="#2B2B29"/>
  <circle cx="73" cy="56" r="6.5" fill="#2B2B29"/>
  <circle cx="48.6" cy="54" r="2" fill="#ffffff"/>
  <circle cx="74.6" cy="54" r="2" fill="#ffffff"/>
  <circle cx="40" cy="68" r="6" fill="#F285A0"/>
  <circle cx="80" cy="68" r="6" fill="#F285A0"/>
  <path d="M49 68 Q60 80 71 68" fill="none" stroke="#2B2B29" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const mascotUri = `data:image/svg+xml,${encodeURIComponent(mascot)}`;

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
          background: "#0f6e56",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascotUri} width={200} height={200} alt="" />
        <div style={{ marginTop: 36, fontSize: 100, fontWeight: 700, color: "#ffffff", display: "flex" }}>
          Bocado
        </div>
        <div style={{ marginTop: 6, fontSize: 40, color: "#d1fae5", display: "flex" }}>
          Cuenta tus calorías con una foto
        </div>
      </div>
    ),
    { ...size },
  );
}
