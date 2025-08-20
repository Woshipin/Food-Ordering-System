"use client"
/**
 * =====================================================================================
 * @file        page.tsx
 * @brief       “关于我们”页面组件
 * @details
 *              该页面详细介绍了餐厅的故事、成就、团队和价值观。
 *              所有内容均通过API从后端CMS动态获取，并支持多语言。
 *
 * @purpose     1.  **品牌故事**: 向用户传达品牌的历史和理念，建立情感连接。
 *              2.  **建立信任**: 展示团队、成就和价值观，增强用户的信任感。
 *              3.  **行动号召**: 引导用户联系我们或查看菜单，促进转化。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

// --- 核心依赖导入 (Core Dependencies) ---
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// --- UI组件和图标导入 (UI Components & Icons) ---
import { ArrowLeft, Award, Users, Heart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { LoadingOverlay } from "../../components/LoadingOverlay"; // <--- 新增：导入加载组件

// --- 自定义Hooks和上下文 (Custom Hooks & Context) ---
import { useLanguage } from "../../components/LanguageProvider";

// --- 数据和类型导入 (Data & Types) ---
import axios from "@/lib/axios";
import { AboutData } from "./lib/types"; // [优化] 从分离的文件导入类型

/**
 * @component AboutPage
 * @brief     “关于我们”页面的根组件
 */
export default function AboutPage() {
  // --- Hooks ---
  // 多语言上下文，提供翻译函数 `t` 和当前语言 `language`
  const { t, language } = useLanguage();

  // --- 状态管理 (State Management) ---
  // 存储从后端获取的“关于我们”页面的CMS数据
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true); // <--- 新增：添加加载状态
  // [优化] 从环境变量中获取API基础URL，用于拼接图片路径
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  // --- 数据获取 (Data Fetching) ---
  /**
   * @effect fetchAboutData
   * @brief  当语言 `language` 改变时，从后端API获取“关于我们”页面的CMS数据。
   */
  useEffect(() => {
    const fetchAboutData = async () => {
      setLoading(true); // <--- 修改：开始获取数据前，设置loading为true
      try {
        const response = await axios.get(`/cms/about?lang=${language}`);
        setAboutData(response.data);
      } catch (error) {
        console.error("获取关于我们页面数据失败:", error);
      } finally {
        setLoading(false); // <--- 修改：无论成功或失败，获取结束后设置loading为false
      }
    };
    fetchAboutData();
  }, [language]); // 依赖项数组，仅当 language 变化时重新执行

  // --- 渲染逻辑 (Render Logic) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50">
      {/* ==================== 页头 (Header) ==================== */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {t("about")}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ==================== 页面主体内容 (Main Content) ==================== */}
      {/* --- 新增：加载状态处理 --- */}
      {loading ? (
        <LoadingOverlay 
          isFullScreen={true} 
          title={t("Loading Content")} 
          description={t("Please wait while we fetch the details")} 
        />
      ) : (
        <main>
          {/* --- 英雄区 (Hero Section) --- */}
          <section className="relative py-12 sm:py-16 lg:py-20">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 to-amber-100/30" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">
                  {aboutData?.about_us_title || t("aboutFoodDelivery")}
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
                  {aboutData?.about_us_description || t("aboutHeroDescription")}
                </p>
              </div>
            </div>
          </section>

          {/* --- 我们的故事 (Story Section) --- */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                    {aboutData?.our_story_title || t("ourStory")}
                  </h3>
                  {/* 使用 dangerouslySetInnerHTML 是因为内容可能包含HTML标签，例如 <p> */}
                  <div className="space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: aboutData?.our_story_content || `<p>${t("storyParagraph1")}</p><p>${t("storyParagraph2")}</p>` }}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl p-4 sm:p-6">
                    <Image
                      // [优化] 图片URL从环境变量动态构建
                      src={aboutData?.our_story_image ? `${API_BASE_URL}/storage/${aboutData.our_story_image}` : "/placeholder.svg?height=400&width=600"}
                      alt={t("restaurantInterior")}
                      width={600}
                      height={400}
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- 我们的成就 (Achievements Section) --- */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-orange-100/50 to-amber-100/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
                {aboutData?.achievements_title || t("achievements")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {(aboutData?.achievements || []).map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
                  >
                    <div className="relative h-24 sm:h-32 bg-gradient-to-br from-orange-400 to-red-500 p-4 flex items-center justify-center">
                      <div className="text-4xl sm:text-6xl">{achievement.icon}</div>
                    </div>
                    <div className="p-4 sm:p-6 text-center">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {achievement.value}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">{achievement.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- 我们的团队 (Team Section) --- */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
                {aboutData?.our_team_title || t("team")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {(aboutData?.team_members || []).map((member, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
                  >
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-400 to-red-500 p-4 flex items-end">
                      <Image
                        // [优化] 图片URL从环境变量动态构建
                        src={member.image ? `${API_BASE_URL}/storage/${member.image}` : "/placeholder.svg"}
                        alt={member.name || 'Team member image'}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 sm:p-6 text-center">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                        {member.name}
                      </h4>
                      <p className="text-orange-500 font-semibold mb-3 text-sm sm:text-base">
                        {member.role}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- 我们的价值观 (Values Section) --- */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-amber-100/50 to-yellow-100/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
                  {aboutData?.our_values_title || t("ourValues")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {(aboutData?.values || []).map((value, index) => (
                    <div className="text-center" key={index}>
                      <div className="bg-orange-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        {/* 根据icon字符串动态渲染不同的Lucide图标 */}
                        {value.icon === 'Heart' && <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />}
                        {value.icon === 'Award' && <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />}
                        {value.icon === 'Users' && <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />}
                      </div>
                      <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{value.title}</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* --- 行动号召 (Contact CTA Section) --- */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 sm:p-12 text-white max-w-4xl mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">{aboutData?.cta_title || t("learnMore")}</h3>
                <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed">
                  {aboutData?.cta_description || t("learnMoreDesc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="text-orange-600 w-full sm:w-auto font-semibold"
                    >
                      {aboutData?.cta_contact_button || t("contactUs")}
                    </Button>
                  </Link>
                  <Link href="/menu">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent w-full sm:w-auto font-semibold"
                    >
                      {aboutData?.cta_menu_button || t("viewMenu")}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}