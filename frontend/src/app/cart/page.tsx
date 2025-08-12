// @/app/cart/page.tsx
// 这是购物车页面的主组件文件。
// 它负责处理页面的状态管理、数据获取、用户交互以及渲染所有UI组件。
// 通过将类型定义和辅助函数分离到其他文件中，该文件专注于组件的结构和逻辑。
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

// 从 './lib' 文件中导入所有类型定义
import {
    CartData,
    ServiceMethod,
    PaymentMethod,
    Address,
} from "./lib/lib";

// 从 './cartfunction' 文件中导入所有辅助函数和功能组件
import {
    calculateDistance,
    calculateItemTotal,
    calculatePackageTotal,
} from "./function/cartfunction";

import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';

// 购物车页面的主功能组件
export default function CartPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  // --- State Management (状态管理) ---
  // 使用 React Hooks (useState) 来管理组件的各种状态

  // cartData: 存储从后端获取的整个购物车的数据
  const [cartData, setCartData] = useState<CartData | null>(null);
  // isLoading: 页面初始数据是否正在加载中
  const [isLoading, setIsLoading] = useState(true);
  // isPlacingOrder: 是否正在提交订单，用于防止用户重复点击
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // error: 存储数据加载或提交过程中发生的错误信息
  const [error, setError] = useState<string | null>(null);
  // currentStep: 控制用户在哪个结账步骤 (1: 购物车, 2: 服务, 3: 支付, 4: 确认)
  const [currentStep, setCurrentStep] = useState(1);

  // serviceMethods: 存储所有可用的服务方式 (如外卖, 自取)
  const [serviceMethods, setServiceMethods] = useState<ServiceMethod[]>([]);
  // paymentMethods: 存储所有可用的支付方式
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  // addresses: 存储用户的所有收货地址
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // storeLocation: 存储店铺的地理位置坐标，用于计算外卖距离
  const [storeLocation, setStoreLocation] = useState<{ latitude: number; longitude: number; } | null>(null);

  // --- User Selections (用户选择) ---
  // serviceType: 用户选择的服务方式 ('delivery' 或 'pickup')
  const [serviceType, setServiceType] = useState<string>("");
  // deliveryAddress: 用户选择的送货地址ID
  const [deliveryAddress, setDeliveryAddress] = useState<number | null>(null);
  // pickupTime: 用户选择的自取时间
  const [pickupTime, setPickupTime] = useState("");
  // specialInstructions: 用户输入的特殊要求
  const [specialInstructions, setSpecialInstructions] = useState("");
  // paymentMethod: 用户选择的支付方式
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // --- Promotion and Fees (促销与费用) ---
  // promoCode: 用户输入的优惠码
  const [promoCode, setPromoCode] = useState("");
  // discount: 根据优惠码计算出的折扣率
  const discount = promoCode === "SAVE10" ? 0.1 : 0;
  // deliveryFee: 计算出的外卖费
  const [deliveryFee, setDeliveryFee] = useState(0);
  // deliveryDistance: 计算出的外卖距离 (公里)
  const [deliveryDistance, setDeliveryDistance] = useState(0);

  // --- Data Fetching Effect (数据获取) ---
  // 使用 useEffect Hook 在组件加载时从后端获取初始数据
  useEffect(() => {
    // 定义一个异步函数来获取所有需要的数据
    const fetchInitialData = async () => {
      setIsLoading(true); // 开始加载，显示加载动画
      setError(null); // 清除之前的任何错误信息
      try {
        // 使用 Promise.all 并发请求多个API，提高效率
        const [cartResponse, optionsResponse, addressResponse, contactCmsResponse] = await Promise.all([
            axios.get("/cart"), // 获取购物车数据
            axios.get("/checkout-options"), // 获取服务和支付选项
            axios.get("/address"), // 获取用户地址
            axios.get(`/cms/contact?lang=${language}`) // 获取店铺联系信息（包含位置）
        ]);

        // 设置购物车数据状态
        setCartData(cartResponse.data.cart);

        console.log(cartResponse.data.cart);

        // 从选项数据中分离出服务和支付方式
        const optionsData = optionsResponse.data.data;
        setServiceMethods(optionsData.service_methods);
        setPaymentMethods(optionsData.payment_methods);

        // 设置默认的服务和支付方式
        if (optionsData.service_methods.length > 0) {
            setServiceType(optionsData.service_methods[0].name);
        }
        if (optionsData.payment_methods.length > 0) {
            setPaymentMethod(optionsData.payment_methods[0].name);
        }

        // 如果API返回了店铺位置，则设置状态
        if(contactCmsResponse.data.store_location) {
            setStoreLocation(contactCmsResponse.data.store_location);
        }

        // 设置用户地址列表
        setAddresses(addressResponse.data);
        // 查找并设置默认送货地址
        const defaultAddress = addressResponse.data.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
            setDeliveryAddress(defaultAddress.id);
        } else if (addressResponse.data.length > 0) {
            // 如果没有默认地址，则使用列表中的第一个地址
            setDeliveryAddress(addressResponse.data[0].id);
        }

      } catch (err: any) {
        // 捕获API请求中的任何错误
        const errorMessage = err.response?.data?.message || "加载页面数据失败。";
        setError(errorMessage); // 设置错误信息状态
        toast.error(errorMessage); // 显示错误提示
      } finally {
        // 无论成功或失败，最后都设置加载状态为false
        setIsLoading(false);
      }
    };

    // 这个effect依赖于用户的认证状态
    if (!authIsLoading) { // 确保认证状态加载完毕
      if (isAuthenticated) { // 如果用户已登录
        fetchInitialData(); // 执行数据获取函数
      } else { // 如果用户未登录
        router.push("/auth/login"); // 跳转到登录页面
      }
    }
  }, [authIsLoading, isAuthenticated, router, language]); // 依赖项数组，当这些值变化时，effect会重新运行

  // --- Delivery Fee Calculation Effect (外卖费计算) ---
  // 当服务类型、地址、店铺位置等发生变化时，重新计算外卖费
  useEffect(() => {
    // 仅当服务类型是'delivery'且相关数据都存在时才计算
    if (serviceType === 'delivery' && deliveryAddress && storeLocation && addresses.length > 0) {
      const selectedAddress = addresses.find(addr => addr.id === deliveryAddress);
      
      // 确保选中的地址和店铺都有有效的经纬度
      if (selectedAddress && selectedAddress.latitude && selectedAddress.longitude && storeLocation.latitude && storeLocation.longitude) {
        
        // 调用辅助函数计算距离
        const distance = calculateDistance(
          storeLocation.latitude,
          storeLocation.longitude,
          selectedAddress.latitude,
          selectedAddress.longitude
        );

        // --- 外卖费计算逻辑 ---
        const PER_KM_RATE = 1.00; // 每公里 RM1
        const calculatedFee = distance * PER_KM_RATE;
        
        // 更新外卖费和距离的状态
        setDeliveryFee(calculatedFee);
        setDeliveryDistance(distance);

      } else {
        // 如果地址信息不完整，尝试使用服务方式中定义的静态费用
        const staticFee = Number(serviceMethods.find(s => s.name === 'delivery')?.fee || 5.00);
        setDeliveryFee(staticFee);
      }
    } else {
      // 如果不是外卖服务，则将外卖费和距离重置为0
      setDeliveryFee(0);
      setDeliveryDistance(0);
    }
  }, [serviceType, deliveryAddress, storeLocation, addresses, serviceMethods]); // 依赖项数组

  // --- Memoized Calculations (性能优化) ---
  // 使用 useMemo 来缓存计算结果，只有在依赖项改变时才重新计算，避免不必要的渲染
  
  // 计算购物车中所有商品的总价 (subtotal)
  const subtotal = React.useMemo(() => {
    if (!cartData) return 0;
    // 累加所有菜单项的总价和所有套餐的总价
    const menuTotal = cartData.menu_items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const packageTotal = cartData.package_items.reduce((sum, pkg) => sum + calculatePackageTotal(pkg), 0);
    return menuTotal + packageTotal;
  }, [cartData]); // 仅当cartData变化时重新计算

  // 计算折扣金额
  const discountAmount = React.useMemo(() => subtotal * discount, [subtotal, discount]);
  
  // 计算最终总计金额
  const total = React.useMemo(() => subtotal + deliveryFee - discountAmount, [subtotal, deliveryFee, discountAmount]);

  // 计算购物车中商品的总数量
  const totalItems = React.useMemo(() => {
    if (!cartData) return 0;
    // 累加所有菜单项和套餐的数量
    const menuCount = cartData.menu_items.reduce((sum, item) => sum + item.quantity, 0);
    const packageCount = cartData.package_items.reduce((sum, pkg) => sum + pkg.quantity, 0);
    return menuCount + packageCount;
  }, [cartData]); // 仅当cartData变化时重新计算

  // --- Step Navigation (步骤导航) ---
  const nextStep = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); }; // 进入下一步
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); }; // 返回上一步
  const handleBack = () => { currentStep === 1 ? router.push("/") : prevStep(); }; // 顶部返回按钮的逻辑
  
  // 决定“下一步”按钮是否可以点击的逻辑
  const canProceed = () => {
    if (currentStep === 1) return totalItems > 0; // 第1步：购物车不能为空
    if (currentStep === 2) return serviceType && (serviceType !== "delivery" || deliveryAddress); // 第2步：必须选择服务，如果是外卖必须选地址
    if (currentStep === 3) return paymentMethod; // 第3步：必须选择支付方式
    return true; // 第4步总是可以继续
  };

  const steps = [
    { id: 1, title: t('cartStep') || 'Cart', description: t('confirmOrder') || 'Review Items' },
    { id: 2, title: t('serviceStep') || 'Service', description: t('selectService') || 'Choose Service' },
    { id: 3, title: t('paymentStep') || 'Payment', description: t('selectPayment') || 'Payment Method' },
    { id: 4, title: t('confirmStep') || 'Confirm', description: t('verifyInfo') || 'Final Review' },
  ];

  // --- Order Placement (提交订单) ---
  const handlePlaceOrder = async () => {
    // 防止在没有购物车数据或正在提交时重复点击
    if (!cartData || isPlacingOrder) return;

    setIsPlacingOrder(true); // 设置为“正在提交”状态

    // 准备要发送到后端API的订单数据
    const orderData = {
      service_method_name: serviceType,
      payment_method_name: paymentMethod,
      address_id: serviceType === 'delivery' ? deliveryAddress : null,
      pickup_time: serviceType === 'pickup' && pickupTime ? pickupTime.slice(0, 16) : null, // 格式化时间以匹配后端要求
      special_instructions: specialInstructions,
      promo_code: promoCode,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      subtotal: subtotal,
      total_amount: total,
    };

    try {
      // 发送POST请求到/add-order接口
      const response = await axios.post('/add-order', orderData);
      toast.success(response.data.message); // 显示成功提示
      router.push("/"); // 成功后跳转到首页
    } catch (err: any) {
      // 捕获并处理提交过程中的错误
      const errorMessage = err.response?.data?.message || "提交订单失败。";
      toast.error(errorMessage); // 显示错误提示
    } finally {
      // 无论成功或失败，最后都重置“正在提交”状态
      setIsPlacingOrder(false);
    }
  };

  // --- Conditional Rendering (条件渲染) ---
  // 根据不同状态渲染不同的UI

  // 如果页面或认证状态正在加载，显示一个全局的加载动画
  if (isLoading || authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
      </div>
    );
  }

  // 如果加载过程中出现错误，显示错误信息
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  // --- UI Components (UI组件) ---
  // 将UI的不同部分拆分为更小的、可管理的组件

  // 进度条组件，显示结账流程的步骤
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

  // 根据当前步骤(currentStep)来决定渲染哪个步骤组件
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        // 第一步：显示购物车内容
        return <Step1 cartData={cartData} setCartData={setCartData} />;
      case 2:
        // 第二步：选择服务方式
        return (
          <Step2
            serviceType={serviceType}
            setServiceType={setServiceType}
            serviceMethods={serviceMethods}
            deliveryFee={deliveryFee}
            deliveryDistance={deliveryDistance}
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
        // 第三步：选择支付方式
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
        // 第四步：确认订单
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
        // 默认情况也显示第一步
        return <Step1 cartData={cartData} setCartData={setCartData} />;
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
                            {serviceType === 'delivery' && deliveryDistance > 0 && (
                                <span className="text-xs text-gray-500 ml-1">({deliveryDistance.toFixed(2)} km)</span>
                            )}
                        </span>
                        <span className="font-medium">
                            {serviceType !== 'delivery' ? (
                            <span className="text-gray-500">N/A</span>
                            ) : deliveryFee === 0 && deliveryDistance === 0 ? (
                            <span className="text-gray-500">Calculating...</span>
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
