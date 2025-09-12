"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  Star,
  Plus,
  Minus,
  MessageCircle,
  Send,
  X,
  Minimize2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { fetchPackages } from "./lib/data";
import { PackageListItemType } from "./lib/types";
import { LoadingOverlay } from "../../components/LoadingOverlay";

import { GoogleGenerativeAI } from "@google/generative-ai";

// --- AI Chatbot 组件 ---
interface ChatBotProps {
  packages: PackageListItemType[];
  onRecommendation: (items: PackageListItemType[]) => void;
}

const ChatBot = ({ packages, onRecommendation }: ChatBotProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text:
        t("chatbotWelcomePackages") ||
        "Hello! How can I help you find the perfect package deal today?",
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

      const packageContext = packages
        .map((pkg) => {
          let priceInfo;
          if (pkg.promotion_price !== null && pkg.promotion_price > 0) {
            priceInfo = `Base Price: RM${pkg.base_price.toFixed(
              2
            )}, Promotion Price: RM${pkg.promotion_price.toFixed(2)}`;
          } else {
            priceInfo = `Price: RM${pkg.base_price.toFixed(2)}`;
          }
          const includedItems =
            pkg.menus?.map((menu) => menu.name).join(", ") || "various items";
          return `Name: ${pkg.name}, Description: ${pkg.description}, Includes: ${includedItems}, ${priceInfo}, Category: ${pkg.category?.name}`;
        })
        .join("\n");

      const prompt = `You are an intelligent restaurant assistant specializing in package deals. Your task is to analyze the package list below and answer the user's request.

      **How to identify a promotion:**
      A package is 'on promotion' (or 'on sale', 'discounted', '优惠') if its data includes a 'Promotion Price'. Packages with only a 'Price' are not on sale.

      **Package List:**
      ${packageContext}

      **User Request:**
      "${inputText}"

      **Your Instructions:**
      1.  Based on the rule above, analyze the user's request. If they ask about promotions, discounts, or "优惠", you MUST find and recommend ALL packages that have a 'Promotion Price'.
      2.  Provide a friendly, natural language response. **When you mention any price, you MUST prefix it with "RM" (e.g., "RM80.54").**
      3.  After your response, you MUST provide a separate line containing ONLY the exact names of the recommended packages in the format: [package1, package2, ...]
      4.  If no packages fit the request, return an empty list [].`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let recommended: PackageListItemType[] = [];

      const match = text.match(/\[(.*?)\]/);
      if (match && match[1]) {
        const recommendedNames = match[1]
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
        if (recommendedNames.length > 0) {
          recommended = packages.filter((pkg) =>
            recommendedNames.includes(pkg.name)
          );
        }
      }

      if (recommended.length === 0) {
        const fallbackRecommended: PackageListItemType[] = [];
        packages.forEach((pkg) => {
          if (text.includes(pkg.name)) {
            fallbackRecommended.push(pkg);
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
            <h1 className="text-2xl font-bold text-white">{t("packages")}</h1>
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

const PackageCard = ({
  pkg,
  cartItems,
  addToCart,
  removeFromCart,
}: {
  pkg: PackageListItemType;
  cartItems: Record<number, number>;
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
}) => {
  const { t } = useLanguage();

  const description =
    pkg.description || `${pkg.name} - ${t("aDeliciousPackage")}`;

  let itemsList = [];
  if (pkg.menus && pkg.menus.length > 0) {
    itemsList = pkg.menus.slice(0, 3).map((menu) => menu.name);
    if (pkg.menus.length > 3) {
      itemsList.push(`...${t("andMoreItems")}`);
    }
  } else {
    itemsList = [t("includesItemsFromPackage")];
  }

  const hasPromo = pkg.promotion_price && pkg.promotion_price > 0;
  const displayPrice = (hasPromo ? pkg.promotion_price : pkg.base_price) || 0;
  const subtotal = (displayPrice * (cartItems[pkg.id] || 0)).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      <Link href={`/package/${pkg.id}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
          <Image
            src={pkg.image || "/images/No-Image-Available.jpg"}
            alt={pkg.name || "Package Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
              {pkg.name}
            </h4>
            {pkg.category && (
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0 ml-2"
              >
                {pkg.category.name}
              </Badge>
            )}
          </div>
          <p
            className="text-gray-600 text-sm mb-3 line-clamp-2"
            title={description}
          >
            {description}
          </p>
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">
              {t("packageIncludes")}:
            </h5>
            <div className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
              {itemsList.join(" • ")}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
              <span>{pkg.rating || "4.7"}</span>
            </div>
            <span>
              ({pkg.reviews || Math.floor(Math.random() * 200) + 1}{" "}
              {t("reviews")})
            </span>
          </div>

          <div className="flex items-baseline justify-end mb-4 gap-2">
            {hasPromo && (
              <span className="text-gray-500 line-through text-lg">
                RM{pkg.base_price.toFixed(2)}
              </span>
            )}
            <span className="text-orange-500 font-bold text-2xl">
              RM{displayPrice.toFixed(2)}
            </span>
          </div>

          {cartItems[pkg.id] > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <button
                  className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                  onClick={() => removeFromCart(pkg.id)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold text-lg min-w-[30px] text-center">
                  {cartItems[pkg.id]}
                </span>
                <button
                  className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                  onClick={() => addToCart(pkg.id)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {t("subtotalPrice")} RM{subtotal}
                </span>
              </div>
            </div>
          ) : (
            <Button
              asChild
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              <Link href={`/package/${pkg.id}`}>{t("viewDetail")}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function PackagesPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<PackageListItemType[]>([]);
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedPackages, setRecommendedPackages] = useState<PackageListItemType[]>([]);


  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const packagesData = await fetchPackages();
      setPackages(packagesData);
    } catch (err) {
      console.error("加载套餐失败 (Failed to fetch packages):", err);
      setError(t("errorFetchingData"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecommendation = (items: PackageListItemType[]) => {
    setRecommendedPackages(items);
  };

  const filteredPackages = useMemo(() => {
    return recommendedPackages.length > 0 ? recommendedPackages : packages;
  }, [recommendedPackages, packages]);


  const addToCart = (itemId: number) =>
    setCartItems((p) => ({ ...p, [itemId]: (p[itemId] || 0) + 1 }));
  const removeFromCart = (itemId: number) =>
    setCartItems((p) => ({
      ...p,
      [itemId]: Math.max((p[itemId] || 0) - 1, 0),
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <MenuHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("featuredPackages")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("featuredPackagesDesc")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {recommendedPackages.length > 0
                ? t("recommendedPackages") || "Recommended Packages"
                : t("packages")}
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

          {recommendedPackages.length > 0 && (
            <div className="text-center mb-6">
              <Button
                variant="outline"
                onClick={() => setRecommendedPackages([])}
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
                  t("loadingPackagesMessage") ||
                  "Please wait while we load the packages..."
                }
              />
            </div>
          )}

          {error && (
            <div className="text-center py-20 bg-red-50 rounded-2xl">
              <p className="text-red-600 text-xl font-bold mb-4">{error}</p>
              <Button onClick={loadData} variant="destructive">
                {t("retry") || "Retry"}
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPackages.map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      cartItems={cartItems}
                      addToCart={addToCart}
                      removeFromCart={removeFromCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {recommendedPackages.length > 0
                    ? t("noRecommendedPackagesFound") ||
                      "Sorry, no packages match the recommendation."
                    : t("noPackagesAvailable")}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ChatBot packages={packages} onRecommendation={handleRecommendation} />
    </div>
  );
}