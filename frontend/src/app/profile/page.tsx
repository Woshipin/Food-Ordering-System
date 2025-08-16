"use client"; // 声明这是一个客户端组件，意味着它可以在用户的浏览器中运行，并使用React的钩子等功能。

// 从React和Next.js导入核心功能
import { useState, useEffect, useCallback, FC } from "react"; // 导入React的核心钩子和FC类型
import Link from "next/link"; // 用于客户端导航
import Image from "next/image"; // 用于优化图片显示

// 从lucide-react导入所有需要的图标
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
} from "lucide-react";

// 从自定义UI组件库中导入所需组件
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

// 导入自定义钩子和上下文
import { useLanguage } from "../../components/LanguageProvider"; // 用于多语言支持
import { LanguageSwitcher } from "../../components/LanguageSwitcher"; // 语言切换组件
import { useAuth } from "@/context/AuthContext"; // 用于获取用户信息
import { useLogout } from "@/hooks/useLogout"; // 用于处理登出逻辑

// 导入其他库和工具
import { ClipLoader } from "react-spinners"; // 用于显示加载动画
import axios from "@/lib/axios"; // 预配置的axios实例
import { toast } from "sonner"; // 用于显示通知

// 导入组件和类型定义
import { AddressFormModal } from "@/components/AddressFormModal"; // 地址表单模态框
import { AddressSkeleton } from "@/components/AddressSkeleton"; // 地址加载时的骨架屏
import { ConfirmationDialog } from "@/components/ConfirmationDialog"; // 确认对话框
import { Address, Order } from "./lib/types"; // 从lib文件夹导入类型

