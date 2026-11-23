import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JC 台股投資組合 — 每日收盤與持股連動追蹤表",
  description: "台股持股損益、交易稅費試算與每日收盤價自動連動系統",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}