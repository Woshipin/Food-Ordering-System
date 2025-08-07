"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Clock, CreditCard, Smartphone, Wallet, CheckCircle, ArrowLeft } from "lucide-react"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Textarea } from "../../components/ui/textarea"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  building: string;
  floor: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("wechat")
  const [deliveryTime, setDeliveryTime] = useState("asap")

  const orderItems = [
    { name: "招牌牛肉面", quantity: 2, price: 56.0 },
    { name: "麻辣香锅", quantity: 1, price: 32.0 },
    { name: "鲜榨橙汁", quantity: 2, price: 24.0 },
  ]

  const subtotal = 112.0
  const total = deliveryFee !== null ? subtotal + deliveryFee : subtotal;

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        try {
          const response = await axios.get('/address');
          setAddresses(response.data);
          const defaultAddress = response.data.find((addr: Address) => addr.is_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          }
        } catch (error) {
          console.error("Failed to fetch addresses", error);
        }
      }
    };
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (selectedAddress) {
      setDeliveryInfo({
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        building: selectedAddress.building || "",
        floor: selectedAddress.floor || "",
        notes: "",
      });
      calculateDeliveryFee(selectedAddress.id);
    }
  }, [selectedAddress]);

  const calculateDeliveryFee = async (addressId: number) => {
    try {
      const response = await axios.post('/delivery-fee', { address_id: addressId });
      setDeliveryFee(response.data.delivery_fee);
    } catch (error) {
      console.error("Failed to calculate delivery fee", error);
      setDeliveryFee(null);
    }
  };

  const handleAddressChange = (addressId: string) => {
    const address = addresses.find(addr => addr.id === parseInt(addressId, 10));
    if (address) {
      setSelectedAddress(address);
    }
  };

  const timeSlots = [
    { value: "asap", label: "尽快送达 (30-45分钟)" },
    { value: "12:00", label: "12:00-12:30" },
    { value: "12:30", label: "12:30-13:00" },
    { value: "13:00", label: "13:00-13:30" },
    { value: "13:30", label: "13:30-14:00" },
    { value: "14:00", label: "14:00-14:30" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t("confirmOrder")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {t("deliveryAddress")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleAddressChange} value={selectedAddress?.id.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectAddress")} />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id.toString()}>
                        {address.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAddress && (
                  <div className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t("recipientName")} *</Label>
                        <Input id="name" value={deliveryInfo.name} readOnly />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("phoneNumber")} *</Label>
                        <Input id="phone" value={deliveryInfo.phone} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">{t("detailedAddress")} *</Label>
                      <Input id="address" value={deliveryInfo.address} readOnly />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="building">{t("buildingNumber")}</Label>
                        <Input id="building" value={deliveryInfo.building} readOnly />
                      </div>
                      <div>
                        <Label htmlFor="floor">{t("roomNumber")}</Label>
                        <Input id="floor" value={deliveryInfo.floor} readOnly />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">{t("notes")}</Label>
                      <Textarea
                        id="notes"
                        value={deliveryInfo.notes}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                        placeholder={t("notesPlaceholder")}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {t("deliveryTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDeliveryTime")} />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  {t("paymentMethod")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="wechat" id="wechat" />
                    <Label htmlFor="wechat" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-green-500 rounded mr-3 flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{t("wechatPay")}</div>
                        <div className="text-sm text-gray-500">{t("wechatPayDescription")}</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="alipay" id="alipay" />
                    <Label htmlFor="alipay" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-blue-500 rounded mr-3 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{t("alipay")}</div>
                        <div className="text-sm text-gray-500">{t("alipayDescription")}</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-gray-500 rounded mr-3 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{t("cashOnDelivery")}</div>
                        <div className="text-sm text-gray-500">{t("cashOnDeliveryDescription")}</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("orderDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">x{item.quantity}</div>
                    </div>
                    <div className="font-medium">¥{item.price.toFixed(2)}</div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span>¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("deliveryFee")}</span>
                    <span>
                      {deliveryFee !== null ? `¥${deliveryFee.toFixed(2)}` : t("calculating")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}</span>
                    <span className="text-orange-500">¥{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>{t("freeDeliveryCondition")}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{t("estimatedDeliveryTime")}</span>
                  </div>
                  <div className="text-gray-500">{t("orderConfirmationMessage")}</div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 rounded-xl">
              {t("confirmOrder")} ¥{total.toFixed(2)}
            </Button>

            {/* Terms */}
            <div className="text-xs text-gray-500 text-center">
              {t("termsAgreement")}
              <a href="#" className="text-orange-500 hover:underline">
                {t("termsOfService")}
              </a>
              {t("and")}
              <a href="#" className="text-orange-500 hover:underline">
                {t("privacyPolicy")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
