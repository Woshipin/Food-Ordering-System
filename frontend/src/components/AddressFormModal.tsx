/**
 * @file AddressFormModal.tsx
 * @description 用于添加或编辑用户地址的模态框（Modal）组件。
 * 它包含一个表单，用户可以输入姓名、电话、地址等信息。
 * 该组件还集成了自动地理编码功能，当用户输入地址时，会自动尝试获取该地址的经纬度。
 */

"use client"; // 声明这是一个客户端组件

import { useState, useEffect } from "react"; // 导入 React 的 useState 和 useEffect Hooks
import { useDebounce } from "@/hooks/useDebounce"; // 导入自定义的 useDebounce Hook
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog"; // 导入对话框（Dialog）相关的 UI 组件
import { Button } from "./ui/button"; // 导入按钮 UI 组件
import { Input } from "./ui/input"; // 导入输入框 UI 组件
import { Label } from "./ui/label"; // 导入标签 UI 组件
import { Checkbox } from "./ui/checkbox"; // 导入复选框 UI 组件
import { useLanguage } from "./LanguageProvider"; // 导入语言提供者 Hook，用于国际化
import { ClipLoader } from "react-spinners"; // 导入加载动画组件
import { toast } from "sonner"; // 导入 toast 通知库

// 定义地址对象的 TypeScript 接口
interface Address {
  id?: number; // 地址 ID（可选，仅在编辑时存在）
  name: string; // 收件人姓名
  phone: string; // 电话号码
  address: string; // 详细地址
  building?: string; // 楼栋号（可选）
  floor?: string; // 楼层（可选）
  is_default: boolean; // 是否为默认地址
  latitude?: number; // 纬度（可选）
  longitude?: number; // 经度（可选）
}

// 定义组件 props 的 TypeScript 接口
interface AddressFormModalProps {
  isOpen: boolean; // 模态框是否打开
  onClose: () => void; // 关闭模态框的回调函数
  onSave: (address: Address) => Promise<void>; // 保存地址的回调函数
  addressToEdit: Address | null; // 需要编辑的地址对象，如果为 null 则为添加模式
}

/**
 * 地址表单模态框组件。
 * @param {AddressFormModalProps} props - 组件的 props。
 * @returns {JSX.Element} 渲染出的 JSX 元素。
 */
