import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kế hoạch vay | Ước tính dòng tiền dự án",
  description:
    "Công cụ lập kế hoạch giải ngân và ước tính lịch trả nợ ngân hàng theo ngày.",
};

export const viewport: Viewport = {
  themeColor: "#10483e",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
