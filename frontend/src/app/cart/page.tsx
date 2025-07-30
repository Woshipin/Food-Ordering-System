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
  CreditCard,
  ArrowLeft,
  Package,
  ArrowRight,
  Car,
  UtensilsCrossed,
  Wallet,
  Smartphone,
  Check,
  Loader2,
  Store,
  Truck,
  Banknote,
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
    menu_name:string;
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

// --- Helper function: Build complete image URL ---
const getFullImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
        return "/placeholder.svg";
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    if (imagePath.startsWith('/storage/')) {
        return `http://127.0.0.1:8000${imagePath}`;
    }
    return `http://127.0.0.1:8000/storage/${imagePath}`;
};

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 2 - Service selection
  const [serviceType, setServiceType] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 3 - Payment selection
  const [paymentMethod, setPaymentMethod] = useState("credit");

  // Pricing calculations
  const deliveryFee = serviceType === "delivery" ? 8 : 0;
  const [promoCode, setPromoCode] = useState("");
  const discount = promoCode === "SAVE10" ? 0.1 : 0;

  useEffect(() => {
    const fetchCart = async () => {
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

    if (!authIsLoading) {
      if (isAuthenticated) {
        fetchCart();
      } else {
        router.push("/auth/login");
      }
    }
  }, [authIsLoading, isAuthenticated, router, t]);
  
  // --- Handlers for quantity changes ---
  const handleUpdateMenuQuantity = (menuId: number, newQuantity: number) => {
    setCartData(prevCart => {
      if (!prevCart) return null;
      const updatedCart = JSON.parse(JSON.stringify(prevCart)); // Deep copy
      if (newQuantity > 0) {
        const item = updatedCart.menu_items.find((item: CartMenuItem) => item.id === menuId);
        if (item) item.quantity = newQuantity;
      } else {
        updatedCart.menu_items = updatedCart.menu_items.filter((item: CartMenuItem) => item.id !== menuId);
      }
      return updatedCart;
    });
  };

  const handleUpdatePackageQuantity = (packageId: number, newQuantity: number) => {
    setCartData(prevCart => {
      if (!prevCart) return null;
      const updatedCart = JSON.parse(JSON.stringify(prevCart)); // Deep copy
      if (newQuantity > 0) {
        const pkg = updatedCart.package_items.find((pkg: CartPackageItem) => pkg.id === packageId);
        if (pkg) pkg.quantity = newQuantity;
      } else {
        updatedCart.package_items = updatedCart.package_items.filter((pkg: CartPackageItem) => pkg.id !== packageId);
      }
      return updatedCart;
    });
  };

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

  const discountAmount = subtotal * discount;
  const total = subtotal + deliveryFee - discountAmount;

  const totalItems = cartData
    ? cartData.menu_items.reduce((sum, item) => sum + item.quantity, 0) +
      cartData.package_items.reduce((sum, pkg) => sum + pkg.quantity, 0)
    : 0;

  const nextStep = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleBack = () => { currentStep === 1 ? router.push("/") : prevStep(); };
  
  const canProceed = () => {
    if (currentStep === 1) return totalItems > 0;
    if (currentStep === 2) return serviceType && (serviceType !== "delivery" || deliveryAddress);
    if (currentStep === 3) return paymentMethod;
    return true;
  };
  
  const steps = [
    { id: 1, title: t('cartStep') || 'Cart', description: t('confirmOrder') || 'Review Items' },
    { id: 2, title: t('serviceStep') || 'Service', description: t('selectService') || 'Choose Service' },
    { id: 3, title: t('paymentStep') || 'Payment', description: t('selectPayment') || 'Payment Method' },
    { id: 4, title: t('confirmStep') || 'Confirm', description: t('verifyInfo') || 'Final Review' },
  ];

  if (isLoading || authIsLoading) {
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

  const ItemDetails = ({ item, type }: { item: CartMenuItem | CartPackageItem; type: 'menu' | 'package' }) => (
    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-3 space-y-2">
      {type === 'menu' ? (
        <>
          {(item as CartMenuItem).variants.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong className="text-orange-700">Variants:</strong>
              {(item as CartMenuItem).variants.map((v, i) => ( <div key={i} className="ml-2">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</div> ))}
            </div>
          )}
          {(item as CartMenuItem).addons.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong className="text-orange-700">Add-ons:</strong>
              {(item as CartMenuItem).addons.map((a, i) => ( <div key={i} className="ml-2">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</div> ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-orange-700 mb-2">Package includes:</p>
          {(item as CartPackageItem).menus.map(menu => (
            <div key={menu.id} className="text-xs text-gray-600">
              <strong>{menu.menu_name}</strong>
              {menu.variants.map((v, i) => ( <div key={i} className="ml-2 text-gray-500">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</div> ))}
              {menu.addons.map((a, i) => ( <div key={i} className="ml-2 text-gray-500">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</div> ))}
            </div>
          ))}
        </>
      )}
    </div>
  );

  const ItemCard = ({ item, type, isReadOnly = false }: { item: CartMenuItem | CartPackageItem; type: 'menu' | 'package', isReadOnly?: boolean }) => {
      const handleQuantityChange = (newQuantity: number) => {
        if (isReadOnly) return;
        const id = type === 'menu' ? (item as CartMenuItem).id : (item as CartPackageItem).id;
        if (type === 'menu') {
            handleUpdateMenuQuantity(id, newQuantity);
        } else {
            handleUpdatePackageQuantity(id, newQuantity);
        }
    };

    const hasDetails = type === 'menu' ? 
      ((item as CartMenuItem).variants.length > 0 || (item as CartMenuItem).addons.length > 0) : 
      ((item as CartPackageItem).menus.some(m => m.variants.length > 0 || m.addons.length > 0));

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row">
                <div className="relative md:w-48 w-full h-48 md:h-auto flex-shrink-0 bg-gray-100">
                    <Image
                        src={getFullImageUrl(type === 'menu' ? (item as CartMenuItem).image_url : (item as CartPackageItem).package_image)}
                        alt={type === 'menu' ? (item as CartMenuItem).menu_name : (item as CartPackageItem).package_name}
                        fill
                        className="object-contain p-2"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-lg">
                                {type === 'menu' ? (item as CartMenuItem).menu_name : (item as CartPackageItem).package_name}
                            </h4>
                            {item.category_name && (
                                <Badge variant="outline" className="border-orange-300 text-orange-600 bg-orange-50 text-xs">
                                    {item.category_name}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {type === 'menu' ? (item as CartMenuItem).menu_description : (item as CartPackageItem).package_description}
                        </p>
                        
                        {(hasDetails || type === 'package') && <ItemDetails item={item} type={type} />}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-xl font-bold text-orange-500">
                            RM{(type === 'menu' ? calculateItemTotal(item as CartMenuItem) : calculatePackageTotal(item as CartPackageItem)).toFixed(2)}
                        </div>
                        
                        {!isReadOnly && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-100 rounded-full">
                                    <button onClick={() => handleQuantityChange(item.quantity - 1)} className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={item.quantity <= 1}>
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="font-semibold min-w-[40px] text-center text-gray-800">
                                        {item.quantity}
                                    </span>
                                    <button onClick={() => handleQuantityChange(item.quantity + 1)} className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                
                                <button onClick={() => handleQuantityChange(0)} className="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors group">
                                    <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        )}
                         {isReadOnly && (
                            <div className="text-base text-gray-700 font-medium">
                                Qty: <span className="font-bold">{item.quantity}</span>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

  const CartItems = () => (
    <div className="space-y-8">
        {cartData?.menu_items && cartData.menu_items.length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <UtensilsCrossed className="mr-3 h-6 w-6" />
                        Individual Dishes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.menu_items.map((item) => (
                        <ItemCard key={`menu-${item.id}`} item={item} type="menu" />
                    ))}
                </CardContent>
            </Card>
        )}

        {cartData?.package_items && cartData.package_items.length > 0 && (
             <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Package className="mr-3 h-6 w-6" />
                        Package Combos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.package_items.map((pkg) => (
                        <ItemCard key={`pkg-${pkg.id}`} item={pkg} type="package" />
                    ))}
                </CardContent>
            </Card>
        )}
    </div>
  );

  const ServiceSelection = () => (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <CardTitle className="flex items-center text-xl">
          <Car className="mr-3 h-6 w-6" />
          Choose Your Service
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <RadioGroup value={serviceType} onValueChange={setServiceType} className="space-y-6">
          <Label htmlFor="delivery" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${serviceType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <RadioGroupItem value="delivery" id="delivery" />
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Delivery</div>
                <p className="text-sm text-gray-600">Get your food delivered to your doorstep</p>
                <p className="text-sm text-orange-600 font-medium">Delivery fee: RM8.00</p>
              </div>
            </div>
          </Label>

          <Label htmlFor="pickup" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${serviceType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <RadioGroupItem value="pickup" id="pickup" />
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Pick Up</div>
                <p className="text-sm text-gray-600">Collect your order from our restaurant</p>
                <p className="text-sm text-green-600 font-medium">No additional fee</p>
              </div>
            </div>
          </Label>

          <Label htmlFor="dinein" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${serviceType === 'dinein' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <RadioGroupItem value="dinein" id="dinein" />
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Dine In</div>
                <p className="text-sm text-gray-600">Enjoy your meal at our restaurant</p>
                <p className="text-sm text-blue-600 font-medium">Table service included</p>
              </div>
            </div>
          </Label>
        </RadioGroup>

        {serviceType === 'delivery' && (
          <div className="mt-8 space-y-4">
            <Label htmlFor="address" className="text-base font-semibold">Delivery Address</Label>
            <Textarea
              id="address"
              placeholder="Enter your complete delivery address..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="min-h-20 rounded-xl border-gray-300 focus:border-orange-500"
            />
          </div>
        )}

        {serviceType === 'pickup' && (
          <div className="mt-8 space-y-4">
            <Label htmlFor="pickupTime" className="text-base font-semibold">Preferred Pickup Time</Label>
            <Input
              id="pickupTime"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="rounded-xl border-gray-300 focus:border-orange-500"
            />
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Label htmlFor="instructions" className="text-base font-semibold">Special Instructions (Optional)</Label>
          <Textarea
            id="instructions"
            placeholder="Any special requests or instructions..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="min-h-16 rounded-xl border-gray-300 focus:border-orange-500"
          />
        </div>
      </CardContent>
    </Card>
  );

  const PaymentSelection = () => (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <CardTitle className="flex items-center text-xl">
          <CreditCard className="mr-3 h-6 w-6" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">
            <Label htmlFor="credit" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <RadioGroupItem value="credit" id="credit" />
                <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <div className="text-lg font-semibold">Credit Card</div>
                    <p className="text-sm text-gray-600">Pay securely with your credit card</p>
                </div>
                </div>
            </Label>
            
            <Label htmlFor="debit" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'debit' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <RadioGroupItem value="debit" id="debit" />
                <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <div className="text-lg font-semibold">Debit Card</div>
                    <p className="text-sm text-gray-600">Pay directly from your bank account</p>
                </div>
                </div>
            </Label>

            <Label htmlFor="cash" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <RadioGroupItem value="cash" id="cash" />
                <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                    <div className="text-lg font-semibold">Cash</div>
                    <p className="text-sm text-gray-600">Pay with cash upon delivery/pickup</p>
                </div>
                </div>
            </Label>

            <Label htmlFor="tng" className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'tng' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <RadioGroupItem value="tng" id="tng" />
                <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <div className="text-lg font-semibold">Touch 'n Go eWallet</div>
                    <p className="text-sm text-gray-600">Quick and secure mobile payment</p>
                </div>
                </div>
            </Label>
        </RadioGroup>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
          <h4 className="font-semibold text-gray-900 mb-4">Promo Code</h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 rounded-xl border-gray-300 focus:border-orange-500"
            />
            <Button 
              className="bg-orange-500 hover:bg-orange-600 px-6 rounded-xl"
              onClick={() => toast.success("Promo code applied!")}
            >
              Apply
            </Button>
          </div>
          {promoCode === "SAVE10" && (
            <p className="text-green-600 text-sm mt-2">✓ 10% discount applied!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const OrderConfirmation = () => (
    <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
             <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Car className="mr-3 h-6 w-6" />
                        Service Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-sm space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-medium capitalize">{serviceType}</span>
                    </div>
                    {serviceType === 'delivery' && deliveryAddress && (
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-600 flex-shrink-0">Address:</span>
                            <span className="font-medium text-right">{deliveryAddress}</span>
                        </div>
                    )}
                    {serviceType === 'pickup' && pickupTime && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pickup Time:</span>
                            <span className="font-medium">{new Date(pickupTime).toLocaleString()}</span>
                        </div>
                    )}
                    {specialInstructions && (
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-600 flex-shrink-0">Instructions:</span>
                            <span className="font-medium text-right">{specialInstructions}</span>
                        </div>
                    )}
                </CardContent>
             </Card>
             <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <CreditCard className="mr-3 h-6 w-6" />
                        Payment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-sm space-y-3">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">
                            {paymentMethod === 'tng' ? 'Touch \'n Go eWallet' : paymentMethod === 'credit' ? 'Credit Card' : paymentMethod === 'debit' ? 'Debit Card' : 'Cash'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {cartData?.menu_items && cartData.menu_items.length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <UtensilsCrossed className="mr-3 h-6 w-6" />
                        Individual Dishes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.menu_items.map((item) => (
                        <ItemCard key={`confirm-menu-${item.id}`} item={item} type="menu" isReadOnly={true} />
                    ))}
                </CardContent>
            </Card>
        )}
        
        {cartData?.package_items && cartData.package_items.length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Package className="mr-3 h-6 w-6" />
                        Package Combos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.package_items.map((pkg) => (
                        <ItemCard key={`confirm-pkg-${pkg.id}`} item={pkg} type="package" isReadOnly={true} />
                    ))}
                </CardContent>
            </Card>
        )}
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CartItems />;
      case 2:
        return <ServiceSelection />;
      case 3:
        return <PaymentSelection />;
      case 4:
        return <OrderConfirmation />;
      default:
        return <CartItems />;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Choose Service';
      case 2:
        return 'Select Payment';
      case 3:
        return 'Review Order';
      case 4:
        return 'Place Order';
      default:
        return 'Continue';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-xl"
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
        {totalItems === 0 && currentStep === 1 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-600 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start browsing our delicious menu!
            </p>
            <Link href="/menu">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg">
                Browse Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              {getStepContent()}
            </div>

            <div className="space-y-6 sticky top-28">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                  <CardTitle className="flex items-center text-lg">
                    <Package className="mr-2 h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-medium">RM{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="font-medium">
                        {deliveryFee === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `RM${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (10%)</span>
                        <span className="font-medium">-RM{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-500">RM{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl shadow-lg font-semibold transition-all duration-300 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={currentStep === 4 ? () => toast.success("Order placed successfully!") : nextStep}
                  disabled={!canProceed()}
                >
                  {getNextButtonText()}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 py-3 rounded-xl font-medium transition-all duration-300"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {steps[currentStep - 2]?.title}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}