import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "summr — kein sommer alleine",
  description: "finde aktivitäten in deiner nähe und triff neue leute diesen sommer.",
  openGraph: {
    title: "summr",
    description: "kein sommer alleine",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
