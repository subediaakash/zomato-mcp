import "./globals.css"
import { Toaster } from "sonner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Zomato MCP",
  description: "App using Drizzle + Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}