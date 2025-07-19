"use client"

import { Globe } from "lucide-react"
import { Button } from "../components/ui/button" // 假设路径正确
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu" // 假设路径正确
import { useLanguage } from "./LanguageProvider"
import { languages, type Language } from "../lib/i18n"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Globe className="h-6 w-6" />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      
      {/* 2. 下拉菜单容器样式更新，添加背景和阴影 */}
      <DropdownMenuContent
        align="end"
        className="bg-white text-gray-800 shadow-lg rounded-xl p-1 border border-gray-100 min-w-[150px]"
      >
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLanguage(code as Language)}
            // 3. 菜单项样式更新，实现您期望的悬停和选中效果
            className={`
              cursor-pointer rounded-lg font-medium 
              focus:bg-orange-50 focus:text-orange-600 
              ${language === code ? "bg-orange-100 text-orange-700 font-semibold" : ""}
            `}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}