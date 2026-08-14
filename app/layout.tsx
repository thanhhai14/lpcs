import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "LPCS",
  title: "LPCS | Loan Payment Calculator Spec",
  description:
    "Công cụ lập tiến độ thanh toán, phân bổ nguồn vốn và tính lịch trả nợ ngân hàng theo ngày.",
  icons: { icon: "/icon.svg" },
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
