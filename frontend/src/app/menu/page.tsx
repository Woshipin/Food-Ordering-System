"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // 导入 Next.js 的 Image 组件
import {
  Search,
  Filter,
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  Send,
  X,
  Minimize2,
} from "lucide-react";
import { ImageCarousel } from "../../components/ImageCarousel";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { fetchMenus, fetchCategories } from "./lib/data"; // 从 lib/data.ts 导入数据获取函数
import { MenuItemType, CategoryType } from "./lib/types"; // 从 lib/definitions.ts 导入类型
import { LoadingOverlay } from "../../components/LoadingOverlay"; // 导入我们的加载组件

import { GoogleGenerativeAI } from "@google/generative-ai";

// Chatbot Component
interface ChatBotProps {
  menuItems: MenuItemType[];
  onRecommendation: (items: MenuItemType[]) => void;
}

const ChatBot = ({ menuItems, onRecommendation }: ChatBotProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text:
        t("chatbotWelcome") || "Hello! How can I help you with our menu today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI("AIzaSyDOtJQTRYWmr-8WsWtYb39I1J0r1c2DxNo");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // --- 关键修改 #1: 在数据源中加入 "RM" ---
      const menuContext = menuItems
        .map((item) => {
          let priceInfo;
          if (item.promotion_price !== null && item.promotion_price > 0) {
            priceInfo = `Base Price: RM${item.base_price.toFixed(
              2
            )}, Promotion Price: RM${item.promotion_price.toFixed(2)}`;
          } else {
            priceInfo = `Price: RM${item.base_price.toFixed(2)}`;
          }

          return `Name: ${item.name}, Description: ${item.description}, ${priceInfo}, Category: ${item.category?.name}`;
        })
        .join("\n");

      // --- 关键修改 #2: 更新指令，要求AI回复时必须带上 "RM" ---
      const prompt = `You are an intelligent restaurant assistant. Your task is to analyze the menu below and answer the user's request.

      **How to identify a promotion:**
      An item is considered 'on promotion' (or 'on sale', 'discounted', '优惠') if its data includes a 'Promotion Price'. Items with only a 'Price' are not on sale.

      **Menu Data:**
      ${menuContext}

      **User Request:**
      "${inputText}"

      **Your Instructions:**
      1.  Based on the rule above, analyze the user's request. If they ask about promotions, discounts, or "优惠", you MUST find and recommend ALL items that have a 'Promotion Price'.
      2.  Provide a friendly, natural language response. **When you mention any price, you MUST prefix it with "RM" (e.g., "RM31.00").**
      3.  After your response, you MUST provide a separate line containing ONLY the exact names of the recommended items in the format: [item1, item2, ...]
      4.  If no items fit the request, return an empty list [].`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let recommended: MenuItemType[] = [];

      const match = text.match(/\[(.*?)\]/);
      if (match && match[1]) {
        const recommendedNames = match[1]
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
        if (recommendedNames.length > 0) {
          recommended = menuItems.filter((item) =>
            recommendedNames.includes(item.name)
          );
        }
      }

      if (recommended.length === 0) {
        const fallbackRecommended: MenuItemType[] = [];
        menuItems.forEach((item) => {
          if (text.includes(item.name)) {
            fallbackRecommended.push(item);
          }
        });
        recommended = fallbackRecommended;
      }

      onRecommendation(recommended);

      const botResponse = {
        id: Date.now() + 1,
        text: text.replace(/\[(.*?)\]/, "").trim(),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);
      const botResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          >
            <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:animate-bounce" />
          </Button>
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          {/* --- 关键修改: Chatbot 窗口响应式尺寸 --- */}
          <div
            className={`bg-white rounded-2xl shadow-2xl border border-orange-200 transition-all duration-300 flex flex-col
              ${
                isMinimized
                  ? "h-14 w-80 sm:w-96"
                  : "w-80 h-[30rem] sm:w-96 sm:h-[34rem] md:w-[440px] md:h-[40rem]"
              } max-w-[calc(100vw-2rem)]`}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    {t("chatSupport") || "Chat Support"}
                  </h3>
                  <p className="text-orange-100 text-xs">
                    {t("onlineNow") || "Online now"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  <Minimize2 className="h-4 w-4 text-white" />
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {/* --- 关键修改: 使用 Flexbox 布局让内容区自适应 --- */}
            {!isMinimized && (
              <div className="flex flex-col flex-grow min-h-0">
                {/* 消息区域: flex-grow 会使其填充所有可用空间 */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-orange-50 to-red-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          message.isBot
                            ? "bg-white text-gray-800 rounded-bl-md shadow-md border border-orange-100"
                            : "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md shadow-md"
                        }`}
                      >
                        <p className="break-words">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isBot ? "text-gray-500" : "text-orange-100"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-md border border-orange-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* 输入区域: flex-shrink-0 确保其高度不变 */}
                <div className="flex-shrink-0 p-4 border-t border-orange-200 bg-white rounded-b-2xl">
                  <div className="flex space-x-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t("typeMessage") || "Type your message..."}
                      className="flex-1 border-orange-200 focus:border-orange-400 rounded-xl text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="w-10 h-10 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Sub-components for better organization
const MenuHeader = () => {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">{t("menu")}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Link href="/cart">
              <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{t("cart")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// 为 SearchAndFilter 组件定义 props 类型
interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | number;
  setSelectedCategory: (category: string | number) => void;
  categories: (CategoryType & { id: string | number; count?: number })[];
}

// 搜索和过滤组件
const SearchAndFilter = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
}: SearchAndFilterProps) => {
  const { t } = useLanguage();
  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-orange-200 focus:border-orange-400"
          />
        </div>
        <Select
          value={selectedCategory?.toString()}
          onValueChange={(value) =>
            setSelectedCategory(value === "all" ? "all" : parseInt(value))
          }
        >
          <SelectTrigger className="w-full md:w-48 border-orange-200 focus:border-orange-400">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent className="bg-orange-50">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}{" "}
                {category.count !== undefined && `(${category.count})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// 为 CategoryTabs 组件定义 props 类型
interface CategoryTabsProps {
  selectedCategory: string | number;
  setSelectedCategory: (category: string | number) => void;
  categories: (CategoryType & { id: string | number })[];
}

// 分类标签页组件
const CategoryTabs = ({
  selectedCategory,
  setSelectedCategory,
  categories,
}: CategoryTabsProps) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // 检查是否需要显示左右滚动按钮
  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // 向左滚动
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  // 向右滚动
  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // useEffect hook 用于在组件挂载和更新时添加事件监听器
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      // 清理函数，在组件卸载时移除事件监听器
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [checkScrollButtons, categories]);

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg p-6 border border-orange-200">
      <Tabs
        value={selectedCategory?.toString()}
        onValueChange={(value) =>
          setSelectedCategory(value === "all" ? "all" : parseInt(value))
        }
      >
        <div className="relative">
          {showLeftArrow && (
            <Button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md w-8 h-8 p-0 rounded-full"
              style={{ marginLeft: "-12px" }}
            >
              <ChevronLeft className="h-4 w-4 text-orange-600" />
            </Button>
          )}
          {showRightArrow && (
            <Button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md w-8 h-8 p-0 rounded-full"
              style={{ marginRight: "-12px" }}
            >
              <ChevronRight className="h-4 w-4 text-orange-600" />
            </Button>
          )}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto no-scrollbar"
          >
            <TabsList className="bg-white/80 backdrop-blur-sm inline-flex min-w-full w-max">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id.toString()}
                  className="text-xs sm:text-sm md:text-base data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-shrink-0 px-3 sm:px-4 md:px-6 py-2 whitespace-nowrap transition-all duration-200"
                >
                  <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                    {category.name}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </Tabs>
      <style jsx global>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// 菜单项卡片组件
const MenuItemCard = ({ item }: { item: MenuItemType }) => {
  const { t } = useLanguage(); // 使用语言 hook
  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      <Link href={`/menu/${item.id}`} className="block">
        <ImageCarousel
          images={
            item.images && item.images.length > 0 && item.images[0].url
              ? item.images.map((img) => img.url)
              : ["/images/No-Image-Available.jpg"]
          }
          alt={item.name}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
              {item.name}
            </h4>
            {item.category && (
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0"
              >
                {item.category.name}
              </Badge>
            )}
          </div>
          <p
            className="text-gray-600 text-sm mb-3 truncate"
            title={item.description}
          >
            {item.description || t("noDescription")}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline justify-end mb-4">
            {item.promotion_price ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through">
                  RM{item.base_price.toFixed(2)}
                </span>
                <span className="text-red-500 font-bold text-xl">
                  RM{item.promotion_price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-orange-500 font-bold text-xl">
                RM{item.base_price.toFixed(2)}
              </span>
            )}
          </div>
          <Link href={`/menu/${item.id}`} className="block w-full">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
              {t("viewDetails")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function MenuPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>(
    "all"
  );
  const [allMenuItems, setAllMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<
    (CategoryType & { id: string | number; count?: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedItems, setRecommendedItems] = useState<MenuItemType[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menusData, categoriesData] = await Promise.all([
        fetchMenus(),
        fetchCategories(),
      ]);

      setAllMenuItems(menusData);

      const categoryCounts = menusData.reduce(
        (acc: Record<string | number, number>, item: MenuItemType) => {
          const categoryId = item.category?.id;
          if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + 1;
          }
          return acc;
        },
        {}
      );

      const categoriesWithCount = categoriesData.map((category) => ({
        ...category,
        count: categoryCounts[category.id] || 0,
      }));

      setCategories([
        { id: "all", name: t("all"), count: menusData.length },
        ...categoriesWithCount,
      ]);
    } catch (err) {
      console.error("加载数据失败 (Failed to fetch data):", err);
      setError(t("errorFetchingData"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const itemsToFilter =
      recommendedItems.length > 0 ? recommendedItems : allMenuItems;
    return itemsToFilter.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (item.name?.toLowerCase() || "").includes(searchTermLower) ||
        (item.description?.toLowerCase() || "").includes(searchTermLower);
      const matchesCategory =
        selectedCategory === "all" || item.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allMenuItems, searchTerm, selectedCategory, recommendedItems]);
  
  const handleRecommendation = (items: MenuItemType[]) => {
    setRecommendedItems(items);
    setSearchTerm("");
    setSelectedCategory("all");
  };


  const currentCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <MenuHeader />
      <div className="container mx-auto px-4 py-8">
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        <CategoryTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {recommendedItems.length > 0
                ? t("recommendedDishes") || "Recommended For You"
                : selectedCategory === "all"
                ? t("allDishes")
                : currentCategoryName}
            </h2>
            <div className="absolute right-0 flex items-center">
              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">
                  {t("refresh") || "Refresh"}
                </span>
              </Button>
            </div>
          </div>
          
          {recommendedItems.length > 0 && (
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setRecommendedItems([])}
                className="border-orange-400 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
              >
                {t("clearRecommendation") || "Clear Recommendation & View All"}
              </Button>
            </div>
          )}


          {loading && (
            <div className="">
              <LoadingOverlay
                description={
                  t("loadingMenuMessage") ||
                  "Please wait while we load the menu..."
                }
              />
            </div>
          )}

          {error && (
            <div className="text-center py-20 bg-red-50 rounded-2xl">
              <p className="text-red-600 text-xl font-bold mb-4">{error}</p>
              <Button onClick={loadData}>{t("retry") || "Retry"}</Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t("noDishesFound")}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ChatBot
        menuItems={allMenuItems}
        onRecommendation={handleRecommendation}
      />
    </div>
  );
}