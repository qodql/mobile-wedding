import type { Metadata, Viewport } from "next";
import { Gowun_Batang } from "next/font/google";
import { wedding } from "./config";
import { formatWeddingDate } from "./date";
import "./globals.css";

const font = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// 공유 미리보기 이미지는 절대 주소가 필요해서, Vercel이 넣어주는 운영 도메인을 기준으로 삼음
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const title = `${wedding.groom} ♥ ${wedding.bride}`;
const description = `${formatWeddingDate(wedding.date).long}, 마비노기 모바일 결혼식에 초대합니다.`;

// 공유 이미지는 app/opengraph-image.png 파일을 Next가 자동으로 연결함
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ko_KR",
  },
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
