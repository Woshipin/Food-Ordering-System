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
  Table,
  TimeSlot, // --- 导入新的 TimeSlot 类型 ---
} from "./lib/lib";
import {
  calculateDistance,
  calculateItemTotal,
  calculatePackageTotal,
} from "./function/cartfunction";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import { LoadingOverlay } from "../../components/LoadingOverlay";

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
  const [storeLocation, setStoreLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [serviceType, setServiceType] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<number | null>(null);
  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // --- Dine In 状态 ---
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [pax, setPax] = useState<number>(1);
  const [reservationDate, setReservationDate] = useState<string>("");
  // --- 新增：Time Slots 状态 ---
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null
  );
  // --- Dine In 状态结束 ---

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
        console.log("开始获取购物车页面数据...");

        // --- 分别处理每个API调用，添加详细的错误日志 ---
        const apiCalls = [
          { name: "cart", call: () => axios.get("/cart") },
          {
            name: "checkout-options",
            call: () => axios.get("/checkout-options"),
          },
          { name: "address", call: () => axios.get("/address") },
          {
            name: "contact-cms",
            call: () => axios.get(`/cms/contact?lang=${language}`),
          },
          { name: "tables", call: () => axios.get("/tables") },
        ];

        const results = await Promise.allSettled(
          apiCalls.map((api) => api.call())
        );

        // 处理每个API调用的结果，记录详细的成功/失败信息
        results.forEach((result, index) => {
          const apiName = apiCalls[index].name;
          if (result.status === "fulfilled") {
            console.log(`✅ ${apiName} API 调用成功`);
          } else {
            console.error(`❌ ${apiName} API 调用失败:`, result.reason);
            if (result.reason?.response) {
              console.error(
                `${apiName} 错误状态:`,
                result.reason.response.status
              );
              console.error(
                `${apiName} 错误数据:`,
                result.reason.response.data
              );
            }
          }
        });

        const [
          cartResponse,
          optionsResponse,
          addressResponse,
          contactCmsResponse,
          tablesResponse,
        ] = results;

        // 处理购物车数据
        if (
          cartResponse.status === "fulfilled" &&
          cartResponse.value.data &&
          cartResponse.value.data.cart
        ) {
          setCartData(cartResponse.value.data.cart);
          console.log("购物车数据加载成功");
        } else {
          console.warn("购物车数据加载失败或为空");
        }

        // 处理结账选项数据
        if (optionsResponse.status === "fulfilled") {
          const optionsData = optionsResponse.value.data.data;
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
          console.log("结账选项数据加载成功");
        } else {
          console.error(
            "结账选项数据加载失败:",
            optionsResponse.status === "rejected"
              ? optionsResponse.reason
              : "Unknown error"
          );
        }

        // 处理CMS数据
        if (contactCmsResponse.status === "fulfilled") {
          const cmsData = contactCmsResponse.value.data;
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
          console.log("CMS数据加载成功");
        } else {
          console.error(
            "CMS数据加载失败:",
            contactCmsResponse.status === "rejected"
              ? contactCmsResponse.reason
              : "Unknown error"
          );
        }

        // 处理地址数据
        if (addressResponse.status === "fulfilled") {
          const userAddresses = addressResponse.value.data;
          if (Array.isArray(userAddresses)) {
            setAddresses(userAddresses);
            const defaultAddress = userAddresses.find(
              (addr: Address) => addr.is_default
            );
            if (defaultAddress) {
              setDeliveryAddress(defaultAddress.id);
            } else if (userAddresses.length > 0) {
              setDeliveryAddress(userAddresses[0].id);
            }
          }
          console.log("地址数据加载成功");
        } else {
          console.error(
            "地址数据加载失败:",
            addressResponse.status === "rejected"
              ? addressResponse.reason
              : "Unknown error"
          );
        }

        // 处理桌位数据
        if (tablesResponse.status === "fulfilled") {
          if (tablesResponse.value.data) {
            const tablesData = tablesResponse.value.data;
            setTables(tablesData);
            console.log("桌位数据加载成功，数量:", tablesData.length);
          }
        } else {
          console.error(
            "桌位数据加载失败:",
            tablesResponse.status === "rejected"
              ? tablesResponse.reason
              : "Unknown error"
          );
          // 如果桌位获取失败，设置为空数组以避免崩溃
          setTables([]);
        }

        console.log("购物车页面数据加载完成");
      } catch (err: any) {
        console.error("购物车页面数据加载出现未捕获的错误:", err);
        const errorMessage =
          err.response?.data?.message || "加载页面数据失败。";
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
        console.log("用户未认证，跳转到登录页面");
        router.push("/auth/login");
      }
    }
  }, [authIsLoading, isAuthenticated, router, language]);

  useEffect(() => {
    if (serviceType !== "delivery") {
      setDeliveryFee(0);
      setDeliveryDistance(0);
      setIsCalculatingFee(false);
      return;
    }

    if (deliveryAddress && storeLocation && addresses.length > 0) {
      setIsCalculatingFee(true);

      const selectedAddress = addresses.find(
        (addr) => addr.id === deliveryAddress
      );

      if (
        selectedAddress &&
        selectedAddress.latitude &&
        selectedAddress.longitude &&
        storeLocation.latitude &&
        storeLocation.longitude
      ) {
        const distance = calculateDistance(
          storeLocation.latitude,
          storeLocation.longitude,
          parseFloat(selectedAddress.latitude),
          parseFloat(selectedAddress.longitude)
        );

        const PER_KM_RATE = 1.0;
        const calculatedFee = distance * PER_KM_RATE;

        setDeliveryFee(calculatedFee);
        setDeliveryDistance(distance);
      } else {
        const staticFee = Number(
          serviceMethods.find((s) => s.name === "delivery")?.fee || 5.0
        );
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
    const menuTotal = cartData.menu_items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
    const packageTotal = cartData.package_items.reduce(
      (sum, pkg) => sum + calculatePackageTotal(pkg),
      0
    );
    return menuTotal + packageTotal;
  }, [cartData]);

  const discountAmount = React.useMemo(
    () => subtotal * discount,
    [subtotal, discount]
  );
  const total = React.useMemo(
    () => subtotal + deliveryFee - discountAmount,
    [subtotal, deliveryFee, discountAmount]
  );

  const totalItems = React.useMemo(() => {
    if (!cartData) return 0;
    const menuCount = cartData.menu_items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const packageCount = cartData.package_items.reduce(
      (sum, pkg) => sum + pkg.quantity,
      0
    );
    return menuCount + packageCount;
  }, [cartData]);

  // --- 新增：获取所有时间段的函数 ---
  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get("/timeslots");

      if (response.data && response.data.success) {
        setTimeSlots(response.data.data || []);
      } else {
        console.warn("Failed to fetch timeslots:", response.data?.message);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      setTimeSlots([]);
    }
  };

  // --- 新增：检查特定日期的时间段可用性 ---
  const checkTimeSlotsAvailability = async (date: string) => {
    try {
      const response = await axios.post("/timeslots/check-availability", {
        date: date,
      });

      if (response.data && response.data.success) {
        const timeSlotsWithAvailability = response.data.data || [];
        setTimeSlots(timeSlotsWithAvailability);

        // 如果当前选择的时间段不可用，清除选择
        if (selectedTimeSlotId) {
          const selectedSlot = timeSlotsWithAvailability.find(
            (slot: any) => slot.id === selectedTimeSlotId
          );
          if (selectedSlot && !selectedSlot.is_available) {
            setSelectedTimeSlotId(null);
            toast.warning("您之前选择的时间段已不可用，请重新选择。");
          }
        }
      } else {
        console.warn(
          "Failed to check timeslots availability:",
          response.data?.message
        );
        // 如果可用性检查失败，尝试获取所有时间段
        await fetchTimeSlots();
      }
    } catch (error) {
      console.error("Error checking timeslots availability:", error);
      // 错误情况下显示所有时间段，但不显示可用性状态
      await fetchTimeSlots();
      // 不显示错误提示，因为这可能是旰功能，后端还没有完全就绪
    }
  };

  // --- 新增：检查特定日期和时间段的桌位可用性 ---
  const checkTablesAvailability = async (
    date: string,
    timeSlotId: number,
    guestsCount: number = pax
  ) => {
    console.log("Checking tables availability:", {
      date,
      timeSlotId,
      guestsCount,
    }); // 调试日志

    try {
      const response = await axios.post("/tables/check-availability", {
        date: date,
        time_slot_id: timeSlotId,
        guests_count: guestsCount,
      });

      console.log("Tables availability response:", response.data); // 调试日志

      if (response.data && response.data.success) {
        const tablesWithAvailability = response.data.data || [];
        console.log(
          "Setting tables with availability:",
          tablesWithAvailability
        ); // 调试日志
        setTables(tablesWithAvailability);

        // 如果当前选择的桌位不可用，清除选择
        if (selectedTable) {
          const selectedTableData = tablesWithAvailability.find(
            (table: any) => table.id === selectedTable
          );
          if (selectedTableData && !selectedTableData.is_available) {
            setSelectedTable(null);
            toast.warning("您之前选择的桌位在该时间段已不可用，请重新选择。");
          }
        }

        return tablesWithAvailability;
      } else {
        console.warn(
          "Failed to check tables availability:",
          response.data?.message
        );
        console.log("Keeping existing tables:", tables); // 调试日志
        // 如果可用性检查失败，保持现有桌位数据，不清空
        return tables; // 返回现有桌位数据
      }
    } catch (error) {
      console.error("Error checking tables availability:", error);
      console.log("Keeping existing tables due to error:", tables); // 调试日志
      // 错误情况下保持现有桌位数据，不清空
      // 这样用户仍然可以看到所有桌位，只是没有实时可用性信息
      return tables; // 返回现有桌位数据
    }
  };

  // --- 新增：监听日期变化，检查时间段可用性 ---
  useEffect(() => {
    if (reservationDate) {
      checkTimeSlotsAvailability(reservationDate); // 用户选择日期后，检查时间段可用性
    } else {
      setTimeSlots([]);
      setSelectedTimeSlotId(null);
    }
  }, [reservationDate]); // 只监听日期变化

  // --- 新增：监听时间段和客人数变化，检查桌位可用性 ---
  useEffect(() => {
    if (reservationDate && selectedTimeSlotId) {
      // 只有当日期和时间段都选择了才调用可用性检查
      checkTablesAvailability(reservationDate, selectedTimeSlotId, pax);
    }
    // 注意：当没有选择时间段时，不清空桌位列表，让用户能看到所有桌位
  }, [reservationDate, selectedTimeSlotId, pax]); // 监听日期、时间段和客人数变化

  const canProceed = () => {
    if (currentStep === 1) return totalItems > 0;
    if (currentStep === 2) {
      if (serviceType === "delivery") {
        return deliveryAddress && !isCalculatingFee;
      }
      const dineInMethod = serviceMethods.find((method) =>
        method.display_name.toLowerCase().includes("dine in")
      );
      if (dineInMethod && serviceType === dineInMethod.name) {
        // --- 修改：堂食必须选择桌位和时间段 ---
        return !!selectedTable && !!selectedTimeSlotId;
      }
      return !!serviceType;
    }
    if (currentStep === 3) return !!paymentMethod;
    return true;
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleBack = () => {
    currentStep === 1 ? router.push("/") : prevStep();
  };

  const steps = [
    {
      id: 1,
      title: t("cartStep") || "Cart",
      description: t("confirmOrder") || "Review Items",
    },
    {
      id: 2,
      title: t("serviceStep") || "Service",
      description: t("selectService") || "Choose Service",
    },
    {
      id: 3,
      title: t("paymentStep") || "Payment",
      description: t("selectPayment") || "Payment Method",
    },
    {
      id: 4,
      title: t("confirmStep") || "Confirm",
      description: t("verifyInfo") || "Final Review",
    },
  ];

  const handlePlaceOrder = async () => {
    if (!cartData || isPlacingOrder) return;
    setIsPlacingOrder(true);
    const dineInMethod = serviceMethods.find((method) =>
      method.display_name.toLowerCase().includes("dine in")
    );

    const orderData = {
      service_method_name: serviceType,
      payment_method_name: paymentMethod,
      address_id: serviceType === "delivery" ? deliveryAddress : null,
      table_id:
        dineInMethod && serviceType === dineInMethod.name
          ? selectedTable
          : null,
      // --- 修改：提交 reservation_details 时使用 time_slot_id ---
      reservation_details:
        dineInMethod && serviceType === dineInMethod.name
          ? {
              pax,
              date: reservationDate,
              time_slot_id: selectedTimeSlotId, // <-- 发送所选时间段的ID
            }
          : null,
      pickup_time:
        serviceType === "pickup" && pickupTime ? pickupTime.slice(0, 16) : null,
      special_instructions: specialInstructions,
      promo_code: promoCode,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      subtotal: subtotal,
      total_amount: total,
    };
    try {
      const response = await axios.post("/orders/add", orderData);
      toast.success(response.data.message);
      router.push("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "提交订单失败。";
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading || authIsLoading) {
    return (
      <LoadingOverlay
        isFullScreen={true}
        title={t("Loading Cart")}
        description={t("Please wait while we fetch your cart details")}
      />
    );
  }

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
            tables={tables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            pax={pax}
            setPax={setPax}
            reservationDate={reservationDate}
            setReservationDate={setReservationDate}
            // --- 传递新的 props ---
            timeSlots={timeSlots}
            selectedTimeSlotId={selectedTimeSlotId}
            setSelectedTimeSlotId={setSelectedTimeSlotId}
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
            selectedTable={selectedTable}
            tables={tables}
            pax={pax}
            reservationDate={reservationDate}
            // --- 传递时间段信息到 Step4 以便最终确认 ---
            selectedTimeSlotId={selectedTimeSlotId}
            timeSlots={timeSlots}
          />
        );
      default:
        return <Step1 cartData={cartData} setCartData={setCartData} />;
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Choose Service";
      case 2:
        return "Select Payment";
      case 3:
        return "Review Order";
      case 4:
        return "Place Order";
      default:
        return "Continue";
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
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-40 h-0.5 bg-gray-200 mt-5 relative">
                    <div
                      className={`h-full bg-green-500 absolute transition-all duration-300`}
                      style={{ width: currentStep > step.id ? "100%" : "0%" }}
                    ></div>
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
            <h2 className="text-2xl font-bold text-gray-600 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              browsing our delicious menu!
            </p>
            <Link href="/menu">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-lg">
                Browse Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">{getStepContent()}</div>

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
                    {cartData?.menu_items.map((item) => (
                      <div
                        key={`summary-menu-${item.id}`}
                        className="flex justify-between text-gray-600"
                      >
                        <span>
                          {item.menu_name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          RM{calculateItemTotal(item).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {cartData?.package_items.map((pkg) => (
                      <div
                        key={`summary-pkg-${pkg.id}`}
                        className="flex justify-between text-gray-600"
                      >
                        <span>
                          {pkg.package_name} x {pkg.quantity}
                        </span>
                        <span className="font-medium">
                          RM{calculatePackageTotal(pkg).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600 font-medium">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">
                        RM{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Delivery Fee
                        {serviceType === "delivery" &&
                          deliveryDistance > 0 &&
                          !isCalculatingFee && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({deliveryDistance.toFixed(2)} km)
                            </span>
                          )}
                      </span>
                      <span className="font-medium">
                        {serviceType !== "delivery" ? (
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
                        <span className="font-medium">
                          -RM{discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-500">
                        RM{total.toFixed(2)}
                      </span>
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
