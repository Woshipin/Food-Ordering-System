"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image" // 使用 Next.js Image 组件以获得优化
import { ArrowLeft, ShoppingCart, RefreshCw, Star, Plus, Minus } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"
import axios from "../../lib/axios"

// 修正 1: 更新类型定义以匹配新的API响应
interface PackageData {
  id: number;
  name: string;
  description: string;
  base_price: string;
  promotion_price?: string | null; // 促销价是可选的
  quantity: number;
  status: boolean;
  image: string | null; // image 字段名，且可能为 null
  menus_count: number;
  category?: {
    id: number;
    name: string;
  };
  menus?: Array<{
    id: number;
    name: string;
  }>;
  // 以下是前端可以自行计算或模拟的字段
  rating?: number;
  reviews?: number;
}

// API Fetching Logic
async function fetchPackages() {
  try {
    const response = await axios.get("/menu-packages");
    // API现在直接返回一个数组
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching packages:", error);
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

const PackageCard = ({ pkg, cartItems, addToCart, removeFromCart }: { pkg: PackageData; cartItems: Record<number, number>; addToCart: (id: number) => void; removeFromCart: (id: number) => void; }) => {
  const { t } = useLanguage();

  const description = pkg.description || `${pkg.name} - A delicious package.`;
  
  let itemsList = [];
  if (pkg.menus && Array.isArray(pkg.menus) && pkg.menus.length > 0) {
    itemsList = pkg.menus.slice(0, 3).map(menu => menu.name);
    if (pkg.menus.length > 3) {
      itemsList.push(`...and ${pkg.menus.length - 3} more items`);
    }
  } else {
    itemsList = [t("includesItemsFromPackage") || `Includes items from ${pkg.name}`];
  }

  // 修正 2: 价格逻辑更新
  const hasPromo = pkg.promotion_price && parseFloat(pkg.promotion_price) > 0;
  const displayPrice = hasPromo ? pkg.promotion_price : pkg.base_price;
  const subtotal = (parseFloat(displayPrice!) * (cartItems[pkg.id] || 0)).toFixed(2);

  // 修正 3: 图片 URL 构建逻辑
  // 后端返回的路径是 /storage/...，我们需要加上域名
  const fullImageUrl = pkg.image
    ? `http://127.0.0.1:8000${pkg.image}`
    : "/placeholder.svg";

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      <Link href={`/package/${pkg.id}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
          <Image
            src={fullImageUrl}
            alt={pkg.name || "Package Image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.currentTarget.srcset = "/placeholder.svg"; e.currentTarget.src = "/placeholder.svg"; }}
          />
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-bold text-gray-900 truncate pr-2">{pkg.name}</h4>
            {pkg.category && (
              <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-600 text-xs flex-shrink-0 ml-2">
                {pkg.category.name}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2" title={description}>
            {description}
          </p>
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">{t("packageIncludes")}:</h5>
            <div className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">{itemsList.join(" • ")}</div>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
              <span>{pkg.rating || "4.7"}</span>
            </div>
            <span>({pkg.reviews || Math.floor(Math.random() * 200) + 1} {t("reviews")})</span>
          </div>

          <div className="flex items-baseline justify-end mb-4 gap-2">
            {hasPromo && (
              <span className="text-gray-500 line-through text-lg">
                RM{parseFloat(pkg.base_price).toFixed(2)}
              </span>
            )}
            <span className="text-orange-500 font-bold text-2xl">
              RM{parseFloat(displayPrice!).toFixed(2)}
            </span>
          </div>
          
          {cartItems[pkg.id] > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <button className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors" onClick={() => removeFromCart(pkg.id)}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold text-lg min-w-[30px] text-center">{cartItems[pkg.id]}</span>
                <button className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all" onClick={() => addToCart(pkg.id)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">{t("subtotalPrice")} RM{subtotal}</span>
              </div>
            </div>
          ) : (
            <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <Link href={`/package/${pkg.id}`}>{t("viewDetail") || "View Detail"}</Link>
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
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const packagesData = await fetchPackages();
      setPackages(packagesData);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      setError(t("errorFetchingData") || "Could not load the packages. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (itemId: number) => setCartItems(p => ({ ...p, [itemId]: (p[itemId] || 0) + 1 }));
  const removeFromCart = (itemId: number) => setCartItems(p => ({ ...p, [itemId]: Math.max((p[itemId] || 0) - 1, 0) }));

  const totalCartItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0);

  // Loading and Error states remain the same

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <MenuHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("featuredPackages")}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("featuredPackagesDesc")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">{t("packageSelection")}</h2>
            <div className="absolute right-0 flex items-center">
              <Button onClick={loadData} className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105">
                <RefreshCw className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{t("refresh") || "Refresh"}</span>
              </Button>
            </div>
          </div>
          
          {loading && <div className="text-center py-12 text-gray-500">{t("loading")}...</div>}
          {error && <div className="text-center py-12 text-red-500">{error}</div>}
          {!loading && !error && (
            <>
              {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} cartItems={cartItems} addToCart={addToCart} removeFromCart={removeFromCart} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">{t("noPackagesAvailable")}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}