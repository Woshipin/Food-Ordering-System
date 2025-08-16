"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Language, getTranslation } from "../lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // [优化] 使用函数作为useState的初始值，以同步地从localStorage读取语言设置
  // 这可以防止页面刷新时语言状态的闪烁问题
  const [language, setLanguage] = useState<Language>(() => {
    // 仅在客户端环境下执行
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem("language") as Language;
      // 检查localStorage中存储的值是否有效
      if (savedLanguage && ["zh", "en", "ms"].includes(savedLanguage)) {
        return savedLanguage;
      }
    }
    // 如果在服务器端或localStorage中没有有效值，则返回默认语言 'zh'
    return "zh";
  });

  // [优化] 使用useEffect来监听language状态的变化，并将其同步到localStorage
  // 这样可以确保状态和localStorage始终一致
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string) => getTranslation(language, key)

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
