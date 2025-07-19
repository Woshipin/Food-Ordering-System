"use client";

import React, { useState } from "react";
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

export default function CartPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Cart Items State
  const [foodItems, setFoodItems] = useState([
    {
      id: 1,
      name: "招牌牛肉面",
      price: 28.0,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
      description: "精选优质牛肉，手工拉面",
      type: "food",
    },
    {
      id: 2,
      name: "麻辣香锅",
      price: 32.0,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      description: "新鲜蔬菜配香辣调料",
      type: "food",
    },
    {
      id: 3,
      name: "鲜榨橙汁",
      price: 12.0,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
      description: "新鲜橙子现榨",
      type: "food",
    },
  ]);

  const [packageItems, setPackageItems] = useState([
    {
      id: 4,
      name: "家庭套餐A",
      price: 88.0,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      description: "适合3-4人享用，包含主食、小菜、汤品和饮料",
      type: "package",
      packageContents: [
        "招牌牛肉面 x2",
        "蒸饺套餐 x1",
        "酸辣汤 x1",
        "鲜榨橙汁 x2",
      ],
      serves: "3-4人",
    },
  ]);

  // Step 2: Service Type & Details
  const [serviceType, setServiceType] = useState("delivery");
  const [selectedAddress, setSelectedAddress] = useState("1");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");

  // Address options
  const addresses = [
    { id: "1", label: "家", address: "新加坡裕廊西街63号 #12-345", isDefault: true },
    { id: "2", label: "办公室", address: "新加坡乌节路238号 ION大厦 #15-20", isDefault: false },
    { id: "3", label: "朋友家", address: "新加坡淡滨尼街82号 #08-123", isDefault: false },
  ];

  // Table options
  const tables = [
    { id: 1, number: "A1", capacity: 2, available: true },
    { id: 2, number: "A2", capacity: 4, available: true },
    { id: 3, number: "A3", capacity: 6, available: false },
    { id: 4, number: "B1", capacity: 2, available: true },
    { id: 5, number: "B2", capacity: 4, available: true },
    { id: 6, number: "B3", capacity: 6, available: true },
  ];

  // Progress Steps
  const steps = [
    { id: 1, title: t('cartStep'), description: t('confirmOrder') },
    { id: 2, title: t('serviceStep'), description: t('selectService') },
    { id: 3, title: t('paymentStep'), description: t('selectPayment') },
    { id: 4, title: t('confirmStep'), description: t('verifyInfo') },
  ];

  // Cart Functions
  const updateFoodQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFoodItem(id);
    } else {
      setFoodItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const updatePackageQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removePackageItem(id);
    } else {
      setPackageItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFoodItem = (id: number) => {
    setFoodItems((items) => items.filter((item) => item.id !== id));
  };

  const removePackageItem = (id: number) => {
    setPackageItems((items) => items.filter((item) => item.id !== id));
  };

  // Calculations
  const foodSubtotal = foodItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const packageSubtotal = packageItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotal = foodSubtotal + packageSubtotal;
  const deliveryFee = serviceType === "delivery" ? (subtotal >= 50 ? 0 : 8) : 0;
  const discount = promoCode === "SAVE10" ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;
  const totalItems = foodItems.length + packageItems.length;

  // Step Navigation
  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/");
    } else {
      prevStep();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return totalItems > 0;
      case 2:
        if (serviceType === "delivery") return selectedAddress !== "";
        if (serviceType === "dine-in") return tableNumber !== "";
        return true;
      case 3:
        return paymentMethod !== "";
      default:
        return true;
    }
  };

  // Progress Bar Component
  const ProgressBar = () => (
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
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-orange-600" : "text-gray-500"
                  }`}>
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

  // Step 1: Cart Items
  const CartItems = () => (
    <div className="space-y-6">
      {foodItems.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center">
              🍜 {t('individualDishes')} ({foodItems.length})
              <span className="ml-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                ¥{foodSubtotal.toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {foodItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-500">
                      ¥{item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                        onClick={() => updateFoodQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold min-w-[30px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                        onClick={() => updateFoodQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                  onClick={() => removeFoodItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {packageItems.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 p-4">
            <CardTitle className="text-white font-bold text-lg flex items-center">
              🍱 {t('packageCombos')} ({packageItems.length})
              <span className="ml-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                ¥{packageSubtotal.toFixed(2)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {packageItems.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-2xl shadow-md border border-orange-100">
                <div className="flex items-start gap-4">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <button
                        className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => removePackageItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">{item.serves}</span>
                    </div>
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl border">
                      <p className="text-xs font-medium text-gray-700 mb-2">{t('packageIncludes')}:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {item.packageContents.map((content, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mr-2"></div>
                            {content}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-500">
                        ¥{item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                          onClick={() => updatePackageQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                          onClick={() => updatePackageQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Step 2: Service Type Selection
  const ServiceTypeSelection = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center">
            <UtensilsCrossed className="mr-2 h-5 w-5" />
            {t('selectService')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RadioGroup value={serviceType} onValueChange={setServiceType} className="space-y-4">
            <Label htmlFor="delivery" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${serviceType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="delivery" id="delivery" />
              <Car className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t('delivery')}</div>
                    <div className="text-sm text-gray-600">{t('deliveryToAddress')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-500">
                      {subtotal >= 50 ? t('free') : "¥8.00"}
                    </div>
                    {subtotal < 50 && (
                      <div className="text-xs text-gray-500">{t('freeDelivery50')}</div>
                    )}
                  </div>
                </div>
              </div>
            </Label>
            <Label htmlFor="pickup" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${serviceType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="pickup" id="pickup" />
              <Package className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t('pickup')}</div>
                    <div className="text-sm text-gray-600">{t('pickupInStore')}</div>
                  </div>
                  <div className="font-semibold text-green-600">{t('free')}</div>
                </div>
              </div>
            </Label>
            <Label htmlFor="dine-in" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${serviceType === 'dine-in' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="dine-in" id="dine-in" />
              <Home className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{t('dineIn')}</div>
                    <div className="text-sm text-gray-600">{t('dineInRestaurant')}</div>
                  </div>
                  <div className="font-semibold text-green-600">{t('free')}</div>
                </div>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {serviceType === "delivery" && (
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {t('selectDeliveryAddress')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddress === address.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAddress === address.id ? "border-orange-500" : "border-gray-300"
                      }`}>
                        {selectedAddress === address.id && (
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{address.label}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">{t('default')}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{address.address}</div>
                      </div>
                    </div>
                    <Edit3 className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700">
                {t('deliveryNotes')} ({t('optional')})
              </Label>
              <Textarea
                id="delivery-notes"
                placeholder={t('notesPlaceholder')}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {serviceType === "dine-in" && (
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              {t('selectTable')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    !table.available
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed text-gray-400"
                      : tableNumber === table.number
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                  onClick={() => table.available && setTableNumber(table.number)}
                >
                  <div className="text-lg font-bold">{table.number}</div>
                  <div className="text-sm">{table.capacity}{t('personsTable')}</div>
                  <div className={`text-xs mt-1 font-semibold ${
                    table.available ? "text-green-600" : "text-red-500"
                  }`}>
                    {table.available ? t('available') : t('occupied')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Step 3: Payment Method Selection
  const PaymentMethodSelection = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            {t('selectPayment')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            <Label htmlFor="card" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{t('creditCard')}</div>
                <div className="text-sm text-gray-600">{t('creditCardDesc')}</div>
              </div>
            </Label>
            <Label htmlFor="mobile" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${paymentMethod === 'mobile' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="mobile" id="mobile" />
              <Smartphone className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{t('mobilePayment')}</div>
                <div className="text-sm text-gray-600">{t('mobilePaymentDesc')}</div>
              </div>
            </Label>
            <Label htmlFor="cash" className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-colors cursor-pointer ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'hover:bg-orange-50'}`}>
              <RadioGroupItem value="cash" id="cash" />
              <Wallet className="h-6 w-6 text-orange-500" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{t('cashPayment')}</div>
                <div className="text-sm text-gray-600">
                  {serviceType === "delivery" ? t('cashOnDelivery') : t('payInStore')}
                </div>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
          <CardTitle className="text-base font-semibold">{t('promoCode')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              placeholder={t('enterPromoCode')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button variant="outline" className="px-6 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
              {t('apply')}
            </Button>
          </div>
          {promoCode === "SAVE10" && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('promoCodeApplied')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Order Confirmation
  const OrderConfirmation = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            {t('orderDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {foodItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow">
              <div className="flex items-center space-x-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">x{item.quantity}</div>
                </div>
              </div>
              <div className="font-semibold text-gray-800">
                ¥{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          {packageItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow">
              <div className="flex items-center space-x-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">x{item.quantity}</div>
                </div>
              </div>
              <div className="font-semibold text-gray-800">
                ¥{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {t('serviceDetails')} & {t('paymentDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 divide-y">
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('serviceMethod')}</span>
              <div className="flex items-center space-x-2">
                {serviceType === "delivery" && <Car className="h-4 w-4 text-orange-500" />}
                {serviceType === "pickup" && <Package className="h-4 w-4 text-orange-500" />}
                {serviceType === "dine-in" && <Home className="h-4 w-4 text-orange-500" />}
                <span className="font-medium">
                  {serviceType === "delivery" ? t('delivery') :
                   serviceType === "pickup" ? t('pickup') : t('dineIn')}
                </span>
              </div>
            </div>
            {serviceType === "delivery" && selectedAddress && (
              <div className="flex items-start justify-between">
                <span className="text-gray-600">{t('deliveryAddress')}</span>
                <div className="text-right max-w-xs">
                  <div className="font-medium">
                    {addresses.find(a => a.id === selectedAddress)?.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {addresses.find(a => a.id === selectedAddress)?.address}
                  </div>
                </div>
              </div>
            )}
            {serviceType === "dine-in" && tableNumber && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('tableNumber')}</span>
                <span className="font-medium">{tableNumber}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('estimatedTime')}</span>
              <span className="font-medium">
                {serviceType === "delivery" ? `30-45 ${t('minutes')}` :
                 serviceType === "pickup" ? `15-20 ${t('minutes')}` : t('immediately')}
              </span>
            </div>
            {deliveryNotes && (
              <div className="flex items-start justify-between">
                <span className="text-gray-600">{t('deliveryNotes')}</span>
                <div className="text-right max-w-xs">
                  <span className="text-sm text-gray-600">{deliveryNotes}</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('paymentMethod')}</span>
              <div className="flex items-center space-x-2">
                {paymentMethod === "card" && <CreditCard className="h-4 w-4 text-orange-500" />}
                {paymentMethod === "mobile" && <Smartphone className="h-4 w-4 text-orange-500" />}
                {paymentMethod === "cash" && <Wallet className="h-4 w-4 text-orange-500" />}
                <span className="font-medium">
                  {paymentMethod === "card" ? t('creditCard') :
                   paymentMethod === "mobile" ? t('mobilePayment') : t('cashPayment')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Render
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
        {totalItems === 0 && currentStep === 1 ? (
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
              {currentStep === 2 && <ServiceTypeSelection />}
              {currentStep === 3 && <PaymentMethodSelection />}
              {currentStep === 4 && <OrderConfirmation />}
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
                      <span>¥{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('deliveryFee')}</span>
                      <span>
                        {deliveryFee === 0 ? t('free') : `¥${deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('discount')}</span>
                        <span>-¥{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                            <Clock className="mr-2 h-5 w-5 text-orange-500" />
                            <span>{t('estimatedTime')}</span>
                        </div>
                        <span className="font-semibold">
                            {serviceType === "delivery" ? `30-45 ${t('minutes')}` :
                             serviceType === "pickup" ? `15-20 ${t('minutes')}` : t('immediately')}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('total')}</span>
                      <span className="text-orange-500">¥{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {currentStep < 4 ? (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 rounded-xl shadow-lg"
                    onClick={nextStep}
                    disabled={!canProceed()}
                  >
                    {currentStep === 1 ? t('selectServiceBtn') :
                     currentStep === 2 ? t('selectPaymentBtn') : t('confirmOrderBtn')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-lg py-6 rounded-xl shadow-lg"
                    onClick={() => alert("订单提交成功！")}
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {t('submitOrder')} ¥{total.toFixed(2)}
                  </Button>
                )}

                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="w-full py-3"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('previousStep')}
                  </Button>
                )}
              </div>

              {subtotal > 0 && subtotal < 20 && (
                <Card className="border-yellow-300 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Badge variant="outline" className="mb-2 border-yellow-400 text-yellow-700">
                        {t('tip')}
                      </Badge>
                      <div className="text-sm text-yellow-800">
                        {t('minOrderWarning')}¥{(20 - subtotal).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}