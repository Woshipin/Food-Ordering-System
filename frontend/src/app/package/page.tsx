"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, RefreshCw, ChevronLeft, ChevronRight, Users, Star, Plus, Minus } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"
import axios from "../../lib/axios"

// Type Definitions
interface PackageData {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  status: string;
  image_url: string;
  menus_count: number;
  category?: {
    id: number;
    name: string;
  };
  menus?: Array<{
    id: number;
    name: string;
    base_price: string;
  }>;
  // Optional fields that might come from API or be calculated
  serves?: string;
  rating?: number;
  reviews?: number;
}

interface Category {
  id: number;
  name: string;
  count?: number;
}

// API Fetching Logic
async function fetchPackages() {
  try {
    const response = await axios.get("/menu-packages");
    const data = response.data;
    if (data.data && Array.isArray(data.data)) {
      // Laravel paginated response
      return data.data;
    } else if (Array.isArray(data)) {
      // Direct array response
      return data;
    } else {
      console.error("Unexpected API response structure for packages:", data);
      return [];
    }
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

  // --- Fallback for missing data ---
  const description = pkg.description || `${pkg.name} - A delicious package.`;
  // Create a simple items list from menus if available
  let itemsList = [];
  if (pkg.menus && Array.isArray(pkg.menus) && pkg.menus.length > 0) {
    // Limit to first 3 items for display
    itemsList = pkg.menus.slice(0, 3).map(menu => `${menu.name}`);
    if (pkg.menus.length > 3) {
      itemsList.push(`...and ${pkg.menus.length - 3} more items`);
    }
  } else {
    itemsList = [t("includesItemsFromPackage") || `Includes items from ${pkg.name}`];
  }
  const displayPrice = parseFloat(pkg.price).toFixed(2);
  const subtotal = (parseFloat(pkg.price) * (cartItems[pkg.id] || 0)).toFixed(2);
  // --- End Fallbacks ---

  // Construct the full image URL
  let fullImageUrl = "/placeholder.svg?height=300&width=400";
  if (pkg.image_url) {
    // Check if it's already a full URL or needs the base path
    if (pkg.image_url.startsWith('http')) {
      fullImageUrl = pkg.image_url;
    } else {
      // Assuming your Laravel storage URL structure
      fullImageUrl = `http://127.0.0.1:8000${pkg.image_url}`;
    }
  }

  return (
    <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100 flex flex-col">
      {/* Image Section - Using the same approach as MenuPage */}
      <Link href={`/package/${pkg.id}`} className="block">
        <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
          <div className="absolute inset-0 p-4 flex items-center justify-center">
            <img
              src={fullImageUrl}
              alt={pkg.name || "Package Image"}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
              onError={(e) => {
                 // Fallback if the image fails to load
                 e.currentTarget.src = "/placeholder.svg?height=300&width=400";
              }}
            />
          </div>
        </div>
      </Link>
      
      {/* Content Section */}
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
          <p className="text-gray-600 text-sm mb-3 truncate" title={description}>
            {description}
          </p>
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-gray-700 mb-1">{t("packageIncludes")}:</h5>
            <div className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">{itemsList.join(" • ")}</div>
          </div>
        </div>
        
        <div className="mt-auto">
           {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
              <span>{pkg.rating ? pkg.rating : "4.7"}</span>
            </div>
            <span>
              ({pkg.reviews ? pkg.reviews : Math.floor(Math.random() * 200)} {t("reviews")})
            </span>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-baseline justify-end mb-4">
            <span className="text-orange-500 font-bold text-xl">RM{displayPrice}</span>
          </div>
          
          {cartItems[pkg.id] > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3">
                <button
                  className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent link click
                    removeFromCart(pkg.id);
                  }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold text-lg min-w-[30px] text-center">{cartItems[pkg.id]}</span>
                <button
                  className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent link click
                    addToCart(pkg.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">{t("subtotalPrice")} RM{subtotal}</span>
              </div>
            </div>
          ) : (
            <Link href={`/package/${pkg.id}`} className="w-full">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                {t("viewDetail") || "View Detail"}
              </Button>
            </Link>
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

  const addToCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const totalCartItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">{t("loading")}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t("error")}</h2>
          <p className="text-gray-700">{error}</p>
          <Button onClick={loadData} className="mt-4">
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <MenuHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("featuredPackages")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("featuredPackagesDesc")}
            </p>
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
          <div className="relative flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {t("packageSelection")}
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
                <div className="text-center py-12">
                  <p className="text-gray-500">{t("noPackagesAvailable")}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg p-8 border border-orange-200">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">{t("packageAdvantages")}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("betterPrice")}</h4>
              <p className="text-sm text-gray-600">{t("betterPriceDesc")}</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("nutritionalBalance")}</h4>
              <p className="text-sm text-gray-600">{t("nutritionalBalanceDesc")}</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("convenientChoice")}</h4>
              <p className="text-sm text-gray-600">{t("convenientChoiceDesc")}</p>
            </div>
          </div>
        </div>
      </div>

       {/* Floating Cart Button for Mobile */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Link href="/cart">
            <Button className="rounded-full h-14 w-14 bg-orange-500 hover:bg-orange-600 shadow-lg">
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {totalCartItems}
              </Badge>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}