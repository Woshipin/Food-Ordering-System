"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Clock,
  Edit,
  Plus,
  ArrowLeft,
  Mail,
  LogOut,
  Star,
  ChevronDown,
  Phone,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import { ClipLoader } from "react-spinners";
import { useLogout } from "@/hooks/useLogout";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();
  const [activeTab, setActiveTab] = useState("profile");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const addresses = [
    {
      id: 1,
      name: "张三",
      phone: "138****8888",
      address: "北京市朝阳区三里屯街道工体北路8号",
      building: "A栋",
      floor: "1201",
      isDefault: true,
    },
    {
      id: 2,
      name: "张三",
      phone: "138****8888",
      address: "北京市海淀区中关村大街1号",
      building: "B栋",
      floor: "808",
      isDefault: false,
    },
  ];

  const orderHistory = [
    {
      id: "20241201001",
      date: "2024-12-01 12:30",
      status: "completed",
      items: ["招牌牛肉面", "鲜榨橙汁"],
      total: 40.0,
      rating: 5,
    },
    {
      id: "20241130002",
      date: "2024-11-30 18:45",
      status: "completed",
      items: ["麻辣香锅", "蒸饺套餐"],
      total: 50.0,
      rating: 4,
    },
    {
      id: "20241129003",
      date: "2024-11-29 19:20",
      status: "cancelled",
      items: ["素食拼盘"],
      total: 22.0,
      rating: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivering":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {t("profile")}
              </h1>
            </div>
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-orange-200 shadow-lg">
                    <AvatarImage
                      src={authUser?.user_image || "/placeholder.svg"}
                      alt={authUser?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold">
                      {authUser?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-800">{authUser?.name}</h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" />
                    {authUser?.email}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Phone className="h-3 w-3" />
                    {authUser?.phone_number}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border border-orange-100">
                  <nav className="space-y-2">
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('profile')}>
                      <User className="mr-2 h-4 w-4 text-orange-500" />
                      {t("personalInformation")}
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'addresses' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('addresses')}>
                      <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                      {t("shippingAddress")}
                    </Button>
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('orders')}>
                      <Clock className="mr-2 h-4 w-4 text-orange-500" />
                      {t("orderHistory")}
                    </Button>
                  </nav>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <ClipLoader size={16} color={"#dc2626"} className="mr-2" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {t("logout")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-lg border-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  {t("personalInformation")}
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  {t("shippingAddress")}
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  {t("orderHistory")}
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-500" />
                        {t("personalInformation")}
                      </CardTitle>
                      <Link href="/profile/edit" className="cursor-pointer">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg">
                          <Edit className="mr-2 h-4 w-4" />
                          {t("edit")}
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">
                            {t("name")}
                          </label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-4 w-4 text-orange-500" />
                            {authUser?.name}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">
                            {t("email")}
                          </label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-orange-500" />
                            {authUser?.email}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">
                            {t("phoneNumber")}
                          </label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-orange-500" />
                            {authUser?.phone_number}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        {t("shippingAddress")}
                      </CardTitle>
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addAddress")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {address.name}
                                </span>
                                <span className="text-gray-600">
                                  {address.phone}
                                </span>
                                {address.isDefault && (
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                                    {t("default")}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-gray-700 mb-1">
                                {address.address}
                              </div>
                              <div className="text-sm text-gray-500">
                                {address.building} {address.floor}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer">
                                {t("edit")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-xl cursor-pointer"
                              >
                                {t("delete")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      {t("orderHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {orderHistory.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-300">
                            <div
                              className="flex items-start justify-between cursor-pointer"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            >
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {t("orderNumber")}: {order.id}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {order.date}
                                    </div>
                                  </div>
                                  <Badge className={getStatusColor(order.status)}>
                                    {t(order.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-semibold text-orange-500">
                                    ¥{order.total.toFixed(2)}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{isExpanded ? t("collapseDetails") : t("viewDetails")}</span>
                                    <ChevronDown
                                      className={`h-5 w-5 transition-transform duration-300 ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-gray-700 mb-2">
                                    {t("orderContent")}:
                                  </div>
                                  <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="text-gray-800 bg-gray-50 p-2 rounded-md">
                                        - {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 mt-4">
                                  {order.rating && (
                                    <div className="flex items-center text-yellow-500">
                                      <Star className="h-4 w-4 fill-current" />
                                      <span className="ml-1 text-sm">
                                        {order.rating}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Link href={`/orders/${order.id}`} className="cursor-pointer">
                                      <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200">
                                        {t("viewDetails")}
                                      </Button>
                                    </Link>
                                    {order.status === "completed" && !order.rating && (
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl cursor-pointer"
                                      >
                                        {t("evaluate")}
                                      </Button>
                                    )}
                                    {order.status === "completed" && (
                                      <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer">
                                        {t("buyAgain")}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}