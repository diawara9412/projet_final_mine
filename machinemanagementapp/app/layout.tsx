import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestion de Réparation - Machine Management",
  description: "Système de gestion de réparation d'ordinateurs",
  icons: {
    icon: [
      // {
      //   url: "/icon-light-32x32.png",
      //   media: "(prefers-color-scheme: light)",
      // },
      // {
      //   url: "/icon-dark-32x32.png",
      //   media: "(prefers-color-scheme: dark)",
      // },
      // {
      //   url: "/icon.svg",
      //   type: "image/svg+xml",
      // },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
