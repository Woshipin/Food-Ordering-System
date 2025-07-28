import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "../components/LanguageProvider"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "美食外卖 - 美味佳肴送到您家",
  description: "精选优质食材，专业厨师制作，30分钟内新鲜送达。享受美食，就是这么简单！",
  keywords: "外卖,美食,快餐,中餐,饮品,甜品",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
