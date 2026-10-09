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
  metadataBase: new URL("https://cillian.dev"),
  title: "Cillian Berragan",
  description:
    "Founding AI Engineer at Nebula, building AI agents and the backend that runs them. Author of fastbrowse. Previously thirdweb. PhD in NLP.",
  alternates: { canonical: "/" },
  keywords: "Cillian Berragan, AI Engineer, AI agents, Nebula, fastbrowse, NLP",
  authors: [{ name: "Cillian Berragan" }],
  creator: "Cillian Berragan",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://cillian.dev",
    siteName: "Cillian Berragan",
    title: "Cillian Berragan",
    description: "Founding AI Engineer at Nebula. Author of fastbrowse.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cillian Berragan",
    description: "Founding AI Engineer at Nebula. Author of fastbrowse.",
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
