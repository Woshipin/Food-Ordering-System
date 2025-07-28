"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { useLanguage } from "../../../components/LanguageProvider";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { useAuth } from "../../../context/AuthContext";
import axios from "../../../lib/axios";
import { toast } from "sonner";

// --- Type Definitions ---
interface Variant {
  id: number;
  name: string;
  price_modifier: number;
}

interface Addon {
  id: number;
  name: string;
  price: number;
}

interface Menu {
  id: number;
  name: string;
  description: string;
  base_price: number;
  addons: Addon[];
  variants: Variant[];
}

interface PackageData {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  menus: Menu[];
}

// --- Main Component ---
export default function PackageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [packageItem, setPackageItem] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, number>
  >({});
  const [selectedAddons, setSelectedAddons] = useState<
    Record<number, number[]>
  >({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const fetchPackage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/menu-packages/${id}`);
      setPackageItem(response.data.data);
    } catch (err) {
      setError(
        t("Error Fetching Package") ||
          "Could not load the package details. Please try again later."
      );
      console.error("Failed to fetch package:", err);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) {
      fetchPackage();
    }
  }, [id, fetchPackage]);

  const handleVariantChange = (menuId: number, variantId: number) => {
    setSelectedVariants((prev) => ({ ...prev, [menuId]: variantId }));
  };

  const handleAddonToggle = (menuId: number, addonId: number) => {
    setSelectedAddons((prev) => {
      const currentAddons = prev[menuId] || [];
      const newAddons = currentAddons.includes(addonId)
        ? currentAddons.filter((id) => id !== addonId)
        : [...currentAddons, addonId];
      return { ...prev, [menuId]: newAddons };
    });
  };

  const calculateTotalPrice = useCallback(() => {
    if (!packageItem) return 0;

    let total = packageItem.price;

    packageItem.menus.forEach((menu) => {
      total += menu.base_price;

      const variantId = selectedVariants[menu.id];
      if (variantId) {
        const variant = menu.variants.find((v) => v.id === variantId);
        if (variant) {
          total += variant.price_modifier;
        }
      }

      const addonIds = selectedAddons[menu.id] || [];
      addonIds.forEach((addonId) => {
        const addon = menu.addons.find((a) => a.id === addonId);
        if (addon) {
          total += addon.price;
        }
      });
    });

    return total * quantity;
  }, [packageItem, selectedVariants, selectedAddons, quantity]);

  const addToCart = async () => {
    if (!packageItem) return;

    if (!isAuthenticated) {
      toast.error(t("Login To Add") || "Please log in to add items to your cart.");
      router.push("/auth/login");
      return;
    }

    setIsAddingToCart(true);
    const toastId = toast.loading(t("Adding to cart") || "Adding to cart...");

    const menusPayload = packageItem.menus.map(menu => {
        const selectedVariantId = selectedVariants[menu.id];
        const selectedVariant = menu.variants.find(v => v.id === selectedVariantId);

        const selectedAddonIds = selectedAddons[menu.id] || [];
        const selectedAddonsDetails = menu.addons.filter(a => selectedAddonIds.includes(a.id)).map(addon => ({
            addon_id: addon.id,
            addon_name: addon.name,
            addon_price: addon.price
        }));

        return {
            menu_id: menu.id,
            menu_name: menu.name,
            menu_description: menu.description,
            base_price: menu.base_price,
            promotion_price: null,
            quantity: 1,
            variants: selectedVariant ? [{
                variant_id: selectedVariant.id,
                variant_name: selectedVariant.name,
                variant_price: selectedVariant.price_modifier
            }] : [],
            addons: selectedAddonsDetails
        };
    });

    const cartPayload = {
        menu_package_id: packageItem.id,
        package_name: packageItem.name,
        package_description: packageItem.description,
        package_price: packageItem.price,
        quantity: quantity,
        menus: menusPayload
    };

    try {
        await axios.post("/cart/package/add", cartPayload);
        toast.success(t("Package added to cart successfully") || "Package added to cart successfully!", {
            id: toastId,
        });
    } catch (error: any) {
        console.error("Failed to add package to cart:", error);
        toast.error(
            t("Add To Cart Failed") || "Failed to add package to cart. Please try again.",
            {
                id: toastId,
                description: error.response?.data?.message || error.message,
            }
        );
    } finally {
        setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border border-orange-100">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto mb-6" />
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-orange-100 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("Loading Package") || "Loading Package..."}
          </h2>
          <p className="text-gray-600">
            {t("Loading Message") || "Please wait while we prepare your delicious package details"}
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full border border-red-200">
          <div className="relative mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-red-100 opacity-30 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t("errorOccurred") || "Oops! Something went wrong"}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <Button
            onClick={fetchPackage}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t("retry") || "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  if (!packageItem) {
    return null;
  }

  const MenuHeader = () => {
    const { t } = useLanguage();
    return (
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-2xl backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-xl transition-all duration-300 cursor-pointer hover:scale-110"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {t("packageDetailTitle") || "Package Detail"}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Link href="/cart">
                <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105 rounded-xl cursor-pointer">
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

  const totalPrice = calculateTotalPrice();
  const fullImageUrl = packageItem.image_url.startsWith("http")
    ? packageItem.image_url
    : `http://127.0.0.1:8000${packageItem.image_url}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <MenuHeader />

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-5 gap-6 md:gap-8 xl:gap-12">
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 shadow-2xl group">
                <Image
                  src={fullImageUrl}
                  alt={packageItem.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=400&width=600";
                  }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {packageItem.name}
                  </h1>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {packageItem.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 flex-shrink-0">
                  <Star className="h-5 w-5 text-orange-500 fill-orange-500" />
                  <span className="font-bold text-gray-800">4.8</span>
                  <span className="text-sm text-gray-500 hidden sm:inline">
                    (156 {t("reviews")})
                  </span>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center text-gray-900">
                <div className="p-3 bg-orange-100 rounded-xl mr-4">
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-orange-600" />
                </div>
                {t("packageIncludes") || "What's Inside"}
              </h2>
              <div className="space-y-6 md:space-y-8">
                {packageItem.menus.map((menu, index) => (
                  <div
                    key={menu.id}
                    className="p-4 md:p-6 border-2 border-orange-100 rounded-2xl transition-all duration-300 hover:shadow-lg hover:border-orange-200 bg-gradient-to-r from-white to-orange-50/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 flex-1">
                        {menu.name}
                      </h3>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium ml-4">
                        #{index + 1}
                      </span>
                    </div>

                    {menu.variants && menu.variants.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-base md:text-lg mb-4 text-gray-800 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          {t("selectVariant") || "Select Variant"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                          {menu.variants.map((variant) => (
                            <label
                              key={variant.id}
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                                selectedVariants[menu.id] === variant.id
                                  ? "border-orange-500 bg-orange-50 shadow-lg ring-2 ring-orange-200"
                                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`variant-${menu.id}`}
                                checked={
                                  selectedVariants[menu.id] === variant.id
                                }
                                onChange={() =>
                                  handleVariantChange(menu.id, variant.id)
                                }
                                className="hidden"
                              />
                              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                                selectedVariants[menu.id] === variant.id
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-gray-300"
                              }`}>
                                {selectedVariants[menu.id] === variant.id && (
                                  <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                                )}
                              </div>
                              <span className="font-medium text-gray-800 flex-1">
                                {variant.name}
                              </span>
                              {variant.price_modifier > 0 && (
                                <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg">
                                  +RM{variant.price_modifier.toFixed(2)}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {menu.addons && menu.addons.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-base md:text-lg mb-4 text-gray-800 flex items-center">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                          {t("chooseAddons") || "Choose Add-ons"}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {menu.addons.map((addon) => (
                            <label
                              key={addon.id}
                              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                                selectedAddons[menu.id]?.includes(addon.id)
                                  ? "border-orange-500 bg-orange-50 shadow-lg ring-2 ring-orange-200"
                                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  selectedAddons[menu.id]?.includes(addon.id) ||
                                  false
                                }
                                onChange={() =>
                                  handleAddonToggle(menu.id, addon.id)
                                }
                                className={`h-5 w-5 rounded border-2 cursor-pointer transition-all duration-200 ${
                                  selectedAddons[menu.id]?.includes(addon.id)
                                    ? "bg-orange-500 border-orange-500 text-white"
                                    : "border-gray-300 hover:border-orange-400"
                                }`}
                              />
                              <span className="font-medium text-gray-800 ml-3 flex-1">
                                {addon.name}
                              </span>
                              {addon.price > 0 && (
                                <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg ml-auto">
                                  +RM{addon.price.toFixed(2)}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-2">
            <div className="sticky top-28 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
                <h2 className="text-2xl font-bold mb-6">
                  {t("summary") || "Summary"}
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
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

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">
                      {t("totalPrice") || "Total Price"}
                    </span>
                    <span className="text-3xl font-extrabold text-orange-600">
                      RM{totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-7 rounded-xl cursor-pointer transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={addToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-3 h-6 w-6" />
                    )}
                    {isAddingToCart
                      ? t("adding") || "Adding..."
                      : t("addToCart") || "Add to Cart"}
                  </Button>
                </div>
              </section>
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
}