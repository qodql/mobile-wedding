import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import { wedding } from "./config";
import "./globals.css";

const font = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${wedding.groom} ♥ ${wedding.bride} 결혼합니다`,
  description: "마비노기 모바일 결혼식에 초대합니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ececec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={font.className}>{children}</body>
    </html>
  );
}
