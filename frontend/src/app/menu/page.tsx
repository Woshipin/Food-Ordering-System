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
  categories: (CategoryType & { id: string | number })[];
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
  // 从 item 对象中提取图片 URL 数组
  return (
    // 卡片容器
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      {/* 点击卡片跳转到详情页 */}
      <Link href={`/menu/${item.id}`} className="block">
        {/* 图片轮播组件或默认图片 */}
        {/*
          进行最终的、最可靠的修复：
          1. 检查 item.images 是否有效且包含至少一个有效的 url。
          2. 如果是，则将所有有效的 url 传递给 ImageCarousel。
          3. 如果不是，则创建一个只包含默认图片路径的数组，然后传递给 ImageCarousel。
          这样可以确保所有图片（无论是真实的还是默认的）都由同一个组件以完全相同的方式渲染，保证 UI 绝对一致。
        */}
        <ImageCarousel
          images={
            item.images && item.images.length > 0 && item.images[0].url
              ? item.images.map((img) => img.url)
              : ["/images/No-Image-Available.jpg"]
          }
          alt={item.name}
        />
      </Link>
      {/* 卡片内容区域 */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            {/* 菜单名称 */}
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">
              {item.name}
            </h4>
            {/* 分类徽章 */}
            {item.category && (
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0"
              >
                {item.category.name}
              </Badge>
            )}
          </div>
          {/* 菜单描述 */}
          <p
            className="text-gray-600 text-sm mb-3 truncate"
            title={item.description}
          >
            {item.description || t("noDescription")}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline justify-end mb-4">
            {/* 价格显示：如果
有促销价则显示原价和促销价 */}
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
              // 否则只显示基础价格
              <span className="text-orange-500 font-bold text-xl">
                RM{item.base_price.toFixed(2)}
              </span>
            )}
          </div>
          {/* 查看详情按钮 */}
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
  const [allMenuItems, setAllMenuItems] = useState<MenuItemType[]>([]); // 存储所有菜单项
  const [categories, setCategories] = useState<CategoryType[]>([]); // 存储所有分类
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  // 使用 useCallback 包装 loadData 函数，以避免在组件重渲染时不必要地重新创建函数
  const loadData = useCallback(async () => {
    setLoading(true); // 开始加载，设置 loading 为 true
    setError(null); // 重置错误状态
    try {
      // 使用 Promise.all 并行获取菜单和分类数据
      const [menusData, categoriesData] = await Promise.all([
        fetchMenus(),
        fetchCategories(),
      ]);

      setAllMenuItems(menusData); // 更新菜单项状态

      // 计算每个分类下的菜单数量
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

      // 为每个分类添加 count 属性
      const categoriesWithCount = categoriesData.map((category) => ({
        ...category,
        count: categoryCounts[category.id] || 0,
      }));

      // 设置最终的分类列表，包含 "全部" 选项
      setCategories([
        { id: "all", name: t("all"), count: menusData.length },
        ...categoriesWithCount,
      ]);
    } catch (err) {
      // 如果捕获到错误
      console.error("加载数据失败 (Failed to fetch data):", err);
      setError(t("errorFetchingData"));
    } finally {
      // 无论成功或失败，最后都设置 loading 为 false
      setLoading(false);
    }
  }, [t]); // 依赖项 t，当语言切换时会重新加载数据

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (item.name?.toLowerCase() || "").includes(searchTermLower) ||
        (item.description?.toLowerCase() || "").includes(searchTermLower);
      const matchesCategory =
        selectedCategory === "all" || item.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allMenuItems, searchTerm, selectedCategory]);

  const currentCategoryName = categories.find(
    (c) => c.id === selectedCategory
  )?.name;

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
              {selectedCategory === "all"
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
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
              <p className="mt-6 text-xl text-gray-600 font-semibold">
                {t("loadingMenu") || "Loading Menu..."}
              </p>
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
    </div>
  );
}
