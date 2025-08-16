"use client"
/**
 * =====================================================================================
 * @file        page.tsx
 * @brief       应用的主页(Landing Page)组件
 * @details
 *              这是用户访问网站根URL时看到的第一个页面。它负责展示网站的核心信息，
 *              包括英雄区、特色菜品、分类、公司优势以及页脚等。
 *              该页面从后端API获取动态内容，并处理用户交互，如添加到购物车。
 *
 * @purpose     1.  **吸引用户**: 通过引人注目的设计和内容吸引访问者。
 *              2.  **信息展示**: 快速传达餐厅的核心卖点和特色。
 *              3.  **导航入口**: 提供清晰的导航，引导用户访问菜单、关于我们等其他页面。
 *              4.  **动态内容**: 从CMS加载内容，使市场营销团队可以轻松更新页面信息。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

// --- 核心依赖导入 (Core Dependencies) ---
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// --- UI组件和图标导入 (UI Components & Icons) ---
import { Star, Clock, MapPin, Phone, ShoppingCart, ChefHat, Truck, Menu, X, Plus, Minus, User, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ClipLoader } from "react-spinners";

// --- 自定义Hooks和上下文 (Custom Hooks & Context) ---
import { useLanguage } from "../components/LanguageProvider";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

// --- 数据和类型导入 (Data & Types) ---
import axios from "@/lib/axios";
import { HomeData } from "./lib/types"; // [优化] 从分离的文件导入类型
import { getCategories, getFeaturedItems, getNavItems } from "./lib/data"; // [优化] 从分离的文件导入静态数据

/**
 * @component HomePage
 * @brief     主页的根组件
 */
