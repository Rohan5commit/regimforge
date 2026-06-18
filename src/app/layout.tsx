import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RegimeForge — AI Strategy Skill",
  description:
    "A CoinMarketCap-native AI strategy skill that detects crypto market regimes and emits backtestable trading rules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
