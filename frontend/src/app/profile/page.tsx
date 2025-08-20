"use client";

import { useState, useEffect, useCallback, FC } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  MapPin,
  Clock,
  Edit,
  Plus,
  ArrowLeft,
  Mail,
  LogOut,
  ChevronDown,
  Phone,
  AlertCircle,
  Package,
  UtensilsCrossed,
  Receipt,
  Truck,
  Wallet,
  CreditCard,
  StickyNote,
  Store,
  HandPlatter,
  Loader2, // 确保导入 Loader2
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import axios from "@/lib/axios";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressFormModal } from "@/components/AddressFormModal";
// AddressSkeleton不再使用，可以移除
// import { AddressSkeleton } from "@/components/AddressSkeleton";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Context and Hooks
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

// Type Definitions (确保您的types文件包含了所有order字段)
import { Address, Order, OrderMenuItem, OrderPackageItem } from "./lib/types";

// =====================================================================================
// 辅助函数 (Helper Functions)
// =====================================================================================

const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "/images/No-Image-Available.jpg";
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${imagePath}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "unpaid":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// =====================================================================================
// 文件内子组件 (Internal Components for better organization)
// =====================================================================================

/** @brief 用于在个人资料页显示一行信息 */
interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}
const InfoRow: FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <label className="text-sm font-medium text-gray-600 mb-1 block">
      {label}
    </label>
    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Icon className="h-4 w-4 text-orange-500" />
      {value || <span className="text-sm text-gray-400">未提供</span>}
    </div>
  </div>
);

