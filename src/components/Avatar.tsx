"use client";
import { useState } from "react";

interface Props {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ src, name, size = "md", className = "" }: Props) {
  const [failed, setFailed] = useState(!src);
  const initial = (name || "?").charAt(0).toUpperCase();
  const sizeClass =
    size === "sm" ? "avatar avatar-sm" :
    size === "lg" ? "avatar avatar-lg" :
    size === "xl" ? "avatar avatar-xl" : "avatar";

  if (failed || !src) return <div className={`${sizeClass} ${className}`}>{initial}</div>;
  return (
    <img
      src={src}
      alt={`${name} avatar`}
      className={`${sizeClass} ${className}`}
      onError={() => setFailed(true)}
      style={{ objectFit: "cover" }}
    />
  );
}
