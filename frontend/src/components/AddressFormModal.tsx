"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useLanguage } from "./LanguageProvider";
import { ClipLoader } from "react-spinners";

interface Address {
  id?: number;
  name: string;
  phone: string;
  address: string;
  building?: string;
  floor?: string;
  is_default: boolean;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
  addressToEdit: Address | null;
}

export function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  addressToEdit,
}: AddressFormModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Address>({
    name: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    is_default: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setFormData(addressToEdit);
    } else {
      setFormData({
        name: "",
        phone: "",
        address: "",
        building: "",
        floor: "",
        is_default: false,
      });
    }
  }, [addressToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_default: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-gradient-to-br from-orange-50 via-white to-amber-50 backdrop-blur-xl border border-orange-200/50 rounded-3xl shadow-2xl shadow-orange-200/30">
        <form onSubmit={handleSubmit} className="relative">
          {/* Header Section - 大section */}
          <DialogHeader className="relative px-8 pt-8 pb-6 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 -mx-6 -mt-6 rounded-t-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-500/20 rounded-t-3xl"></div>
            <div className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
                {addressToEdit ? t("editAddress") : t("addAddress")}
              </DialogTitle>
              <DialogDescription className="text-orange-100 text-sm">
                {t("addressFormDescription")}
              </DialogDescription>
            </div>
            {/* 装饰性元素 */}
            <div className="absolute top-4 right-6 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-2 right-12 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
          </DialogHeader>

          {/* Form Content Section - 大section */}
          <div className="px-8 py-6 space-y-6">
            {/* Personal Information Section - 小section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-100/50 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                个人信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-orange-700 font-medium text-sm">
                    {t("Name")}
                  </Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-200 hover:bg-white/90" 
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-orange-700 font-medium text-sm">
                    {t("PhoneNumber")}
                  </Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-200 hover:bg-white/90" 
                    placeholder="请输入手机号码"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section - 小section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-orange-100/50 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                地址信息
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-orange-700 font-medium text-sm">
                    {t("Address")}
                  </Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-200 hover:bg-white/90" 
                    placeholder="请输入详细地址"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building" className="text-orange-700 font-medium text-sm">
                      {t("building")}
                    </Label>
                    <Input 
                      id="building" 
                      name="building" 
                      value={formData.building || ""} 
                      onChange={handleChange} 
                      className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-200 hover:bg-white/90" 
                      placeholder="楼栋号"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-orange-700 font-medium text-sm">
                      {t("floor")}
                    </Label>
                    <Input 
                      id="floor" 
                      name="floor" 
                      value={formData.floor || ""} 
                      onChange={handleChange} 
                      className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-200 hover:bg-white/90" 
                      placeholder="楼层"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section - 小section */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-sm rounded-2xl p-5 border border-orange-200/50">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="is_default" 
                  checked={formData.is_default} 
                  onCheckedChange={handleCheckboxChange}
                  className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-md"
                />
                <Label htmlFor="is_default" className="cursor-pointer text-orange-800 font-medium flex items-center">
                  <span className="mr-2">📍</span>
                  {t("setAsDefaultAddress")}
                </Label>
              </div>
            </div>
          </div>

          {/* Footer Section - 大section */}
          <DialogFooter className="px-8 py-6 bg-gradient-to-r from-gray-50 via-orange-50 to-amber-50 -mx-6 -mb-6 rounded-b-3xl border-t border-orange-100/50">
            <div className="flex space-x-3 w-full">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-xl py-2.5 font-medium transition-all duration-200"
                >
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="flex-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 hover:from-orange-600 hover:via-orange-500 hover:to-amber-600 text-white rounded-xl py-2.5 font-semibold shadow-lg shadow-orange-200/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader size={18} color={"#ffffff"} />
                    <span className="ml-2">保存中...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">💾</span>
                    {t("save")}
                  </span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}