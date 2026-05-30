import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wongnuashuajing — Gang OS",
  description: "ระบบจัดการสมาชิก กิจกรรม และคะแนนสำหรับแก๊ง Wongnuashuajing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
