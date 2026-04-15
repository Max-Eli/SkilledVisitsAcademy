import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import { CartProvider } from '@/lib/cart'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Skilled Visits Academy',
  description:
    'Professional IV therapy training, protocols, and tools for medical providers.',
  keywords: ['IV therapy', 'medical education', 'nursing CEUs', 'IV protocols', 'medical training'],
  openGraph: {
    title: 'Skilled Visits Academy',
    description: 'Professional IV therapy education and clinical tools for healthcare providers.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster position="top-right" richColors />
        <Script src="https://jidopay.com/embed.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