// =====================================================================================
// 辅助函数：构建完整的图片URL
// =====================================================================================
/**
 * @brief 根据后端返回的相对路径，构建一个前端可以访问的完整图片URL。
 * @param imagePath 后端返回的图片路径 (例如: 'user_image/image.jpg')。
 * @returns 返回一个完整的URL (例如: 'http://127.0.0.1:8000/storage/user_image/image.jpg') 或一个默认图片路径。
 */
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  // 如果路径为空，返回一个默认的占位图。
  if (!imagePath) {
    return "/placeholder.svg";
  }
  // 如果路径已经是完整的URL，直接返回。
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  // 从环境变量中获取后端URL，并拼接成完整的路径。
  // NEXT_PUBLIC_BACKEND_URL 应该在 .env.local 文件中定义 (例如: NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000)
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${imagePath}`;
};

// =====================================================================================
// 子组件：个人信息展示项 (InfoRow)
// =====================================================================================
interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}
/**
 * @brief 一个可重用的UI组件，用于在个人资料页面上显示一行信息（如图标、标签和值）。
 * @param {React.ElementType} icon - 要显示的图标组件 (例如: User, Mail)。
 * @param {string} label - 信息的标签 (例如: "姓名", "邮箱")。
 * @param {string | null} value - 要显示的值。
 */
const InfoRow: FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
    <label className="text-sm font-medium text-gray-600 mb-1 block">
      {label}
    </label>
    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Icon className="h-4 w-4 text-orange-500" />
      {/* 如果值存在，则显示值；否则显示一个提示或保持为空 */}
      {value || <span className="text-sm text-gray-400">未提供</span>}
    </div>
  </div>
);

// =====================================================================================
// 主页面组件 (ProfilePage)
// =====================================================================================
export default function ProfilePage() {
  // ---- 状态管理 (State Management) ----
  const { t } = useLanguage(); // 获取翻译函数
  const { user } = useAuth(); // 从认证上下文中获取当前登录的用户信息
  const { handleLogout, isLoggingOut } = useLogout(); // 获取登出函数和加载状态

  // 控制当前激活的标签页 (profile, addresses, orders)
  const [activeTab, setActiveTab] = useState("profile");

  // 地址相关的状态
  const [addresses, setAddresses] = useState<Address[]>([]); // 存储地址列表
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true); // 地址是否正在加载
  const [addressError, setAddressError] = useState<string | null>(null); // 加载地址时的错误信息

  // 订单相关的状态
  const [orders, setOrders] = useState<Order[]>([]); // 存储订单列表
  const [isLoadingOrders, setIsLoadingOrders] = useState(true); // 订单是否正在加载
  const [ordersError, setOrdersError] = useState<string | null>(null); // 加载订单时的错误信息
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null); // 控制哪个订单详情是展开的

  // 模态框和对话框的状态
  const [isModalOpen, setIsModalOpen] = useState(false); // 地址表单模态框是否打开
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null); // 正在编辑的地址
  const [isConfirming, setIsConfirming] = useState(false); // 确认对话框是否在处理中
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // ---- 数据获取 (Data Fetching) ----

  /**
   * @brief 使用 useCallback 封装的异步函数，用于从后端获取订单列表。
   * @details useCallback 会缓存这个函数，只有当依赖项（这里为空）改变时才会重新创建，有助于性能优化。
   */
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true); // 开始加载，显示加载动画
    setOrdersError(null); // 清除之前的错误信息
    try {
      const response = await axios.get("/orders"); // 发送GET请求
      setOrders(response.data || []); // 将获取到的数据设置到状态中，如果数据为空则设置为空数组
    } catch (error) {
      console.error("获取订单失败:", error);
      const errorMessage = "无法加载订单记录。";
      setOrdersError(errorMessage); // 设置错误信息
      toast.error(errorMessage); // 显示错误通知
    } finally {
      setIsLoadingOrders(false); // 结束加载，隐藏加载动画
    }
  }, []);

  /**
   * @brief 使用 useCallback 封装的异步函数，用于从后端获取地址列表。
   */
  const fetchAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    setAddressError(null);
    try {
      const response = await axios.get("/address");
      setAddresses(response.data || []);
    } catch (error) {
      console.error("获取地址失败:", error);
      const errorMessage = t("errorFetchingAddresses") || "无法加载地址。";
      setAddressError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [t]); // 依赖项t表示如果语言切换，这个函数可能会被重新创建

  // ---- 副作用 (Side Effects) ----

  /**
   * @brief 使用 useEffect 钩子，在 activeTab 改变时触发相应的数据获取函数。
   */
  useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    }
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchAddresses, fetchOrders]); // 依赖项数组，当其中任何一个值改变时，effect会重新运行

  // ---- 事件处理 (Event Handlers) ----

  /**
   * @brief 准备并打开“设为默认”的确认对话框。
   * @param addressId 要设为默认的地址ID。
   */
  const handleSetDefault = (addressId: number) => {
    setConfirmationState({
      isOpen: true,
      title: t("confirmSetDefaultTitle") || "设为默认地址?",
      description:
        t("confirmSetDefaultDesc") || "您确定要将此地址设为默认地址吗？",
      onConfirm: () => executeSetDefault(addressId), // 将要执行的函数传递给对话框
    });
  };

  /**
   * @brief 执行“设为默认”的API调用。
   * @param addressId 地址ID。
   */
  const executeSetDefault = (addressId: number) => {
    setIsConfirming(true); // 开始确认过程，按钮会显示加载状态
    const promise = axios
      .patch(`/address/${addressId}/set-default`, {})
      .then(() => {
        fetchAddresses(); // 成功后重新获取地址列表以更新UI
      });

    // 使用toast.promise来显示加载、成功和失败的状态
    toast.promise(promise, {
      loading: t("updatingAddress") || "正在更新...",
      success: t("setDefaultSuccess") || "默认地址已更新。",
      error: t("setDefaultFailed") || "操作失败。",
    });

    promise.finally(() => {
      handleCloseConfirmation(); // 无论成功或失败，最后都关闭对话框
    });
  };

  /**
   * @brief 准备并打开“删除地址”的确认对话框。
   */
  const handleDeleteAddress = (addressId: number) => {
    setConfirmationState({
      isOpen: true,
      title: t("confirmDeleteTitle") || "删除地址?",
      description:
        t("confirmDeleteDesc") || "您确定要删除此地址吗？此操作无法撤销。",
      onConfirm: () => executeDelete(addressId),
    });
  };

  /**
   * @brief 执行删除地址的API调用。
   */
  const executeDelete = (addressId: number) => {
    setIsConfirming(true);
    const promise = axios.delete(`/address/delete/${addressId}`).then(() => {
      fetchAddresses(); // 成功后刷新列表
    });

    toast.promise(promise, {
      loading: t("deletingAddress") || "正在删除...",
      success: t("addressDeletedSuccess") || "地址已删除。",
      error: t("addressDeleteFailed") || "删除失败。",
    });

    promise.finally(() => {
      handleCloseConfirmation();
    });
  };

  /**
   * @brief 关闭确认对话框并重置其状态。
   */
  const handleCloseConfirmation = () => {
    setConfirmationState({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: () => {},
    });
    setIsConfirming(false);
  };

  /**
   * @brief 打开地址模态框以添加新地址。
   */
  const handleAddAddress = () => {
    setAddressToEdit(null); // 确保没有待编辑的地址
    setIsModalOpen(true);
  };

  /**
   * @brief 打开地址模态框以编辑现有地址。
   */
  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address); // 将要编辑的地址传入模态框
    setIsModalOpen(true);
  };

  /**
   * @brief 关闭地址模态框。
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddressToEdit(null);
  };

  /**
   * @brief 处理地址的保存（新增或更新）。
   */
  const handleSaveAddress = async (
    addressData: Omit<Address, "id"> & { id?: number }
  ) => {
    const isEditing = !!addressData.id; // 判断是编辑还是新增
    const url = isEditing
      ? `/address/update/${addressData.id}`
      : "/address/add";
    const method = isEditing ? "put" : "post";

    const promise = axios[method](url, addressData).then(() => {
      fetchAddresses(); // 成功后刷新列表
      handleCloseModal(); // 关闭模态框
    });

    toast.promise(promise, {
      loading: isEditing
        ? t("updatingAddress") || "正在更新地址..."
        : t("addingAddress") || "正在添加地址...",
      success: isEditing
        ? t("addressUpdatedSuccess") || "地址已更新。"
        : t("addressAddedSuccess") || "地址已添加。",
      error: isEditing
        ? t("addressUpdateFailed") || "更新失败。"
        : t("addressAddFailed") || "添加失败。",
    });
  };

  /**
   * @brief 根据订单状态返回不同的颜色样式。
   */
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

  // ---- 渲染 (Rendering) ----
  return (
    // 页面根容器，带有渐变背景和相对定位
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 relative overflow-hidden">
      {/* 背景装饰用的模糊圆圈 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* 页面头部 */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 返回按钮和页面标题 */}
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
            {/* 语言切换器 */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* 页面主内容区 */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧边栏：用户信息和导航 */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                {/* 用户头像和基本信息 */}
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
                {/* 导航按钮 */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border border-orange-100">
                  <nav className="space-y-2">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${
                        activeTab === "profile" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("profile")}
                    >
                      <User className="mr-2 h-4 w-4 text-orange-500" />
                      {t("profile")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${
                        activeTab === "addresses" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("addresses")}
                    >
                      <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                      {t("addresses")}
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${
                        activeTab === "orders" ? "bg-white/70" : ""
                      }`}
                      onClick={() => setActiveTab("orders")}
                    >
                      <Clock className="mr-2 h-4 w-4 text-orange-500" />
                      {t("orders")}
                    </Button>
                  </nav>
                </div>
                {/* 登出按钮 */}
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

          {/* 右侧主内容区：标签页 */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              {/* 标签页触发器列表 */}
              <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-lg border-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  {t("profile")}
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  {t("addresses")}
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  {t("orders")}
                </TabsTrigger>
              </TabsList>

              {/* 个人资料标签页内容 */}
              <TabsContent value="profile">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-500" />
                        {t("profile")}
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
                        {/* 使用 InfoRow 子组件来显示信息 */}
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

              {/* 地址标签页内容 */}
              <TabsContent value="addresses">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        {t("addresses")}
                      </CardTitle>
                      <Button
                        onClick={handleAddAddress}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addAddress")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {/* 根据加载和错误状态显示不同内容 */}
                      {isLoadingAddresses ? (
                        <AddressSkeleton count={3} />
                      ) : addressError ? (
                        <div className="flex flex-col justify-center items-center p-8 text-red-600 bg-red-50 rounded-xl">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p className="font-semibold">{addressError}</p>
                        </div>
                      ) : addresses.length > 0 ? (
                        addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`bg-white rounded-xl p-4 border shadow-sm transition-all duration-200 hover:shadow-md ${
                              address.is_default
                                ? "border-orange-500"
                                : "border-gray-100 hover:border-orange-300"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-y-2">
                              <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900">
                                    {address.name}
                                  </span>
                                  <span className="text-gray-600">
                                    {address.phone}
                                  </span>
                                  {address.is_default && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                      {t("default")}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-gray-700 mb-1">
                                  {address.address}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {address.building &&
                                    `${address.building} `}
                                  {address.floor && `${address.floor}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-2">
                                {!address.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetDefault(address.id);
                                    }}
                                  >
                                    {t("setDefault")}
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAddress(address);
                                  }}
                                >
                                  {t("edit")}
                                </Button>
                                {!address.is_default && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-xl cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(address.id);
                                    }}
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
                          <p>
                            {t("noAddressesFound") ||
                              "您还没有添加任何地址。"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 订单标签页内容 */}
              <TabsContent value="orders">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      {t("orders")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {isLoadingOrders ? (
                        <div className="text-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto"></div>
                          <p className="mt-6 text-lg text-gray-600 font-semibold">
                            正在加载订单...
                          </p>
                        </div>
                      ) : ordersError ? (
                        <div className="flex flex-col justify-center items-center p-8 text-red-600 bg-red-50 rounded-xl">
                          <AlertCircle className="h-8 w-8 mb-2" />
                          <p className="font-semibold">{ordersError}</p>
                        </div>
                      ) : orders.length > 0 ? (
                        orders.map((order) => {
                          const isExpanded = expandedOrderId === order.id;
                          return (
                            <div
                              key={order.id}
                              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-300"
                            >
                              <div
                                className="flex items-start justify-between cursor-pointer"
                                onClick={() =>
                                  setExpandedOrderId(isExpanded ? null : order.id)
                                }
                              >
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {t("orderNumber")}: {order.order_number}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(
                                          order.created_at
                                        ).toLocaleString()}
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
                                        {isExpanded
                                          ? t("collapseDetails")
                                          : t("viewDetails")}
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

                              {/* 订单详情展开部分 */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-6">
                                  {/* 菜单项 */}
                                  {order.menu_items &&
                                    order.menu_items.length > 0 && (
                                      <div>
                                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                                          菜单项
                                        </h3>
                                        <div className="space-y-4">
                                          {order.menu_items.map((item) => (
                                            <div
                                              key={`menu-item-${item.id}`}
                                              className="bg-gray-50/50 rounded-lg p-4 border"
                                            >
                                              <div className="flex gap-4">
                                                <Image
                                                  src={getFullImageUrl(
                                                    item.image_url
                                                  )}
                                                  alt={item.menu_name}
                                                  width={80}
                                                  height={80}
                                                  className="rounded-md object-contain bg-white border"
                                                />
                                                <div className="flex-1">
                                                  <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-800">
                                                      {item.menu_name}
                                                    </h4>
                                                    <span className="font-bold text-gray-800">
                                                      RM
                                                      {Number(
                                                        item.item_total
                                                      ).toFixed(2)}
                                                    </span>
                                                  </div>
                                                  <p className="text-sm text-gray-500">
                                                    数量: {item.quantity}
                                                  </p>
                                                  {/* 规格和附加项 */}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* 套餐项 */}
                                  {order.package_items &&
                                    order.package_items.length > 0 && (
                                      <div>
                                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                          <Package className="h-5 w-5 text-orange-600" />
                                          套餐项
                                        </h3>
                                        {/* ... 套餐项渲染逻辑 ... */}
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-500 p-8">
                          <p>
                            {t("noOrderHistory") || "您还没有任何订单记录。"}
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

      {/* 模态框和对话框组件 */}
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