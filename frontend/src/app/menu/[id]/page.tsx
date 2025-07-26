"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { useLanguage } from "../../../components/LanguageProvider";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";

// --- 数据类型定义 ---
interface ImageType {
  id: number;
  url: string;
}
interface CategoryType {
  id: number;
  name: string;
}
interface VariantType {
  id: number;
  name: string;
  price_modifier: number;
}
interface AddonType {
  id: number;
  name: string;
  price: number;
}
interface MenuItemType {
  id: number;
  name: string;
  description: string;
  base_price: number;
  promotion_price: number | null;
  is_on_promotion: boolean;
  status: string;
  category: CategoryType | null;
  images: ImageType[];
  variants: VariantType[];
  addons: AddonType[];
  rating?: number;
  reviews?: number;
  cookTime?: string;
  recommendations?: any[];
}

// --- 组件定义与逻辑 ---
export default function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();

  const [menuItem, setMenuItem] = useState<MenuItemType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(
    null
  );
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  useEffect(() => {
    const fetchMenuItem = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiUrl}/api/menus/${id}`);
        if (!response.ok)
          throw new Error(t("errorFetchMenu") || "Failed to fetch menu item.");

        const result = await response.json();
        let data: MenuItemType = result.data;

        if (data.images && data.images.length > 0) {
          data.images = data.images.map((image) => ({
            ...image,
            url: `${apiUrl}${image.url}`,
          }));
        }

        data.rating = 4.8;
        data.reviews = 156;
        data.recommendations = [];

        setMenuItem(data);

        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuItem();
  }, [id, t]);

  const totalPrice = useMemo(() => {
    if (!menuItem) return 0;
    const basePrice = menuItem.promotion_price ?? menuItem.base_price;
    const variantPriceModifier = selectedVariant
      ? selectedVariant.price_modifier
      : 0;
    const addonsPrice = menuItem.addons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    const finalItemPrice = basePrice + variantPriceModifier + addonsPrice;
    return finalItemPrice * quantity;
  }, [menuItem, selectedVariant, selectedAddons, quantity]);

  const handleAddonToggle = (addonId: number) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const addToCart = () => {
    if (!menuItem) return;
    console.log({
      message: "Added to cart!",
      itemId: menuItem.id,
      itemName: menuItem.name,
      variant: selectedVariant?.name || null,
      addons: selectedAddons,
      quantity: quantity,
      totalPrice: totalPrice.toFixed(2),
    });
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        {/* Header during loading */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/menu">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </Button>
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {t("menu")}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <Link href="/cart">
                  <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">{t("cart")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Loading content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-orange-200 max-w-md mx-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full mx-auto animate-pulse"></div>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-800">
              {t("loading")}
            </h3>
            <p className="mt-2 text-gray-600">
              Please wait while we load the menu item...
            </p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        {/* Header during error */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/menu">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </Button>
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {t("menu")}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <Link href="/cart">
                  <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">{t("cart")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Error content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="text-center bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-red-200 max-w-lg mx-4">
            <div className="relative">
              <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
              <div className="absolute inset-0 h-20 w-20 border-4 border-red-200 rounded-full mx-auto animate-pulse"></div>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {t("errorTitle") || "Oops! Something went wrong"}
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{error}</p>
            <p className="mt-2 text-sm text-gray-500">
              Please try again or go back to the menu.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                Try Again
              </Button>
              <Link href="/menu">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer"
                >
                  {t("backToMenu") || "Back to Menu"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return null;
  }

  // Sub-components for better organization
  const MenuHeader = () => {
    const { t } = useLanguage();
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/menu">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {t("menu")}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Link href="/cart">
                <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105 cursor-pointer">
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

  // --- 主渲染逻辑 ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <MenuHeader />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* === 大区块 1: 图片展示廊 === */}
          <section className="lg:col-span-2 space-y-6">
            {/* 主图片区域 */}
            <div className="bg-white rounded-3xl p-4 shadow-xl border border-orange-200">
              <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-orange-100 bg-gradient-to-br from-orange-50 to-white">
                <Image
                  src={
                    menuItem.images[currentImageIndex]?.url ||
                    "/placeholder.svg"
                  }
                  alt={menuItem.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-lg cursor-pointer"
                  aria-label={t("addToWishlist")}
                >
                  <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
                </Button>
              </div>

              {/* 缩略图导航 */}
              {menuItem.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4">
                  {menuItem.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border-3 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-3 focus:ring-orange-400 focus:ring-offset-2 ${
                        currentImageIndex === index
                          ? "border-orange-500 ring-3 ring-orange-400 ring-offset-2 shadow-lg"
                          : "border-orange-200 hover:border-orange-400 shadow-md hover:shadow-lg"
                      }`}
                      aria-label={`${t("viewImage")} ${index + 1}`}
                    >
                      <Image
                        src={image.url}
                        alt={`${menuItem.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* === 大区块 2: 商品信息与操作 === */}
          <div className="lg:col-span-3 space-y-6">
            {/* 小区块 1: 主信息 (品名、价格、评分) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-200">
              {/* 第一行: Name, Rating, Category */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3">
                    {menuItem.name}
                  </h1>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                      <Star className="h-5 w-5 fill-current text-yellow-500" />
                      <span className="ml-2 font-bold text-sm text-gray-800">
                        {menuItem.rating}
                      </span>
                      <span className="ml-1 text-gray-500 text-sm">
                        ({menuItem.reviews} reviews)
                      </span>
                    </div>

                    {menuItem.category && (
                      <span className="inline-block text-sm font-semibold text-orange-700 bg-orange-100 px-4 py-2 rounded-full border border-orange-300">
                        {menuItem.category.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-orange-600">
                      RM
                      {(
                        menuItem.promotion_price ?? menuItem.base_price
                      ).toFixed(2)}
                    </span>
                    {menuItem.is_on_promotion && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg text-gray-400 line-through">
                          RM{menuItem.base_price.toFixed(2)}
                        </span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          SALE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-orange-200" />

              {/* Description */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {menuItem.description}
              </p>
            </section>

            {/* 小区块 2: 选项 (规格、加料) */}
            <div className="space-y-6">
              {/* Variants Section */}
              {menuItem.variants.length > 0 && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                    {t("selectVariant") || "Select Size"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menuItem.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 sm:p-5 rounded-2xl border-3 text-left transition-all duration-300 cursor-pointer focus:outline-none focus:ring-3 focus:ring-orange-400 focus:ring-offset-2 hover:shadow-lg transform hover:-translate-y-1 ${
                          selectedVariant?.id === variant.id
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg"
                            : "border-orange-200 hover:border-orange-400 bg-white hover:bg-orange-50"
                        }`}
                      >
                        <div className="font-bold text-lg text-gray-900 mb-1">
                          {variant.name}
                        </div>
                        <div className="text-sm font-semibold text-gray-600">
                          {variant.price_modifier > 0
                            ? `+ RM${variant.price_modifier.toFixed(2)}`
                            : variant.price_modifier < 0
                            ? `- RM${Math.abs(variant.price_modifier).toFixed(
                                2
                              )}`
                            : t("standardPrice") || "Standard Price"}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Addons Section */}
              {menuItem.addons.length > 0 && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-200">
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                    {t("additions") || "Add-ons"}
                  </h3>
                  <div className="space-y-4">
                    {menuItem.addons.map((addon) => (
                      <div
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon.id)}
                        className={`flex items-center p-4 sm:p-5 rounded-2xl border-3 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:-translate-y-1 ${
                          selectedAddons.includes(addon.id)
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg"
                            : "border-orange-200 hover:border-orange-400 bg-white hover:bg-orange-50"
                        }`}
                      >
                        <Label
                          htmlFor={`addon-${addon.id}`}
                          className="flex items-center w-full cursor-pointer"
                        >
                          <Checkbox
                            id={`addon-${addon.id}`}
                            checked={selectedAddons.includes(addon.id)}
                            className={`h-6 w-6 rounded-lg border-2 mr-4 transition-all duration-300 cursor-pointer ${
                              selectedAddons.includes(addon.id)
                                ? "border-orange-500 bg-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                : "border-orange-300 hover:border-orange-500"
                            }`}
                          />
                          <span className="flex-1 font-semibold text-lg text-gray-800">
                            {addon.name}
                          </span>
                          <span className="font-bold text-lg text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                            + RM{addon.price.toFixed(2)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 小区块 3: 购买操作 (数量、总价、按钮) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-200 sticky bottom-6 lg:static">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                  {t("quantity") || "Quantity"}
                </h3>
                <div className="flex items-center justify-between gap-4 p-1 rounded-xl border-2 border-orange-200 bg-orange-50 w-fit">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-orange-500 hover:bg-orange-600 rounded-lg cursor-pointer text-white"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-xl min-w-[30px] text-center text-gray-900">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-orange-500 hover:bg-orange-600 rounded-lg cursor-pointer text-white"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg sm:text-xl font-bold py-6 sm:py-8 rounded-2xl shadow-2xl shadow-orange-500/30 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-offset-2 cursor-pointer transform active:scale-95"
                onClick={addToCart}
              >
                <div className="flex items-center justify-center w-full">
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  <span>{t("addToCart") || "Add to Cart"}</span>
                  <span className="mx-4 opacity-70">|</span>
                  <span className="font-black text-xl">
                    RM{totalPrice.toFixed(2)}
                  </span>
                </div>
              </Button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
