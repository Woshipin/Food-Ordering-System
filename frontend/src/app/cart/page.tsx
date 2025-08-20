// @/app/cart/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  ArrowRight,
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
import { Separator } from "../../components/ui/separator";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useLanguage } from "../../components/LanguageProvider";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";
import { toast } from "sonner";
import {
    CartData,
    ServiceMethod,
    PaymentMethod,
    Address,
} from "./lib/lib";
import {
    calculateDistance,
    calculateItemTotal,
    calculatePackageTotal,
} from "./function/cartfunction";
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import { LoadingOverlay } from "../../components/LoadingOverlay"; // <--- 新增：导入加载组件

export default function CartPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [serviceMethods, setServiceMethods] = useState<ServiceMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [storeLocation, setStoreLocation] = useState<{ latitude: number; longitude: number; } | null>(null);

  const [serviceType, setServiceType] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<number | null>(null);
  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [promoCode, setPromoCode] = useState("");
  const discount = promoCode === "SAVE10" ? 0.1 : 0;
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistance, setDeliveryDistance] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [cartResponse, optionsResponse, addressResponse, contactCmsResponse] = await Promise.all([
            axios.get("/cart"),
            axios.get("/checkout-options"),
            axios.get("/address"),
            axios.get(`/cms/contact?lang=${language}`)
        ]);

        if (cartResponse.data && cartResponse.data.cart) {
          setCartData(cartResponse.data.cart);
        }

        const optionsData = optionsResponse.data.data;
        if (optionsData && optionsData.service_methods) {
            setServiceMethods(optionsData.service_methods);
            if (optionsData.service_methods.length > 0) {
                setServiceType(optionsData.service_methods[0].name);
            }
        }
        if (optionsData && optionsData.payment_methods) {
            setPaymentMethods(optionsData.payment_methods);
            if (optionsData.payment_methods.length > 0) {
                setPaymentMethod(optionsData.payment_methods[0].name);
            }
        }

        const cmsData = contactCmsResponse.data;
        if (cmsData && Array.isArray(cmsData.contact_info)) {
            const locationInfo = cmsData.contact_info.find(
              (info: any) => info.latitude && info.longitude
            );
            if (locationInfo) {
              setStoreLocation({
                latitude: parseFloat(locationInfo.latitude),
                longitude: parseFloat(locationInfo.longitude),
              });
            }
        }
        
        const userAddresses = addressResponse.data;
        if (Array.isArray(userAddresses)) {
            setAddresses(userAddresses);
            const defaultAddress = userAddresses.find((addr: Address) => addr.is_default);
            if (defaultAddress) {
                setDeliveryAddress(defaultAddress.id);
            } else if (userAddresses.length > 0) {
                setDeliveryAddress(userAddresses[0].id);
            }
        }

      } catch (err: any) {
        console.error("Failed to fetch initial cart data:", err);
        const errorMessage = err.response?.data?.message || "加载页面数据失败。";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authIsLoading) {
      if (isAuthenticated) {
        fetchInitialData();
      } else {
        router.push("/auth/login");
      }
    }
  }, [authIsLoading, isAuthenticated, router, language]);

  useEffect(() => {
    if (serviceType !== 'delivery') {
      setDeliveryFee(0);
      setDeliveryDistance(0);
      setIsCalculatingFee(false);
      return;
    }
  
    if (deliveryAddress && storeLocation && addresses.length > 0) {
      setIsCalculatingFee(true);
      
      const selectedAddress = addresses.find(addr => addr.id === deliveryAddress);
  
      if (selectedAddress && selectedAddress.latitude && selectedAddress.longitude && storeLocation.latitude && storeLocation.longitude) {
        const distance = calculateDistance(
          storeLocation.latitude,
          storeLocation.longitude,
          parseFloat(selectedAddress.latitude),
          parseFloat(selectedAddress.longitude)
        );
  
        const PER_KM_RATE = 1.00;
        const calculatedFee = distance * PER_KM_RATE;
  
        setDeliveryFee(calculatedFee);
        setDeliveryDistance(distance);
      } else {
        const staticFee = Number(serviceMethods.find(s => s.name === 'delivery')?.fee || 5.00);
        setDeliveryFee(staticFee);
        setDeliveryDistance(0);
      }
  
      setTimeout(() => setIsCalculatingFee(false), 300);
    } else {
      setIsCalculatingFee(true);
    }
  }, [serviceType, deliveryAddress, storeLocation, addresses, serviceMethods]);

  const subtotal = React.useMemo(() => {
    if (!cartData) return 0;
    const menuTotal = cartData.menu_items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const packageTotal = cartData.package_items.reduce((sum, pkg) => sum + calculatePackageTotal(pkg), 0);
    return menuTotal + packageTotal;
  }, [cartData]);

  const discountAmount = React.useMemo(() => subtotal * discount, [subtotal, discount]);
  const total = React.useMemo(() => subtotal + deliveryFee - discountAmount, [subtotal, deliveryFee, discountAmount]);

  const totalItems = React.useMemo(() => {
    if (!cartData) return 0;
    const menuCount = cartData.menu_items.reduce((sum, item) => sum + item.quantity, 0);
    const packageCount = cartData.package_items.reduce((sum, pkg) => sum + pkg.quantity, 0);
    return menuCount + packageCount;
  }, [cartData]);

  const canProceed = () => {
    if (currentStep === 1) return totalItems > 0;
    if (currentStep === 2) {
        if (serviceType === 'delivery') {
            return deliveryAddress && !isCalculatingFee;
        }
        return !!serviceType;
    }
    if (currentStep === 3) return !!paymentMethod;
    return true;
  };

  const nextStep = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleBack = () => { currentStep === 1 ? router.push("/") : prevStep(); };
  
  const steps = [
    { id: 1, title: t('cartStep') || 'Cart', description: t('confirmOrder') || 'Review Items' },
    { id: 2, title: t('serviceStep') || 'Service', description: t('selectService') || 'Choose Service' },
    { id: 3, title: t('paymentStep') || 'Payment', description: t('selectPayment') || 'Payment Method' },
    { id: 4, title: t('confirmStep') || 'Confirm', description: t('verifyInfo') || 'Final Review' },
  ];

  const handlePlaceOrder = async () => {
    if (!cartData || isPlacingOrder) return;
    setIsPlacingOrder(true);
    const orderData = {
      service_method_name: serviceType,
      payment_method_name: paymentMethod,
      address_id: serviceType === 'delivery' ? deliveryAddress : null,
      pickup_time: serviceType === 'pickup' && pickupTime ? pickupTime.slice(0, 16) : null,
      special_instructions: specialInstructions,
      promo_code: promoCode,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      subtotal: subtotal,
      total_amount: total,
    };
    try {
      const response = await axios.post('/orders/add', orderData);
      toast.success(response.data.message);
      router.push("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "提交订单失败。";
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  // --- 修改开始：替换初始加载UI ---
  if (isLoading || authIsLoading) {
    return (
      <LoadingOverlay
        isFullScreen={true}
        title={t("Loading Cart")}
        description={t("Please wait while we fetch your cart details")}
      />
    );
  }
  // --- 修改结束 ---

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-500">
        <p className="mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1 cartData={cartData} setCartData={setCartData} />;
      case 2:
        return (
          <Step2
            serviceType={serviceType}
            setServiceType={setServiceType}
            serviceMethods={serviceMethods}
            deliveryFee={deliveryFee}
            deliveryDistance={deliveryDistance}
            isCalculatingFee={isCalculatingFee}
            pickupTime={pickupTime}
            setPickupTime={setPickupTime}
            specialInstructions={specialInstructions}
            setSpecialInstructions={setSpecialInstructions}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            addresses={addresses}
          />
        );
      case 3:
        return (
          <Step3
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentMethods={paymentMethods}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
          />
        );
      case 4:
        return (
          <Step4
            cartData={cartData}
            serviceType={serviceType}
            serviceMethods={serviceMethods}
            deliveryAddress={deliveryAddress}
            addresses={addresses}
            pickupTime={pickupTime}
            specialInstructions={specialInstructions}
            paymentMethod={paymentMethod}
            paymentMethods={paymentMethods}
          />
        );
      default:
        return <Step1 cartData={cartData} setCartData={setCartData} />;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 1: return 'Choose Service';
      case 2: return 'Select Payment';
      case 3: return 'Review Order';
      case 4: return 'Place Order';
      default: return 'Continue';
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
                    <div className="space-y-2 text-sm">
                        {cartData?.menu_items.map(item => (
                            <div key={`summary-menu-${item.id}`} className="flex justify-between text-gray-600">
                                <span>{item.menu_name} x {item.quantity}</span>
                                <span className="font-medium">RM{calculateItemTotal(item).toFixed(2)}</span>
                            </div>
                        ))}
                        {cartData?.package_items.map(pkg => (
                            <div key={`summary-pkg-${pkg.id}`} className="flex justify-between text-gray-600">
                                <span>{pkg.package_name} x {pkg.quantity}</span>
                                <span className="font-medium">RM{calculatePackageTotal(pkg).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                        <div className="flex justify-between text-gray-600 font-medium">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="font-semibold">RM{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                        <span>
                            Delivery Fee
                            {serviceType === 'delivery' && deliveryDistance > 0 && !isCalculatingFee && (
                                <span className="text-xs text-gray-500 ml-1">({deliveryDistance.toFixed(2)} km)</span>
                            )}
                        </span>
                        <span className="font-medium">
                            {serviceType !== 'delivery' ? (
                              <span className="text-gray-500">N/A</span>
                            ) : isCalculatingFee ? (
                              <span className="text-blue-500">Calculating...</span>
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
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl shadow-lg font-semibold transition-all duration-300 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={currentStep === 4 ? handlePlaceOrder : nextStep}
                  disabled={!canProceed() || isPlacingOrder}
                >
                  {isPlacingOrder && currentStep === 4 ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      {getNextButtonText()}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:border-orange-500 hover:text-orange-500 py-3 rounded-xl font-medium transition-all duration-300"
                    onClick={prevStep}
                    disabled={isPlacingOrder}
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