export default function HomePage() {
  // --- Hooks ---
  // 多语言上下文，提供翻译函数 `t` 和当前语言 `language`
  const { t, language } = useLanguage();
  // 认证上下文，提供当前用户信息 `user`
  const { user } = useAuth();
  // 登出Hook，提供处理登出的函数 `handleLogout` 和加载状态 `isLoggingOut`
  const { handleLogout, isLoggingOut } = useLogout();
  // Next.js路由Hook，用于获取当前路径以高亮导航链接
  const pathname = usePathname();

  // --- 状态管理 (State Management) ---
  // 控制移动端菜单的显示与隐藏
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 存储特色菜品的模拟库存数量
  const [itemStock, setItemStock] = useState<Record<number, number>>({});
  // 存储从后端获取的首页CMS数据
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  // 存储本地购物车中每个商品的数量（这是一个简化的本地状态，实际项目应使用全局状态管理）
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});

  // --- 数据获取 (Data Fetching) ---
  /**
   * @effect fetchHomeData
   * @brief  当语言 `language` 改变时，从后端API获取首页的CMS数据。
   */
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 向后端发送请求，并附带语言参数
        const response = await axios.get(`/cms/home?lang=${language}`);
        // 将获取到的数据存入状态
        setHomeData(response.data);
      } catch (error) {
        // 如果请求失败，在控制台打印错误
        console.error("获取首页数据失败:", error);
      }
    };
    fetchHomeData();
  }, [language]); // 依赖项数组，仅当 language 变化时重新执行

  // --- 模拟数据初始化 (Mock Data Initialization) ---
  // [优化] 将静态数据移至 data.ts，这里只保留与翻译相关的部分
  const featuredItems = getFeaturedItems(t);
  const categories = getCategories(t);
  const navItems = getNavItems(t);

  /**
   * @effect initializeItemStock
   * @brief  在组件首次加载时，为特色菜品生成随机的模拟库存。
   * @todo   在真实项目中，库存应从后端API获取。
   */
  useEffect(() => {
    const stock: Record<number, number> = {};
    featuredItems.forEach((item) => {
      // 为每个商品生成 5 到 19 之间的随机库存
      stock[item.id] = Math.floor(Math.random() * 15) + 5;
    });
    setItemStock(stock);
  }, []); // 空依赖项数组，表示此effect仅在组件挂载时执行一次

  // --- 购物车逻辑 (Cart Logic) ---
  /**
   * @function addToCart
   * @brief    将指定ID的商品数量加一
   * @param    {number} itemId - 商品ID
   */
  const addToCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  /**
   * @function removeFromCart
   * @brief    将指定ID的商品数量减一，最小为0
   * @param    {number} itemId - 商品ID
   */
  const removeFromCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  // --- 辅助函数 (Helper Functions) ---
  /**
   * @function isActiveRoute
   * @brief    检查给定的链接是否为当前活动路由
   * @param    {string} href - 要检查的链接
   * @returns  {boolean} 如果是活动路由则返回 true
   */
  const isActiveRoute = (href: string): boolean => {
    return pathname === href;
  };

  // --- 渲染逻辑 (Render Logic) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* ==================== 页头 (Header) ==================== */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-2xl">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between w-full">
            {/* --- Logo --- */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border-2 border-white/50 shadow-lg">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white truncate">
                {homeData?.hero_title || t("heroTitle")}
              </h1>
            </Link>

            {/* --- 桌面端导航 (Desktop Navigation) --- */}
            <div className="hidden xl:flex justify-center flex-1 mx-4">
              <nav className="flex items-center space-x-1 lg:space-x-2 bg-white/10 backdrop-blur-md rounded-2xl p-1 border-2 border-white/30 shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 lg:px-4 xl:px-5 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-medium transition-all duration-300 whitespace-nowrap ${
                      isActiveRoute(item.href)
                        ? "bg-white text-orange-600 shadow-lg transform scale-105"
                        : "text-white hover:bg-white/20 hover:shadow-md hover:scale-105"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* --- 桌面端操作按钮 (Desktop Actions) --- */}
            <div className="hidden xl:flex items-center space-x-2 lg:space-x-3">
              {user ? (
                // 已登录用户视图
                <>
                  <LanguageSwitcher />
                  <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      <ShoppingCart className="h-6 w-6" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">3</Badge>
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      <User className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                    {isLoggingOut ? <ClipLoader size={24} color={"#fff"} /> : <LogOut className="h-6 w-6" />}
                  </Button>
                </>
              ) : (
                // 未登录用户视图
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg font-medium transition-all duration-300 hover:scale-105">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105">
                      {t("register")}
                    </Button>
                  </Link>
                  <LanguageSwitcher />
                  <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      <ShoppingCart className="h-6 w-6" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">3</Badge>
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* --- 移动端操作按钮 (Mobile Actions) --- */}
            <div className="flex xl:hidden items-center space-x-2">
                <LanguageSwitcher />
                <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/50 rounded-xl h-10 w-10">
                        <ShoppingCart className="h-5 w-5" />
                        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-md">3</Badge>
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/50 rounded-xl h-10 w-10" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* ==================== 移动端菜单 (Mobile Menu) ==================== */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 h-auto bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 p-4 pb-8 shadow-xl rounded-b-3xl xl:hidden">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/50 shadow-lg">
                  <ChefHat className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">{homeData?.hero_title || t("heroTitle")}</h1>
              </Link>
              <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/50 rounded-xl h-10 w-10" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
    
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/30 shadow-lg mb-6">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 rounded-xl text-lg font-medium text-white hover:bg-white/20 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
    
            <div className="flex space-x-4">
              {user ? (
                // 已登录用户视图
                <>
                  <Link href="/profile" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("profile")}
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} disabled={isLoggingOut} className="flex-1 w-full bg-white text-orange-600 hover:bg-orange-50 shadow-lg text-base h-12 font-medium rounded-xl">
                    {isLoggingOut ? <ClipLoader size={24} color={"#f97316"} /> : t("logout")}
                  </Button>
                </>
              ) : (
                // 未登录用户视图
                <>
                  <Link href="/auth/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("register")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
        </div>
      )}

      {/* ==================== 页面主体内容 (Main Content) ==================== */}
      <main className="pt-20 sm:pt-24">
        {/* --- 英雄区 (Hero Section) --- */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none text-center">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
                <span className="text-orange-500 block">{homeData?.hero_main_title || t("heroSubtitle")}</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto">
                {homeData?.hero_description || t("heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/menu">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base sm:text-lg lg:text-xl px-8 sm:px-10 py-4 sm:py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    {homeData?.order_now_button_text || t("orderNow")}
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg lg:text-xl px-8 sm:px-10 py-4 sm:py-6 bg-white/80 backdrop-blur-sm border-2 border-orange-500 text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {homeData?.view_menu_button_text || t("viewMenu")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* --- 统计数据区 (Stats Section) --- */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">1000+</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{homeData?.stats_satisfied_customers_text || t("satisfiedCustomers")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">30{t("minutes")}</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{homeData?.stats_avg_delivery_time_text || t("avgDelivery")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">4.8★</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{homeData?.stats_user_rating_text || t("userRating")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">24/7</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{homeData?.stats_all_day_service_text || t("allDayService")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 热门分类区 (Categories Section) --- */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">{homeData?.popular_categories_title || t("popularCategories")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {categories.map((category, index) => (
                <Link href={`/menu?category=${index}`} key={index}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 rounded-2xl h-32 sm:h-36 lg:h-40 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 p-0">
                    <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base lg:text-lg">{category.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">{category.count} 道菜</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- 今日特选区 (Featured Items Section) --- */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-orange-50 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{homeData?.today_special_title || t("todaySpecial")}</h3>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">{homeData?.today_special_description || t("todaySpecialDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {featuredItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border-orange-100 p-0"
                >
                  <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      {itemStock[item.id] && (
                        <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                          {t("onlyLeft")} {itemStock[item.id]} {t("vibesLeft")}
                        </span>
                      )}
                    </div>
                    <Link href={`/menu/${item.id}`}>
                      <div className="absolute inset-0 p-4 flex items-center justify-center">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
                        />
                      </div>
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-900 truncate">{item.name}</h4>
                      <span className="text-lg font-bold text-orange-500 ml-2">¥{item.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                        <span>{item.rating}</span>
                      </div>
                      <span>
                        ({item.reviews} {t("reviews")})
                      </span>
                    </div>
                    {cartItems[item.id] > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove one item"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-lg min-w-[30px] text-center" aria-live="polite">{cartItems[item.id]}</span>
                          <button
                            className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                            onClick={() => addToCart(item.id)}
                             aria-label="Add one item"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-center">
                          <span className="text-sm text-gray-500">{t("subtotalPrice")}: ¥{(item.price * cartItems[item.id]).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                        onClick={() => addToCart(item.id)}
                      >
                        {t("addToCart")}
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- 为何选择我们 (Features Section) --- */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">{homeData?.why_choose_us_title || t("whyChooseUs")}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{homeData?.feature_fast_delivery_title || t("fastDelivery")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{homeData?.feature_fast_delivery_desc || t("fastDeliveryDesc")}</p>
              </Card>
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{homeData?.feature_quality_ingredients_title || t("qualityIngredients")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{homeData?.feature_quality_ingredients_desc || t("qualityIngredientsDesc")}</p>
              </Card>
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl sm:col-span-2 lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{homeData?.feature_quality_guarantee_title || t("qualityGuarantee")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{homeData?.feature_quality_guarantee_desc || t("qualityGuaranteeDesc")}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* --- 联系信息区 (Contact Info Section) --- */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-900 to-black text-white px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg shadow-white/5">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{homeData?.business_hours_title || t("businessHours")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">{homeData?.business_hours_description || t("mondayToSunday")}</p>
              </div>
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{homeData?.contact_title || t("orderHotline")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">{homeData?.contact_number || "400-123-4567"}</p>
              </div>
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{homeData?.delivery_title || t("deliveryRange")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">{homeData?.delivery_location || t("freeDeliveryRange")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== 页脚 (Footer) ==================== */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
        <div className="w-full max-w-none text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl shadow-lg">
              <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{homeData?.hero_title || t("heroTitle")}</span>
          </Link>
          <p className="text-gray-400 mb-6 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">{homeData?.footer_slogan || t("footerSlogan")}</p>
          <div className="flex justify-center space-x-6 sm:space-x-8 text-sm sm:text-base text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
              {homeData?.footer_privacy_policy_text || t("privacyPolicy")}
            </Link>
            <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
              {homeData?.footer_terms_of_service_text || t("termsOfService")}
            </Link>
            <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
              {homeData?.footer_help_center_text || t("helpCenter")}
            </Link>
          </div>
          <div className="pt-6 border-t border-gray-700 text-sm sm:text-base text-gray-400">
            © 2024 {homeData?.hero_title || t("heroTitle")}. {homeData?.footer_all_rights_reserved_text || t("allRightsReserved")}.
          </div>
        </div>
      </footer>
    </div>
  )
}