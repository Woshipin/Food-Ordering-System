"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShoppingCart,
  RefreshCw,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { fetchPackages } from "./lib/data"; // 从 lib/data.ts 导入数据获取函数
import { PackageListItemType } from "./lib/types"; // 从 lib/definitions.ts 导入类型
import { LoadingOverlay } from "../../components/LoadingOverlay"; // <--- 新增：导入统一的加载组件

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

// 套餐卡片组件
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
  const { t } = useLanguage(); // 使用语言 hook

  // 描述文本，如果为空则提供一个默认值
  const description =
    pkg.description || `${pkg.name} - ${t("aDeliciousPackage")}`;

  // 生成套餐内项目列表的预览文本
  let itemsList = [];
  if (pkg.menus && pkg.menus.length > 0) {
    itemsList = pkg.menus.slice(0, 3).map((menu) => menu.name);
    if (pkg.menus.length > 3) {
      itemsList.push(`...${t("andMoreItems")}`);
    }
  } else {
    itemsList = [t("includesItemsFromPackage")];
  }

  // 判断是否有促销价
  const hasPromo = pkg.promotion_price && pkg.promotion_price > 0;
  // 根据是否有促销价决定显示的最终价格 (确保 displayPrice 不为 null)
  const displayPrice = (hasPromo ? pkg.promotion_price : pkg.base_price) || 0;
  // 计算小计
  const subtotal = (displayPrice * (cartItems[pkg.id] || 0)).toFixed(2);

  return (
    // 卡片容器
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      {/* 点击图片区域可跳转到详情页 */}
      <Link href={`/package/${pkg.id}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
          {/* 使用 Next.js Image 组件优化图片加载 */}
          <Image
            // 如果 pkg.image 存在，则使用它；否则使用默认图片
            src={pkg.image || "/images/No-Image-Available.jpg"}
            alt={pkg.name || "Package Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // 保持图片比例的同时填充整个容器，可能会裁剪
            className="object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* 卡片内容区域 */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            {/* 套餐名称 */}
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
              {pkg.name}
            </h4>
            {/* 分类徽章 */}
            {pkg.category && (
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0 ml-2"
              >
                {pkg.category.name}
              </Badge>
            )}
          </div>
          {/* 描述 */}
          <p
            className="text-gray-600 text-sm mb-3 line-clamp-2"
            title={description}
          >
            {description}
          </p>
          {/* 套餐包含内容预览 */}
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">
              {t("packageIncludes")}:
            </h5>
            <div className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
              {itemsList.join(" • ")}
            </div>
          </div>
        </div>

        {/* 卡片底部区域 */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            {/* 模拟的评分和评论 */}
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
              <span>{pkg.rating || "4.7"}</span>
            </div>
            <span>
              ({pkg.reviews || Math.floor(Math.random() * 200) + 1}{" "}
              {t("reviews")})
            </span>
          </div>

          {/* 价格显示 */}
          <div className="flex items-baseline justify-end mb-4 gap-2">
            {/* 如果有促销价，显示被划掉的原价 */}
            {hasPromo && (
              <span className="text-gray-500 line-through text-lg">
                RM{pkg.base_price.toFixed(2)}
              </span>
            )}
            {/* 显示最终价格 */}
            <span className="text-orange-500 font-bold text-2xl">
              RM{displayPrice.toFixed(2)}
            </span>
          </div>

          {/* 根据购物车数量显示不同的按钮 */}
          {cartItems[pkg.id] > 0 ? (
            // 如果购物车中有此商品，显示加减按钮
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
            // 如果购物车中没有，显示查看详情按钮
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
  const [packages, setPackages] = useState<PackageListItemType[]>([]); // 存储套餐列表
  const [cartItems, setCartItems] = useState<Record<number, number>>({}); // 模拟购物车状态
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误状态

  // 使用 useCallback 封装数据加载函数，以优化性能
  const loadData = useCallback(async () => {
    setLoading(true); // 开始加载
    setError(null); // 清除旧的错误
    try {
      // 调用从 lib/data.ts 导入的函数
      const packagesData = await fetchPackages();
      setPackages(packagesData); // 更新状态
    } catch (err) {
      console.error("加载套餐失败 (Failed to fetch packages):", err);
      setError(t("errorFetchingData"));
    } finally {
      setLoading(false); // 结束加载
    }
  }, [t]); // 依赖 t，语言切换时会重新加载

  useEffect(() => {
    loadData();
  }, [loadData]);

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
              {t("packages")}
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

          {/* --- 修改开始 --- */}
          {loading && (
            // 使用容器和最小高度来确保加载动画有足够的显示空间
            <div className="">
              <LoadingOverlay
                description={
                  t("loadingPackagesMessage") ||
                  "Please wait while we load the packages..."
                }
              />
            </div>
          )}
          {/* --- 修改结束 --- */}

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
              {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
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
                  {t("noPackagesAvailable")}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}