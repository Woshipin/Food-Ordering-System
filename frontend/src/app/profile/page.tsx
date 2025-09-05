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
  Loader2,
  Filter,
  Users, // Icon for guests
  Calendar, // Icon for date
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressFormModal } from "@/components/AddressFormModal";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Context and Hooks
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useLogout";

// Type Definitions
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
// 文件内子组件 (Internal Components)
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
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="relative">
        <Image
          src={getFullImageUrl(item.image_url)}
          alt={item.menu_name}
          width={64}
          height={64}
          className="flex-shrink-0 rounded-lg object-cover bg-white border-2 border-gray-100 aspect-square"
        />
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {item.quantity}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-gray-900 text-base">{item.menu_name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                数量: {item.quantity}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-orange-600 text-lg">
              RM{Number(item.item_total).toFixed(2)}
            </span>
          </div>
        </div>
        {(item.variants?.length > 0 || item.addons?.length > 0) && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-lg p-3 text-sm mt-3">
            {item.variants?.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="font-semibold text-gray-800">规格选择</span>
                </div>
                <div className="space-y-1">
                  {item.variants.map((v) => (
                    <div className="flex justify-between items-center bg-white/70 rounded-md px-3 py-1.5" key={v.id}>
                      <span className="text-gray-700">{v.variant_name}</span>
                      <span className="font-medium text-orange-600">+RM{Number(v.variant_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {item.addons?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="font-semibold text-gray-800">附加项目</span>
                </div>
                <div className="space-y-1">
                  {item.addons.map((a) => (
                    <div className="flex justify-between items-center bg-white/70 rounded-md px-3 py-1.5" key={a.id}>
                      <span className="text-gray-700">{a.addon_name}</span>
                      <span className="font-medium text-green-600">+RM{Number(a.addon_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
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
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="relative">
        <Image
          src={getFullImageUrl(item.package_image)}
          alt={item.package_name}
          width={64}
          height={64}
          className="flex-shrink-0 rounded-lg object-cover bg-white border-2 border-gray-100 aspect-square"
        />
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {item.quantity}
        </div>
        <div className="absolute -bottom-1 -left-1 bg-purple-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
          套餐
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-gray-900 text-base">{item.package_name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                数量: {item.quantity}
              </span>
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                {item.menus.length} 个菜品
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-orange-600 text-lg">
              RM{Number(item.item_total).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {item.menus.map((pkgMenu, index) => (
            <div
              key={pkgMenu.id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                </div>
                <h5 className="font-semibold text-gray-800">{pkgMenu.menu_name}</h5>
              </div>
              
              {(pkgMenu.variants?.length > 0 || pkgMenu.addons?.length > 0) && (
                <div className="pl-8 space-y-2">
                  {pkgMenu.variants?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">规格选择</span>
                      </div>
                      <div className="space-y-1">
                        {pkgMenu.variants.map((v) => (
                          <div className="flex justify-between items-center bg-white rounded-md px-2 py-1 text-xs" key={v.id}>
                            <span className="text-gray-600">{v.variant_name}</span>
                            <span className="font-medium text-orange-600">+RM{Number(v.variant_price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkgMenu.addons?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">附加项目</span>
                      </div>
                      <div className="space-y-1">
                        {pkgMenu.addons.map((a) => (
                          <div className="flex justify-between items-center bg-white rounded-md px-2 py-1 text-xs" key={a.id}>
                            <span className="text-gray-600">{a.addon_name}</span>
                            <span className="font-medium text-green-600">+RM{Number(a.addon_price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/** @brief 渲染订单摘要信息 */
const OrderSummary: FC<{ order: Order }> = ({ order }) => {
  const { t } = useLanguage();

  const serviceMethodMap: {
    [key: string]: { icon: React.ElementType; text: string };
  } = {
    delivery: { icon: Truck, text: t("delivery") || "外卖配送" },
    pickup: { icon: Store, text: t("pickup") || "到店自取" },
    "dine_in": { icon: HandPlatter, text: t("dine_in") || "店内用餐" },
  };
  const currentService = serviceMethodMap[order.service_method] || {
    icon: HandPlatter,
    text: order.service_method,
  };

  return (
    // Display Order Detail Such as delivery,pickup,dine_in
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Receipt className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">订单摘要</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Service Method */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <currentService.icon className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-2">{currentService.text}</p>
            
            {order.service_method === "delivery" && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span>{order.delivery_name} ({order.delivery_phone})</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="p-1 bg-green-100 rounded-lg mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p>{order.delivery_address}</p>
                    {order.delivery_building && (
                      <p className="text-gray-600">{order.delivery_building}, {order.delivery_floor}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {order.service_method === "pickup" && order.pickup_time && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">
                    取餐时间: {new Date(order.pickup_time).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            {order.service_method === "dine_in" && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Store className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">桌号</p>
                      <p className="font-semibold text-gray-900">{order.table_code || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">人数</p>
                      <p className="font-semibold text-gray-900">{order.guests_count || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Calendar className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">日期</p>
                      <p className="font-semibold text-gray-900">
                        {order.dining_date ? new Date(order.dining_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-0.5">时间</p>
                      <p className="font-semibold text-gray-900">
                        {order.checkin_time && order.checkout_time 
                          ? `${order.checkin_time} - ${order.checkout_time}` 
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">支付方式</p>
            <p className="text-gray-600">{order.payment_method}</p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-2">支付状态</p>
            <Badge className={`text-xs ${getPaymentStatusColor(order.payment_status)}`}>
              {t(order.payment_status) || order.payment_status}
            </Badge>
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-yellow-50 rounded-xl">
              <StickyNote className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-2">特殊备注</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {order.special_instructions}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">小计</span>
            <span className="font-medium text-gray-900">RM{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">配送费</span>
            <span className="font-medium text-gray-900">RM{Number(order.delivery_fee).toFixed(2)}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-600 flex items-center gap-2">
                折扣 {order.promo_code && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                    {order.promo_code}
                  </span>
                )}
              </span>
              <span className="font-medium text-green-600">- RM{Number(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">总计</span>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              RM{Number(order.total_amount).toFixed(2)}
            </span>
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
    // 主要的订单卡片组件（整合所有部分）
<div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
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
          {t(order.status) || order.status}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          RM{Number(order.total_amount).toFixed(2)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
          <span>
            {isExpanded ? t("collapseDetails") : t("viewDetails")}
          </span>
          <div className="p-1 rounded-full bg-gray-100 hover:bg-orange-100 transition-colors">
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  {isExpanded && (
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
      <OrderSummary order={order} />
      {order.menu_items?.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">菜单项</h3>
              <p className="text-sm text-gray-500">{order.menu_items.length} 个菜品</p>
            </div>
          </div>
          <div className="space-y-3">
            {order.menu_items.map((item) => (
              <OrderItemDetails key={`menu-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}
      {order.package_items?.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">套餐项</h3>
              <p className="text-sm text-gray-500">{order.package_items.length} 个套餐</p>
            </div>
          </div>
          <div className="space-y-3">
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

/** @brief 加载覆盖层组件 */
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

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

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
      const e = t("errorFetchingOrders") || "无法加载订单记录。";
      setOrdersError(e);
      toast.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [t]);

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

  useEffect(() => {
    let tempOrders = [...orders];

    if (statusFilter !== "all") {
      tempOrders = tempOrders.filter((order) => order.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case "today":
          tempOrders = tempOrders.filter((order) => {
            const orderDate = new Date(order.created_at);
            return orderDate >= today;
          });
          break;
        case "week":
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          tempOrders = tempOrders.filter(
            (order) => new Date(order.created_at) >= lastWeek
          );
          break;
        case "month":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          tempOrders = tempOrders.filter(
            (order) => new Date(order.created_at) >= lastMonth
          );
          break;
      }
    }

    setFilteredOrders(tempOrders);
  }, [orders, statusFilter, dateFilter]);

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        {t("orders")}
                      </CardTitle>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-full sm:w-[160px] rounded-xl bg-white hover:bg-orange-50 border-orange-500 cursor-pointer">
                            <SelectValue
                              placeholder={t("filterStatus") || "Filter Status"}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-2xl shadow-lg p-2">
                            <SelectItem
                              value="all"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("All Status") || "All Status"}
                            </SelectItem>
                            <SelectItem
                              value="pending"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("pending") || "Pending"}
                            </SelectItem>
                            <SelectItem
                              value="completed"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("completed") || "Completed"}
                            </SelectItem>
                            <SelectItem
                              value="cancelled"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("cancelled") || "Cancelled"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={dateFilter}
                          onValueChange={setDateFilter}
                        >
                          <SelectTrigger className="w-full sm:w-[160px] rounded-xl bg-white hover:bg-orange-50 border-orange-500 cursor-pointer">
                            <SelectValue
                              placeholder={t("filterDate") || "Filter Date"}
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white/90 backdrop-blur-sm border-orange-200 rounded-2xl shadow-lg p-2">
                            <SelectItem
                              value="all"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("AllTime") || "All Time"}
                            </SelectItem>
                            <SelectItem
                              value="today"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("today") || "Today"}
                            </SelectItem>
                            <SelectItem
                              value="week"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("thisWeek") || "This Week"}
                            </SelectItem>
                            <SelectItem
                              value="month"
                              className="rounded-lg focus:bg-orange-100 data-[state=checked]:bg-gradient-to-r from-orange-500 to-red-500 data-[state=checked]:text-white cursor-pointer"
                            >
                              {t("thisMonth") || "This Month"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
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
                          <p>
                            {t("noOrdersMatchFilters") ||
                              "No orders match the selected filters."}
                          </p>
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