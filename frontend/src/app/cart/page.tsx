"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  MapPin,
  Clock,
  CreditCard,
  ArrowLeft,
  Package,
  ArrowRight,
  Home,
  Car,
  UtensilsCrossed,
  CheckCircle,
  Edit3,
  Users,
  Wallet,
  Smartphone,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useLanguage } from "../../components/LanguageProvider";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";
import { toast } from "sonner";

// --- Type Definitions ---
interface Addon {
    addon_name: string;
    addon_price: number;
}

interface Variant {
    variant_name: string;
    variant_price: number;
}

interface CartMenuItem {
    id: number;
    menu_name: string;
    base_price: number;
    promotion_price?: number;
    quantity: number;
    menu_description: string;
    addons: Addon[];
    variants: Variant[];
    image_url?: string | null;
    category_name?: string;
}

interface CartPackageItemMenu {
    id: number;
    menu_name: string;
    addons: Addon[];
    variants: Variant[];
}

interface CartPackageItem {
    id: number;
    package_name: string;
    package_price: number;
    promotion_price?: number;
    quantity: number;
    package_description: string;
    menus: CartPackageItemMenu[];
    package_image?: string | null;
    category_name?: string;
}

interface CartData {
    id: number;
    user_id: number;
    menu_items: CartMenuItem[];
    package_items: CartPackageItem[];
}

