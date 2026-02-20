import type { Metadata } from "next"
import { DM_Sans, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PlatformShell } from "@/components/platform-shell"
import "./globals.css"

const _dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })
const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Workforce Ready | 21-Day Leadership Program",
    template: "%s | Workforce Ready",
  },
  description:
    "A structured, 21-day leadership program that transforms emerging professionals into workforce-ready leaders through daily micro-learning and real-world application.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <PlatformShell>{children}</PlatformShell>
        <Analytics />
      </body>
    </html>
  )
}