export function AddressFormModal({
  isOpen,
  onClose,
  onSave,
  addressToEdit,
}: AddressFormModalProps) {
  const { t } = useLanguage(); // 获取国际化翻译函数
  // 定义表单数据的 state
  const [formData, setFormData] = useState<Address>({
    name: "",
    phone: "",
    address: "",
    building: "",
    floor: "",
    is_default: false,
    latitude: undefined,
    longitude: undefined,
  });
  const [isSaving, setIsSaving] = useState(false); // 定义是否正在保存的状态
  const [isGeocoding, setIsGeocoding] = useState(false); // 定义是否正在进行地理编码的状态

  // 使用 useEffect 来根据 props 初始化或重置表单数据
  useEffect(() => {
    if (addressToEdit) {
      // 如果是编辑模式，则用传入的地址数据填充表单
      setFormData(addressToEdit);
    } else {
      // 如果是添加模式，则重置表单
      setFormData({
        name: "",
        phone: "",
        address: "",
        building: "",
        floor: "",
        is_default: false,
        latitude: undefined,
        longitude: undefined,
      });
    }
  }, [addressToEdit, isOpen]); // 依赖项：仅当 addressToEdit 或 isOpen 变化时执行

  // 使用 useDebounce Hook 来获取延迟更新后的地址字符串
  const debouncedAddress = useDebounce(formData.address, 500); // 500ms 延迟

  // 使用 useEffect 来监听 debouncedAddress 的变化，并触发地理编码
  useEffect(() => {
    const geocodeAddress = async () => {
      // 如果地址为空，则清空经纬度并返回
      if (!debouncedAddress) {
        setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
        return;
      }
      setIsGeocoding(true); // 开始地理编码，设置加载状态
      try {
        // 使用 fetch API 直接请求 Nominatim 服务
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedAddress)}&format=json&limit=1`, {
          headers: {
            'User-Agent': 'FoodOrderingSystem/1.0 (https://your-app-url.com)', // 设置 User-Agent，遵守 Nominatim 的使用政策
          }
        });
        // 如果网络响应不成功，则抛出错误
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json(); // 解析 JSON 响应
        console.log("Geocoding response:", data); // 在控制台打印响应以供调试
        // 如果成功获取到数据
        if (data && data.length > 0) {
          // 更新表单数据，填入获取到的经纬度
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          }));
        } else {
          // 如果没有找到结果，则在控制台打印信息，并弹出提示
          console.log("No geocoding results found.");
          toast.info(t("noGeocodeResults"));
          setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
        }
      } catch (error) {
        // 如果请求失败，则在控制台打印错误，并弹出错误提示
        console.error("Geocoding failed", error);
        toast.error(t("geocodeError"));
        setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
      } finally {
        // 无论成功或失败，都结束地理编码的加载状态
        setIsGeocoding(false);
      }
    };

    geocodeAddress(); // 调用地理编码函数
  }, [debouncedAddress]); // 依赖项：仅当 debouncedAddress 变化时执行

  // 处理输入框变化的通用函数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // 获取输入框的 name 和 value
    setFormData((prev) => ({ ...prev, [name]: value })); // 更新对应的表单数据
  };

  // 处理复选框变化的函数
  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_default: checked })); // 更新 is_default 字段
  };

  // 处理表单提交的函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认的提交行为
    setIsSaving(true); // 开始保存，设置加载状态
    await onSave(formData); // 调用父组件传入的 onSave 函数
    setIsSaving(false); // 结束保存，清除加载状态
  };

  // 渲染组件 UI
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[900px] h-[80vh] max-h-[600px] p-0 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 backdrop-blur-xl border border-orange-200/50 rounded-lg shadow-2xl shadow-orange-200/30">
        
        {/* 头部区域 */}
        <DialogHeader className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 px-8 py-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-500/20"></div>
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-bold text-white mb-2 drop-shadow-sm">
              {addressToEdit ? t("editAddress") : t("addAddress")}
            </DialogTitle>
            <DialogDescription className="text-orange-100 text-sm">
              {t("addressFormDescription")}
            </DialogDescription>
          </div>
          <div className="absolute top-4 right-6 w-16 h-16 bg-white/10 rounded-lg blur-xl"></div>
          <div className="absolute bottom-2 right-12 w-8 h-8 bg-white/20 rounded-lg blur-sm"></div>
        </DialogHeader>

        {/* 可滚动的表单内容区域 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 个人信息部分 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-orange-100/50 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-sm mr-3"></div>
                个人信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-md transition-all duration-200 hover:bg-white/90"
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
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-md transition-all duration-200 hover:bg-white/90"
                    placeholder="请输入手机号码"
                  />
                </div>
              </div>
            </div>

            {/* 地址信息部分 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-orange-100/50 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-sm mr-3"></div>
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
                    className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-md transition-all duration-200 hover:bg-white/90 w-full"
                    placeholder="请输入详细地址"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-orange-700 font-medium text-sm">
                      {t("latitude")}
                    </Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      value={formData.latitude || ""}
                      readOnly
                      className="bg-gray-100 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-orange-700 font-medium text-sm">
                      {t("longitude")}
                    </Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      value={formData.longitude || ""}
                      readOnly
                      className="bg-gray-100 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building" className="text-orange-700 font-medium text-sm">
                      {t("building")}
                    </Label>
                    <Input
                      id="building"
                      name="building"
                      value={formData.building || ""}
                      onChange={handleChange}
                      className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-md transition-all duration-200 hover:bg-white/90"
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
                      className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-200 rounded-md transition-all duration-200 hover:bg-white/90"
                      placeholder="楼层"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 设置部分 */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-sm rounded-lg p-5 border border-orange-200/50">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={handleCheckboxChange}
                  className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded-sm"
                />
                <Label htmlFor="is_default" className="cursor-pointer text-orange-800 font-medium flex items-center">
                  <span className="mr-2">📍</span>
                  {t("setAsDefaultAddress")}
                </Label>
              </div>
            </div>
          </form>
        </div>

        {/* 底部区域 */}
        <DialogFooter className="flex-shrink-0 bg-gradient-to-r from-gray-50 via-orange-50 to-amber-50 px-8 py-6 border-t border-orange-100/50 rounded-b-lg">
          <div className="flex space-x-3 w-full">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-md py-2.5 font-medium transition-all duration-200"
              >
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSaving}
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 hover:from-orange-600 hover:via-orange-500 hover:to-amber-600 text-white rounded-md py-2.5 font-semibold shadow-lg shadow-orange-200/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
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
      </DialogContent>
    </Dialog>
  );
}