/** @brief 渲染订单中单个【菜单项】的详情 */
const OrderItemDetails: FC<{ item: OrderMenuItem }> = ({ item }) => (
  <div className="bg-gray-50/50 rounded-lg p-3 border">
    <div className="flex items-start gap-4">
      <Image
        src={getFullImageUrl(item.image_url)}
        alt={item.menu_name}
        width={64}
        height={64}
        className="flex-shrink-0 rounded-md object-cover bg-white border aspect-square"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold text-gray-800">{item.menu_name}</h4>
            <p className="text-sm text-gray-500">数量: {item.quantity}</p>
          </div>
          <span className="font-bold text-gray-800 text-right">
            RM{Number(item.item_total).toFixed(2)}
          </span>
        </div>
        {(item.variants?.length > 0 || item.addons?.length > 0) && (
          <div className="bg-orange-50/70 p-3 rounded-md text-sm text-gray-700 mt-2 space-y-2">
            {item.variants?.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">规格:</span>
                {item.variants.map((v) => (
                  <div className="pl-2" key={v.id}>
                    - {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})
                  </div>
                ))}
              </div>
            )}
            {item.addons?.length > 0 && (
              <div>
                <span className="font-semibold text-gray-800">附加项:</span>
                {item.addons.map((a) => (
                  <div className="pl-2" key={a.id}>
                    - {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

/** @brief 渲染订单中单个【套餐项】的详情 */
const PackageItemDetails: FC<{ item: OrderPackageItem }> = ({ item }) => (
  <div className="bg-gray-50/50 rounded-lg p-3 border">
    <div className="flex items-start gap-4">
      <Image
        src={getFullImageUrl(item.package_image)}
        alt={item.package_name}
        width={64}
        height={64}
        className="flex-shrink-0 rounded-md object-cover bg-white border aspect-square"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-gray-800">{item.package_name}</h4>
            <p className="text-sm text-gray-500">数量: {item.quantity}</p>
          </div>
          <span className="font-bold text-gray-800 text-right">
            RM{Number(item.item_total).toFixed(2)}
          </span>
        </div>
        <div className="space-y-2">
          {item.menus.map((pkgMenu) => (
            <div
              key={pkgMenu.id}
              className="bg-orange-50/70 p-3 rounded-md text-sm text-gray-700"
            >
              <h5 className="font-semibold text-gray-800 mb-1">
                {pkgMenu.menu_name}
              </h5>
              {(pkgMenu.variants?.length > 0 || pkgMenu.addons?.length > 0) && (
                <>
                  {pkgMenu.variants?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800">规格:</span>
                      {pkgMenu.variants.map((v) => (
                        <div className="pl-2" key={v.id}>
                          - {v.variant_name} (+RM
                          {Number(v.variant_price).toFixed(2)})
                        </div>
                      ))}
                    </div>
                  )}
                  {pkgMenu.addons?.length > 0 && (
                    <div className="mt-1">
                      <span className="font-semibold text-gray-800">
                        附加项:
                      </span>
                      {pkgMenu.addons.map((a) => (
                        <div className="pl-2" key={a.id}>
                          - {a.addon_name} (+RM
                          {Number(a.addon_price).toFixed(2)})
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** @brief 【核心更新】渲染订单摘要信息 */
const OrderSummary: FC<{ order: Order }> = ({ order }) => {
  const { t } = useLanguage();

  const serviceMethodMap: {
    [key: string]: { icon: React.ElementType; text: string };
  } = {
    delivery: { icon: Truck, text: t("delivery") || "外卖配送" },
    pickup: { icon: Store, text: t("pickup") || "到店自取" },
    "dine-in": { icon: HandPlatter, text: t("dine-in") || "店内用餐" },
  };
  const currentService = serviceMethodMap[order.service_method] || {
    icon: HandPlatter,
    text: order.service_method,
  };

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-orange-600" /> 订单摘要
      </h3>
      <div className="bg-gray-50/50 rounded-lg p-4 border space-y-4 text-sm">
        {/* --- 服务与地址 --- */}
        <div className="flex items-start gap-3">
          <currentService.icon className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">{currentService.text}</p>
            {order.service_method === "delivery" && (
              <div className="text-gray-600 mt-1">
                <p>
                  {order.delivery_name} ({order.delivery_phone})
                </p>
                <p>{order.delivery_address}</p>
                {order.delivery_building && (
                  <p>
                    {order.delivery_building}, {order.delivery_floor}
                  </p>
                )}
              </div>
            )}
            {order.service_method === "pickup" && order.pickup_time && (
              <p className="text-gray-600 mt-1">
                取餐时间: {new Date(order.pickup_time).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* --- 支付信息 --- */}
        <div className="flex items-start gap-3">
          <Wallet className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">支付方式</p>
            <p className="text-gray-600">{order.payment_method}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">支付状态</p>
            <Badge
              className={`text-xs ${getPaymentStatusColor(
                order.payment_status
              )}`}
            >
              {t(order.payment_status) || order.payment_status}
            </Badge>
          </div>
        </div>

        {/* --- 特殊备注 --- */}
        {order.special_instructions && (
          <div className="flex items-start gap-3">
            <StickyNote className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">特殊备注</p>
              <p className="text-gray-600 whitespace-pre-wrap">
                {order.special_instructions}
              </p>
            </div>
          </div>
        )}

        {/* --- 费用明细 --- */}
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>小计</span>
              <span>RM{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>配送费</span>
              <span>RM{Number(order.delivery_fee).toFixed(2)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>折扣 {order.promo_code && `(${order.promo_code})`}</span>
                <span>- RM{Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-gray-800">
            <span>总计</span>
            <span>RM{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** @brief 渲染一个完整的、可展开/折叠的订单卡片 */
interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}
const OrderCard: FC<OrderCardProps> = ({ order, isExpanded, onToggle }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-300">
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-medium text-gray-900">
                {t("orderNumber")}: {order.order_number}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {t(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-orange-500">
              RM{Number(order.total_amount).toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {isExpanded ? t("collapseDetails") : t("viewDetails")}
              </span>
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
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-8">
          <OrderSummary order={order} />
          {order.menu_items?.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-orange-600" /> 菜单项
              </h3>
              <div className="space-y-4">
                {order.menu_items.map((item) => (
                  <OrderItemDetails key={`menu-${item.id}`} item={item} />
                ))}
              </div>
            </div>
          )}
          {order.package_items?.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" /> 套餐项
              </h3>
              <div className="space-y-4">
                {order.package_items.map((item) => (
                  <PackageItemDetails key={`pkg-${item.id}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ** 新增的 LoadingOverlay 组件 **
interface LoadingOverlayProps {
  title?: string;
  description?: string;
  isFullScreen?: boolean;
}
const LoadingOverlay: FC<LoadingOverlayProps> = ({
  title,
  description,
  isFullScreen = false,
}) => {
  const { t } = useLanguage();
  const loadingContent = (
    <div className="text-center bg-white px-16 py-8 md:px-20 md:py-10 rounded-3xl shadow-2xl border border-orange-200 w-full max-w-md md:max-w-lg mx-4">
      <div className="relative inline-block">
        <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
        <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full mx-auto animate-pulse"></div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-800">
        {title || t("Loading") || "Loading"}
      </h3>
      <p className="mt-2 text-gray-600">
        {description ||
          t("loadingMenuMessage") ||
          "Please wait while we load the content..."}
      </p>
      <div className="mt-4 flex justify-center space-x-1">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-orange-50/80 backdrop-blur-sm">
        {loadingContent}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-[300px] py-10">
      {loadingContent}
    </div>
  );
};

// =====================================================================================
// 主页面组件 (ProfilePage)
// =====================================================================================
export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const response = await axios.get("/orders");
      setOrders(response.data || []);
    } catch (error) {
      console.error("获取订单失败:", error);
      const e = "无法加载订单记录。";
      setOrdersError(e);
      toast.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    setAddressError(null);
    try {
      const response = await axios.get("/address");
      setAddresses(response.data || []);
    } catch (error) {
      console.error("获取地址失败:", error);
      const e = t("errorFetchingAddresses") || "无法加载地址。";
      setAddressError(e);
      toast.error(e);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [t]);

  useEffect(() => {
    if (activeTab === "addresses") fetchAddresses();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab, fetchAddresses, fetchOrders]);

  const handleSetDefault = (addressId: number) =>
    setConfirmationState({
      isOpen: true,
      title: t("confirmSetDefaultTitle") || "设为默认地址?",
      description:
        t("confirmSetDefaultDesc") || "您确定要将此地址设为默认地址吗？",
      onConfirm: () => executeSetDefault(addressId),
    });
  const executeSetDefault = (addressId: number) => {
    setIsConfirming(true);
    const promise = axios
      .patch(`/address/${addressId}/set-default`, {})
      .then(() => fetchAddresses());
    toast.promise(promise, {
      loading: t("updatingAddress") || "正在更新...",
      success: t("setDefaultSuccess") || "默认地址已更新。",
      error: t("setDefaultFailed") || "操作失败。",
    });
    promise.finally(() => handleCloseConfirmation());
  };

  const handleDeleteAddress = (addressId: number) =>
    setConfirmationState({
      isOpen: true,
      title: t("confirmDeleteTitle") || "删除地址?",
      description:
        t("confirmDeleteDesc") || "您确定要删除此地址吗？此操作无法撤销。",
      onConfirm: () => executeDelete(addressId),
    });
  const executeDelete = (addressId: number) => {
    setIsConfirming(true);
    const promise = axios
      .delete(`/address/delete/${addressId}`)
      .then(() => fetchAddresses());
    toast.promise(promise, {
      loading: t("deletingAddress") || "正在删除...",
      success: t("addressDeletedSuccess") || "地址已删除。",
      error: t("addressDeleteFailed") || "删除失败。",
    });
    promise.finally(() => handleCloseConfirmation());
  };

  const handleCloseConfirmation = () => {
    setIsConfirming(false);
    setConfirmationState({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: () => {},
    });
  };
  const handleAddAddress = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };
  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddressToEdit(null);
  };
  const handleSaveAddress = async (
    addressData: Omit<Address, "id"> & { id?: number }
  ) => {
    const isEditing = !!addressData.id;
    const url = isEditing
      ? `/address/update/${addressData.id}`
      : "/address/add";

    let promise;
    if (isEditing) {
      promise = axios.put(url, addressData);
    } else {
      promise = axios.post(url, addressData);
    }

    promise = promise.then(() => {
      fetchAddresses();
      handleCloseModal();
    });

    toast.promise(promise, {
      loading: isEditing ? t("updatingAddress") : t("addingAddress"),
      success: isEditing
        ? t("addressUpdatedSuccess")
        : t("addressAddedSuccess"),
      error: isEditing ? t("addressUpdateFailed") : t("addressAddFailed"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-black"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {t("profile")}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-orange-200 shadow-lg">
                    <AvatarImage
                      src={getFullImageUrl(user?.user_image)}
                      alt={user?.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user?.name}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user?.email}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Phone className="h-3 w-3" />
                    {user?.phone_number || "未提供"}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border border-orange-100">
                  <nav className="space-y-2">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 ${
                        activeTab === "profile" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4 text-orange-500" />
                      {t("profile")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 ${
                        activeTab === "addresses" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("addresses")}
                    >
                      <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                      {t("addresses")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 ${
                        activeTab === "orders" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("orders")}
                    >
                      <Clock className="mr-2 h-4 w-4 text-orange-500" />
                      {t("orders")}
                    </Button>
                  </nav>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <ClipLoader
                        size={16}
                        color={"#dc2626"}
                        className="mr-2"
                      />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {t("logout")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-lg border-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=active]:text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("profile")}
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=active]:text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {t("addresses")}
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {t("orders")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-orange-500" />
                      {t("profile")}
                    </CardTitle>
                    <Link href="/profile/edit">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg">
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <InfoRow
                          icon={User}
                          label={t("name")}
                          value={user?.name}
                        />
                        <InfoRow
                          icon={Mail}
                          label={t("email")}
                          value={user?.email}
                        />
                        <InfoRow
                          icon={Phone}
                          label={t("phoneNumber")}
                          value={user?.phone_number}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="addresses">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      {t("addresses")}
                    </CardTitle>
                    <Button
                      onClick={handleAddAddress}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addAddress")}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {isLoadingAddresses ? (
                        <LoadingOverlay
                          description={
                            t("loadingAddresses") || "正在加载地址..."
                          }
                        />
                      ) : addressError ? (
                        <div className="flex flex-col items-center p-8 text-red-600 bg-red-50 rounded-xl">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p>{addressError}</p>
                        </div>
                      ) : addresses.length > 0 ? (
                        addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`bg-white rounded-xl p-4 border shadow-sm ${
                              address.is_default
                                ? "border-orange-500"
                                : "border-gray-100"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-y-2">
                              <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">
                                    {address.name}
                                  </span>
                                  <span>{address.phone}</span>
                                  {address.is_default && (
                                    <Badge className="bg-orange-100 text-orange-800">
                                      {t("default")}
                                    </Badge>
                                  )}
                                </div>
                                <div className="mb-1">{address.address}</div>
                                <div className="text-sm text-gray-500">
                                  {address.building && `${address.building} `}
                                  {address.floor && `${address.floor}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-2">
                                {!address.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => handleSetDefault(address.id)}
                                  >
                                    {t("setDefault")}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => handleEditAddress(address)}
                                >
                                  {t("edit")}
                                </Button>
                                {!address.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    onClick={() =>
                                      handleDeleteAddress(address.id)
                                    }
                                  >
                                    {t("delete")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 p-8">
                          <p>{t("noAddressesFound")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      {t("orders")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {isLoadingOrders ? (
                        <LoadingOverlay
                          description={t("loadingOrders") || "正在加载订单..."}
                        />
                      ) : ordersError ? (
                        <div className="flex flex-col items-center p-8 text-red-600 bg-red-50 rounded-xl">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p>{ordersError}</p>
                        </div>
                      ) : orders.length > 0 ? (
                        orders.map((order) => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrderId === order.id}
                            onToggle={() =>
                              setExpandedOrderId(
                                expandedOrderId === order.id ? null : order.id
                              )
                            }
                          />
                        ))
                      ) : (
                        <div className="text-center text-gray-500 p-8">
                          <p>{t("noOrderHistory")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        addressToEdit={addressToEdit}
      />
      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        onClose={handleCloseConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        description={confirmationState.description}
        isConfirming={isConfirming}
      />
    </div>
  );
}
