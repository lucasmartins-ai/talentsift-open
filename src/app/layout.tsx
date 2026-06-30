import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentSift Open",
  description:
    "AI-assisted CV screening for summarizing, comparing, and shortlisting candidates for human review.",
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
