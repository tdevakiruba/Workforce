import type { Metadata } from "next"
import { DM_Sans, Inter } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { PlatformShell } from "@/components/platform-shell"
import "./globals.css"

const _dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })
const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Workforce | AI Career Operating System",
    template: "%s | Workforce",
  },
  description:
    "Your 21 Days of Career Acceleration Journey that transforms graduates into AI-ready professionals with the judgment, accountability, and clarity employers demand.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <PlatformShell>{children}</PlatformShell>
        <Analytics />
      </body>
    </html>
  )
}
