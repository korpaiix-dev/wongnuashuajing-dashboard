"use client";
import { useState } from "react";

interface Props {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_PX = { sm: 28, md: 36, lg: 56, xl: 96 };
const FONT_PX = { sm: 12, md: 14, lg: 22, xl: 36 };

export default function Avatar({ src, name, size = "md", className = "" }: Props) {
  const [hide, setHide] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const px = SIZE_PX[size];
  const fontPx = FONT_PX[size];

  // Container always shows letter as background — image overlays if it loads
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{
        position: "relative",
        width: px,
        height: px,
        borderRadius: "50%",
        background: "var(--gold)",
        color: "#050505",
        display: "inline-grid",
        placeItems: "center",
        fontSize: fontPx,
        fontWeight: 700,
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid var(--line-2)",
      }}
      aria-label={`${name} avatar`}
    >
      <span style={{ position: "absolute", zIndex: 0 }}>{initial}</span>
      {src && !hide && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          width={px}
          height={px}
          onError={() => setHide(true)}
          onLoad={(e) => {
            // detect transparent/broken image (0 naturalWidth means failed)
            const img = e.currentTarget;
            if (img.naturalWidth === 0 || img.naturalHeight === 0) setHide(true);
          }}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
