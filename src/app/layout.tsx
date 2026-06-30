import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentSift Open",
  description:
    "AI-assisted CV review demo for evidence, gaps, and human oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
