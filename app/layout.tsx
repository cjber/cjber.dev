import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'cjber@dev:~$',
  description: 'Full-stack developer',
  keywords: ['developer', 'portfolio', 'full-stack', 'web development'],
  authors: [{ name: 'cjber' }],
  openGraph: {
    title: 'cjber.dev | Portfolio',
    description: 'Full-stack developer portfolio website',
    url: 'https://cjber.dev',
    siteName: 'cjber.dev',
    images: [
      {
        url: 'https://cjber.dev/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cjber.dev | Portfolio',
    description: 'Full-stack developer portfolio website',
    images: ['https://cjber.dev/og.png'],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        {children}
      </body>
    </html>
  )
}