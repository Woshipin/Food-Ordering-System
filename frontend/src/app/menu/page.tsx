"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Search, Filter, ShoppingCart, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { ImageCarousel } from "../../components/ImageCarousel"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"
import axios from "../../lib/axios"

// Type Definitions for clarity
interface MenuItemData {
  id: number;
  name: string;
  description: string;
  base_price: string;
  promotion_price?: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  count?: number;
}

// API Fetching Logic
async function fetchMenus(t: (key: string) => string) {
  try {
    const response = await axios.get("/menus");
    const data = response.data;

    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        ...item,
        images: item.images?.length > 0
          ? item.images.map((img: { url: string }) => `http://127.0.0.1:8000${img.url}`)
          : ["/placeholder.svg?height=300&width=400"],
      }));
    } else {
      console.error("Expected data to be an array or have a 'data' property, but got:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching menus:", error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await axios.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Sub-components for better organization
const MenuHeader = () => {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-black">
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

const SearchAndFilter = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }: any) => {
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
        <Select value={selectedCategory?.toString()} onValueChange={(value) => setSelectedCategory(value === "all" ? "all" : parseInt(value))}>
          <SelectTrigger className="w-full md:w-48 border-orange-200 focus:border-orange-400">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("selectCategory")} />
          </SelectTrigger>
          <SelectContent className="bg-orange-50">
            {categories.map((category: Category & { id: string | number }) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name} {category.count !== undefined && `(${category.count})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const CategoryTabs = ({ selectedCategory, setSelectedCategory, categories }: any) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);
    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons, categories]);

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg p-6 border border-orange-200">
      <Tabs value={selectedCategory?.toString()} onValueChange={(value) => setSelectedCategory(value === "all" ? "all" : parseInt(value))}>
        <div className="relative">
          {showLeftArrow && (
            <Button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md w-8 h-8 p-0 rounded-full"
              style={{ marginLeft: '-12px' }}
            >
              <ChevronLeft className="h-4 w-4 text-orange-600" />
            </Button>
          )}
          {showRightArrow && (
            <Button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md w-8 h-8 p-0 rounded-full"
              style={{ marginRight: '-12px' }}
            >
              <ChevronRight className="h-4 w-4 text-orange-600" />
            </Button>
          )}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto no-scrollbar"
          >
            <TabsList className="bg-white/80 backdrop-blur-sm inline-flex min-w-full w-max">
              {categories.map((category: Category & { id: string | number }) => (
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

const MenuItemCard = ({ item }: { item: MenuItemData }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      <Link href={`/menu/${item.id}`} className="block">
        <ImageCarousel images={item.images} alt={item.name} />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">{item.name}</h4>
            {item.category && (
              <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0">
                {item.category.name}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 truncate" title={item.description}>
            {item.description || t('noDescription')}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline justify-end mb-4">
            {item.promotion_price ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 line-through">¥{item.base_price}</span>
                <span className="text-red-500 font-bold text-xl">¥{item.promotion_price}</span>
              </div>
            ) : (
              <span className="text-orange-500 font-bold text-xl">¥{item.base_price}</span>
            )}
          </div>
          <Link href={`/menu/${item.id}`} className="block w-full">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
              {t("viewDetails") || "View Details"}
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
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [allMenuItems, setAllMenuItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<(Category & { id: string | number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menusData, categoriesData] = await Promise.all([
        fetchMenus(t),
        fetchCategories(),
      ]);

      setAllMenuItems(menusData);

      if (!categoriesData) {
        console.error("categoriesData is undefined");
        setCategories([]);
        return;
      }

      if (!Array.isArray(categoriesData)) {
        console.error("Expected categoriesData to be an array, but got:", categoriesData);
        setCategories([]);
        return;
      }

      const categoryCounts = menusData.reduce((acc: Record<number, number>, item: MenuItemData) => {
        const categoryId = item.category?.id;
        if (categoryId) {
          acc[categoryId] = (acc[categoryId] || 0) + 1;
        }
        return acc;
      }, {});

      const categoriesWithCount = categoriesData.map((category) => ({
        ...category,
        count: categoryCounts[category.id] || 0,
      }));

      setCategories([
        { id: "all", name: t("all") || "All", count: menusData.length },
        ...categoriesWithCount,
      ]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(t("errorFetchingData") || "Could not load the menu. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    return allMenuItems.filter((item) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (item.name?.toLowerCase() || "").includes(searchTermLower) ||
        (item.description?.toLowerCase() || "").includes(searchTermLower);
      const matchesCategory = selectedCategory === "all" || item.category?.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allMenuItems, searchTerm, selectedCategory]);

  const currentCategoryName = categories.find(c => c.id === selectedCategory)?.name;

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
              {selectedCategory === "all" ? t("allDishes") : currentCategoryName}
            </h2>
            <div className="absolute right-0 flex items-center">
              <Button
                onClick={loadData}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{t("refresh") || "Refresh"}</span>
              </Button>
            </div>
          </div>
          {loading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
              <p className="mt-6 text-xl text-gray-600 font-semibold">{t("loadingMenu") || "Loading Menu..."}</p>
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
                  {filteredItems.map((item) => <MenuItemCard key={item.id} item={item} />)}
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
