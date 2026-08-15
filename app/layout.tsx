import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

const title = "LPCS — Tính lịch trả nợ ngân hàng";
const description = "Lập tiến độ thanh toán, phân bổ vốn tự có và vốn ngân hàng, tính chi tiết gốc, lãi và dư nợ theo từng kỳ.";
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (vercelProductionUrl ? `https://${vercelProductionUrl}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "LPCS",
  title,
  description,
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Loan Payment Calculator Spec",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10483e",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={beVietnamPro.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
