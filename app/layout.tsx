import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cillian Berragan",
  description: "Founding Engineer at Nebula. Previously thirdweb.",
  keywords: "Cillian Berragan, Software Engineer, Nebula, AI, ML",
  authors: [{ name: "Cillian Berragan" }],
  creator: "Cillian Berragan",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://cillian.dev",
    siteName: "Cillian Berragan",
    title: "Cillian Berragan",
    description: "Founding Engineer at Nebula",
  },
  twitter: {
    card: "summary",
    title: "Cillian Berragan",
    description: "Founding Engineer at Nebula",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