// --- 辅助函数: 构建完整的图片 URL ---
const getFullImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
        return "/placeholder.svg"; // 如果路径为空，返回占位符
    }
    // 检查路径是否已经是完整的 URL
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    // 检查路径是否是 /storage/... 格式
    if (imagePath.startsWith('/storage/')) {
        return `http://127.0.0.1:8000${imagePath}`;
    }
    // 否则，假设是 menu-packages/xxx.jpg 格式，拼接 /storage/
    return `http://127.0.0.1:8000/storage/${imagePath}`;
};

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get("/cart");
        setCartData(response.data.cart);
      } catch (err) {
        setError(t("errorFetchingCart") || "Failed to fetch cart data.");
        toast.error(t("errorFetchingCart") || "Failed to fetch cart data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [isAuthenticated, router, t]);

  const calculateItemTotal = (item: CartMenuItem) => {
    const basePrice = item.promotion_price ?? item.base_price;
    const addonsPrice = item.addons.reduce((sum, addon) => sum + Number(addon.addon_price), 0);
    const variantsPrice = item.variants.reduce((sum, variant) => sum + Number(variant.variant_price), 0);
    return (Number(basePrice) + addonsPrice + variantsPrice) * item.quantity;
  };

  const calculatePackageTotal = (pkg: CartPackageItem) => {
      const basePrice = pkg.promotion_price ?? pkg.package_price;
      let packageExtras = 0;
      pkg.menus.forEach(menu => {
          packageExtras += menu.addons.reduce((sum, addon) => sum + Number(addon.addon_price), 0);
          packageExtras += menu.variants.reduce((sum, variant) => sum + Number(variant.variant_price), 0);
      });
      return (Number(basePrice) + packageExtras) * pkg.quantity;
  };

  const subtotal = cartData
    ? cartData.menu_items.reduce((sum, item) => sum + calculateItemTotal(item), 0) +
      cartData.package_items.reduce((sum, pkg) => sum + calculatePackageTotal(pkg), 0)
    : 0;

  const totalItems = cartData
    ? cartData.menu_items.length + cartData.package_items.length
    : 0;

  const [serviceType, setServiceType] = useState("delivery");
  const deliveryFee = serviceType === "delivery" ? (subtotal >= 50 ? 0 : 8) : 0;
  const [promoCode, setPromoCode] = useState("");
  const discount = promoCode === "SAVE10" ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;

  const nextStep = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleBack = () => { currentStep === 1 ? router.push("/") : prevStep(); };
  const canProceed = () => totalItems > 0;
  
  const steps = [
    { id: 1, title: t('cartStep'), description: t('confirmOrder') },
    { id: 2, title: t('serviceStep'), description: t('selectService') },
    { id: 3, title: t('paymentStep'), description: t('selectPayment') },
    { id: 4, title: t('confirmStep'), description: t('verifyInfo') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  const ProgressBar = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center w-28">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all z-10 ${
                    currentStep > step.id ? "bg-green-500 text-white" : currentStep === step.id ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? "text-orange-600" : "text-gray-500"}`}>
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-40 h-0.5 bg-gray-200 mt-5 relative">
                  <div className={`h-full bg-green-500 absolute transition-all duration-300`} style={{width: currentStep > step.id ? '100%' : '0%'}}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const CartItems = () => (
    <div className="space-y-6">
      {cartData?.menu_items && cartData.menu_items.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center">
              🍜 {t('individualDishes')} ({cartData.menu_items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {cartData.menu_items.map((item) => (
              <div key={item.id} className="flex items-end gap-4 p-4 bg-white rounded-2xl shadow-md">
                <Image
                  src={getFullImageUrl(item.image_url)}
                  alt={item.menu_name}
                  width={100}
                  height={100}
                  className="rounded-xl object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-gray-900">{item.menu_name}</h4>
                    {item.category_name && <Badge variant="outline">{item.category_name}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.menu_description}</p>
                  <div className="text-xs text-gray-500 space-y-1 my-2">
                      {item.variants.map((variant, idx) => <div key={idx}><strong>{t('variant')}:</strong> {variant.variant_name} (+RM{Number(variant.variant_price).toFixed(2)})</div>)}
                      {item.addons.map((addon, idx) => <div key={idx}><strong>{t('addon')}:</strong> {addon.addon_name} (+RM{Number(addon.addon_price).toFixed(2)})</div>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-500">
                      RM{calculateItemTotal(item).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold min-w-[30px] text-center">
                        {item.quantity}
                      </span>
                      <button className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {cartData?.package_items && cartData.package_items.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center">
              🍱 {t('packageCombos')} ({cartData.package_items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {cartData.package_items.map((pkg) => (
              <div key={pkg.id} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-md border border-orange-100">
                <Image
                  src={getFullImageUrl(pkg.package_image)}
                  alt={pkg.package_name}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <div className="flex-1">
                    <div className="flex justify-between">
                        <h4 className="font-bold text-gray-900">{pkg.package_name}</h4>
                        {pkg.category_name && <Badge variant="outline">{pkg.category_name}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pkg.package_description}</p>
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border">
                      <p className="text-xs font-medium text-gray-700 mb-2">{t('packageIncludes')}:</p>
                      {pkg.menus.map(menu => (
                          <div key={menu.id} className="text-xs text-gray-600 ml-2 my-1">
                              <strong>{menu.menu_name}</strong>
                              <div className="pl-2">
                                  {menu.variants.map((v, i) => <div key={i}>- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</div>)}
                                  {menu.addons.map((a, i) => <div key={i}>- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</div>)}
                              </div>
                          </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-500">
                        RM{calculatePackageTotal(pkg).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold min-w-[30px] text-center">
                          {pkg.quantity}
                        </span>
                        <button className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                <button className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-black"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Button>
              <h1 className="flex items-center text-xl sm:text-2xl font-bold text-white">
                <ShoppingCart className="mr-2 sm:mr-3 h-6 w-6" />
                {steps[currentStep - 1].title}
              </h1>
            </div>
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <ProgressBar />

      <main className="container mx-auto px-4 py-8">
        {totalItems === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('cartEmpty')}</h2>
            <p className="text-gray-500 mb-6">{t('cartEmptyDesc')}</p>
            <Link href="/menu">
              <Button className="bg-orange-500 hover:bg-orange-600">
                {t('goOrder')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              {currentStep === 1 && <CartItems />}
              {/* Steps 2, 3, 4 would be rendered here based on currentStep */}
            </div>

            <div className="space-y-6 sticky top-28">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    {t('orderSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('itemSubtotal')}</span>
                      <span>RM{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('deliveryFee')}</span>
                      <span>
                        {deliveryFee === 0 ? t('free') : `RM${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('discount')}</span>
                        <span>-RM{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('total')}</span>
                      <span className="text-orange-500">RM{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 rounded-xl shadow-lg"
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  {t('selectServiceBtn')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}