"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image from next/image
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
  AlertCircle,
  Package,
  UtensilsCrossed
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
import axios from "@/lib/axios";
import { toast } from "sonner";
import { AddressFormModal } from "@/components/AddressFormModal";
import { AddressSkeleton } from "@/components/AddressSkeleton";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

// --- START: UPDATED TYPE DEFINITIONS FOR ORDERS ---

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  building?: string;
  floor?: string;
  is_default: boolean;
}

interface OrderAddon {
  id: number;
  addon_name: string;
  addon_price: number;
}

interface OrderVariant {
  id: number;
  variant_name: string;
  variant_price: number;
}

interface OrderMenuItem {
  id: number;
  menu_name: string;
  menu_description: string | null;
  image_url: string | null;
  category_name: string | null;
  quantity: number;
  item_total: number;
  addons: OrderAddon[];
  variants: OrderVariant[];
}

interface OrderPackageItemMenu {
  id: number;
  menu_name: string;
  quantity: number;
  addons: OrderAddon[];
  variants: OrderVariant[];
}

interface OrderPackageItem {
  id: number;
  package_name: string;
  package_description: string | null;
  package_image: string | null;
  category_name: string | null;
  quantity: number;
  item_total: number;
  menus: OrderPackageItemMenu[];
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  menu_items: OrderMenuItem[];
  package_items: OrderPackageItem[];
}

// --- END: UPDATED TYPE DEFINITIONS FOR ORDERS ---

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();
  const [activeTab, setActiveTab] = useState("profile");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

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
      // Backend now returns orders with 'menu_items' and 'package_items'
      const response = await axios.get("/orders");
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      const errorMessage = "Could not load orders.";
      setOrdersError(errorMessage);
      toast.error(errorMessage);
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
      console.error("Failed to fetch addresses:", error);
      const errorMessage = t("errorFetchingAddresses") || "Could not load addresses.";
      setAddressError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [t]);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchAddresses, fetchOrders]);

  const handleSetDefault = (addressId: number) => {
    setConfirmationState({
      isOpen: true,
      title: t("confirmSetDefaultTitle") || "Set as Default?",
      description: t("confirmSetDefaultDesc") || "Are you sure you want to set this address as your default?",
      onConfirm: () => executeSetDefault(addressId),
    });
  };

  const executeSetDefault = (addressId: number) => {
    setIsConfirming(true);
    const promise = axios.patch(`/address/${addressId}/set-default`, {}).then(() => {
      fetchAddresses();
    });

    toast.promise(promise, {
      loading: t("updatingAddress") || "Updating address...",
      success: t("setDefaultSuccess") || "Default address updated.",
      error: t("setDefaultFailed") || "Failed to set default address.",
    });

    promise.finally(() => {
      handleCloseConfirmation();
    });
  };

  const handleDeleteAddress = (addressId: number) => {
    setConfirmationState({
      isOpen: true,
      title: t("confirmDeleteTitle") || "Delete Address?",
      description: t("confirmDeleteDesc") || "Are you sure you want to delete this address? This action cannot be undone.",
      onConfirm: () => executeDelete(addressId),
    });
  };

  const executeDelete = (addressId: number) => {
    setIsConfirming(true);
    const promise = axios.delete(`/delete/address/${addressId}`).then(() => {
      fetchAddresses();
    });

    toast.promise(promise, {
      loading: t("deletingAddress") || "Deleting address...",
      success: t("addressDeletedSuccess") || "Address deleted successfully.",
      error: t("addressDeleteFailed") || "Failed to delete address.",
    });

    promise.finally(() => {
      handleCloseConfirmation();
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmationState({ isOpen: false, title: "", description: "", onConfirm: () => {} });
    setIsConfirming(false);
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

  const handleSaveAddress = async (addressData: Omit<Address, 'id'> & { id?: number }) => {
    const isEditing = !!addressData.id;
    const url = isEditing ? `/update/address/${addressData.id}` : '/add/address';
    const method = isEditing ? 'put' : 'post';

    const promise = axios[method](url, addressData).then(() => {
      fetchAddresses();
      handleCloseModal();
    });

    toast.promise(promise, {
      loading: isEditing ? (t("updatingAddress") || "Updating address...") : (t("addingAddress") || "Adding address..."),
      success: isEditing ? (t("addressUpdatedSuccess") || "Address updated.") : (t("addressAddedSuccess") || "Address added."),
      error: isEditing ? (t("addressUpdateFailed") || "Failed to update address.") : (t("addressAddFailed") || "Failed to add address."),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{t("profile")}</h1>
            </div>
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
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
                    <AvatarImage src={user?.user_image || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1"><Mail className="h-3 w-3" />{user?.email}</div>
                  <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-1"><Phone className="h-3 w-3" />{user?.phone_number}</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-6 border border-orange-100">
                  <nav className="space-y-2">
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('profile')}><User className="mr-2 h-4 w-4 text-orange-500" />{t("profile")}</Button>
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'addresses' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('addresses')}><MapPin className="mr-2 h-4 w-4 text-orange-500" />{t("addresses")}</Button>
                    <Button variant="ghost" className={`w-full justify-start hover:bg-white/80 transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-white/70' : ''}`} onClick={() => setActiveTab('orders')}><Clock className="mr-2 h-4 w-4 text-orange-500" />{t("orders")}</Button>
                  </nav>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? <ClipLoader size={16} color={"#dc2626"} className="mr-2" /> : <LogOut className="mr-2 h-4 w-4" />}{t("logout")}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-lg border-0">
                <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"><User className="h-4 w-4" />{t("profile")}</TabsTrigger>
                <TabsTrigger value="addresses" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"><MapPin className="h-4 w-4" />{t("addresses")}</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"><Clock className="h-4 w-4" />{t("orders")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-orange-500" />{t("profile")}
                      </CardTitle>
                      <Link href="/profile/edit" className="cursor-pointer">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg">
                          <Edit className="mr-2 h-4 w-4" />{t("edit")}
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">{t("name")}</label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2"><User className="h-4 w-4 text-orange-500" />{user?.name}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">{t("email")}</label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Mail className="h-4 w-4 text-orange-500" />{user?.email}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                          <label className="text-sm font-medium text-gray-600 mb-1 block">{t("phoneNumber")}</label>
                          <div className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Phone className="h-4 w-4 text-orange-500" />{user?.phone_number}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2"><MapPin className="h-5 w-5 text-orange-500" />{t("addresses")}</CardTitle>
                      <Button onClick={handleAddAddress} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg cursor-pointer"><Plus className="mr-2 h-4 w-4" />{t("addAddress")}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {isLoadingAddresses ? (
                        <AddressSkeleton count={3}/>
                      ) : addressError ? (
                        <div className="flex flex-col justify-center items-center p-8 text-red-600 bg-red-50 rounded-xl"><AlertCircle className="h-8 w-8 mb-2"/><p className="font-semibold">{addressError}</p></div>
                      ) : addresses.length > 0 ? (
                        addresses.map((address) => (
                          <div key={address.id} className={`bg-white rounded-xl p-4 border shadow-sm transition-all duration-200 hover:shadow-md ${address.is_default ? 'border-orange-500' : 'border-gray-100 hover:border-orange-300'}`} >
                            <div className="flex flex-wrap items-start justify-between gap-y-2">
                              <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900">{address.name}</span>
                                  <span className="text-gray-600">{address.phone}</span>
                                  {address.is_default && (<Badge className="bg-orange-100 text-orange-800 text-xs">{t("default")}</Badge>)}
                                </div>
                                <div className="text-gray-700 mb-1">{address.address}</div>
                                <div className="text-sm text-gray-500">
                                  {address.building && `${address.building} `}
                                  {address.floor && `${address.floor}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pl-2">
                                {!address.is_default && <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSetDefault(address.id); }}>{t("setDefault")}</Button>}
                                <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:bg-orange-50 hover:border-orange-200 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}>{t("edit")}</Button>
                                {!address.is_default && (<Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-xl cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}>{t("delete")}</Button>)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (<div className="text-center text-gray-500 p-8"><p>{t("noAddressesFound") || "You haven't added any addresses yet."}</p></div>)}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2"><Clock className="h-5 w-5 text-orange-500" />{t("orders")}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      {isLoadingOrders ? (
                        <div className="text-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto"></div>
                          <p className="mt-6 text-lg text-gray-600 font-semibold">Loading Orders...</p>
                        </div>
                      ) : ordersError ? (
                        <div className="flex flex-col justify-center items-center p-8 text-red-600 bg-red-50 rounded-xl"><AlertCircle className="h-8 w-8 mb-2"/><p className="font-semibold">{ordersError}</p></div>
                      ) : orders.length > 0 ? orders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all duration-300">
                            <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div><div className="font-medium text-gray-900">{t("orderNumber")}: {order.order_number}</div><div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div></div>
                                  <Badge className={getStatusColor(order.status)}>{t(order.status)}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-semibold text-orange-500">RM{Number(order.total_amount).toFixed(2)}</div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600"><span>{isExpanded ? t("collapseDetails") : t("viewDetails")}</span><ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} /></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* --- START: REFACTORED ORDER DETAILS RENDERING --- */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-6">
                                {/* Section for Individual Menu Items */}
                                {order.menu_items && order.menu_items.length > 0 && (
                                    <div>
                                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-orange-600"/>Individual Dishes</h3>
                                        <div className="space-y-4">
                                            {order.menu_items.map((item) => (
                                                <div key={`menu-item-${item.id}`} className="bg-gray-50/50 rounded-lg p-4 border">
                                                    <div className="flex gap-4">
                                                        <Image src={getFullImageUrl(item.image_url)} alt={item.menu_name} width={80} height={80} className="rounded-md object-contain bg-white border" />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-gray-800">{item.menu_name}</h4>
                                                                <span className="font-bold text-gray-800">RM{Number(item.item_total).toFixed(2)}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                            
                                                            <div className="text-xs mt-2 space-y-1">
                                                                {item.variants.length > 0 && (
                                                                    <div>
                                                                        <strong className="text-gray-600">Variants:</strong>
                                                                        {item.variants.map(v => <span key={v.id} className="ml-2 text-gray-500 block">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</span>)}
                                                                    </div>
                                                                )}
                                                                {item.addons.length > 0 && (
                                                                    <div>
                                                                        <strong className="text-gray-600">Add-ons:</strong>
                                                                        {item.addons.map(a => <span key={a.id} className="ml-2 text-gray-500 block">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</span>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Section for Package Items */}
                                {order.package_items && order.package_items.length > 0 && (
                                     <div>
                                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2"><Package className="h-5 w-5 text-orange-600"/>Package Combos</h3>
                                        <div className="space-y-4">
                                            {order.package_items.map((pkg) => (
                                                <div key={`pkg-item-${pkg.id}`} className="bg-gray-50/50 rounded-lg p-4 border">
                                                    <div className="flex gap-4 mb-3">
                                                        <Image src={getFullImageUrl(pkg.package_image)} alt={pkg.package_name} width={80} height={80} className="rounded-md object-contain bg-white border" />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="font-bold text-gray-800">{pkg.package_name}</h4>
                                                                <span className="font-bold text-gray-800">RM{Number(pkg.item_total).toFixed(2)}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">Qty: {pkg.quantity}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-xs mt-2 space-y-2 pl-4 border-l-2 border-orange-200">
                                                        <strong className="text-gray-600 text-sm block mb-1">Package Contents:</strong>
                                                        {pkg.menus.map(menu => (
                                                            <div key={menu.id} className="bg-white p-2 rounded-md border">
                                                                <p className="font-semibold text-gray-700">{menu.menu_name} (Qty: {menu.quantity})</p>
                                                                {menu.variants.length > 0 && (
                                                                    <div className="pl-2">
                                                                        <strong className="text-gray-600">Variants:</strong>
                                                                        {menu.variants.map(v => <span key={v.id} className="ml-2 text-gray-500 block">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</span>)}
                                                                    </div>
                                                                )}
                                                                {menu.addons.length > 0 && (
                                                                     <div className="pl-2">
                                                                        <strong className="text-gray-600">Add-ons:</strong>
                                                                        {menu.addons.map(a => <span key={a.id} className="ml-2 text-gray-500 block">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</span>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                              </div>
                            )}
                            {/* --- END: REFACTORED ORDER DETAILS RENDERING --- */}
                          </div>);
                      }) : (<div className="text-center text-gray-500 p-8"><p>{t("noOrderHistory") || "You have no past orders."}</p></div>)}
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