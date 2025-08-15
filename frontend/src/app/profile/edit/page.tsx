"use client"; // 声明这是一个客户端组件，可以在浏览器中运行并使用React钩子。

// 从React和Next.js导入核心功能
import { useState, useEffect, useRef, FC } from "react"; // 导入React的核心钩子和FC类型
import Link from "next/link"; // 用于客户端导航
import Image from "next/image"; // 用于优化图片显示
import { useRouter } from "next/navigation"; // 用于编程式导航

// 从lucide-react导入所有需要的图标
import { Loader2, ArrowLeft, Camera, Save, X } from "lucide-react";

// 从自定义UI组件库中导入所需组件
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

// 导入自定义钩子和上下文
import { useAuth } from "../../../context/AuthContext"; // 用于获取和更新用户信息
import { useLanguage } from "../../../components/LanguageProvider"; // 用于多语言支持
import { LanguageSwitcher } from "../../../components/LanguageSwitcher"; // 语言切换组件

// 导入其他库和工具
import axios from "../../../lib/axios"; // 预配置的axios实例
import { toast, Toaster } from "sonner"; // 用于显示通知

// 导入类型定义
import { EditProfileFormData } from "./lib/types";

// =====================================================================================
// 辅助函数：构建完整的图片URL
// =====================================================================================
/**
 * @brief 根据后端返回的相对路径，构建一个前端可以访问的完整图片URL。
 * @param imagePath 后端返回的图片路径。
 * @returns 返回一个完整的URL或一个默认图片路径。
 */
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return "/user_image/profile-image.jpg"; // 提供一个默认头像
  }
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${imagePath}`;
};

// =====================================================================================
// 子组件：表单输入字段 (FormField)
// =====================================================================================
interface FormFieldProps {
  id: keyof EditProfileFormData;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}
/**
 * @brief 一个可重用的表单字段组件，封装了Label和Input，使主组件更整洁。
 */
const FormField: FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="font-medium text-gray-700">
      {label}
    </Label>
    <Input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="bg-gray-50 rounded-xl"
      autoComplete={autoComplete}
    />
  </div>
);

// =====================================================================================
// 主页面组件 (EditProfilePage)
// =====================================================================================
export default function EditProfilePage() {
  // ---- 状态管理 (State Management) ----
  const { t } = useLanguage(); // 获取翻译函数
  const router = useRouter(); // 初始化路由器
  const { user, login } = useAuth(); // 获取当前用户和更新用户的函数
  const [token, setToken] = useState<string | null>(null); // 存储认证令牌

  // 表单数据状态，使用从lib导入的类型
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
  });

  // UI状态
  const [loading, setLoading] = useState(true); // 页面初始加载状态
  const [isSaving, setIsSaving] = useState(false); // 表单保存状态

  // 图片处理状态
  const [userImage, setUserImage] = useState<string | null>(null); // 当前用户头像路径
  const [imagePreview, setImagePreview] = useState<string | null>(null); // 新选择的图片的本地预览URL
  const fileInputRef = useRef<HTMLInputElement>(null); // 对隐藏的文件输入框的引用

  // ---- 副作用 (Side Effects) ----

  /**
   * @brief 此useEffect在组件首次挂载时运行，用于获取并填充用户信息。
   */
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token"); // 从localStorage读取令牌
    setToken(storedToken);

    // 定义一个异步函数来获取用户数据
    const fetchUser = async (authToken: string) => {
      try {
        const res = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // 如果全局状态中的user不存在，则更新它
        if (!user) {
          login(res.data, authToken);
        }

        // 使用从后端获取的数据填充表单
        setFormData((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
          phone_number: res.data.phone_number || "",
        }));
        setUserImage(res.data.user_image); // 设置当前头像
      } catch (error) {
        toast.error("获取个人资料失败。");
      } finally {
        setLoading(false); // 结束加载
      }
    };

    if (storedToken) {
      fetchUser(storedToken);
    } else {
      setLoading(false); // 如果没有令牌，直接结束加载
    }
  }, []); // 空依赖数组确保只运行一次

  // ---- 事件处理 (Event Handlers) ----

  /**
   * @brief 当用户选择新图片时触发。
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // 生成并设置图片预览URL
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * @brief 当任何输入框的内容变化时更新表单状态。
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * @brief 处理表单提交。
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止页面刷新
    if (!token) {
      toast.error("认证失败，请重新登录。");
      return;
    }

    // 只有在输入了新密码时才检查两次密码是否一致
    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      toast.error("两次输入的新密码不匹配。");
      return;
    }

    setIsSaving(true); // 开始保存，UI进入加载状态

    // 创建FormData对象以发送文件和文本数据
    const submissionData = new FormData();
    submissionData.append("name", formData.name);
    submissionData.append("email", formData.email);
    submissionData.append("phone_number", formData.phone_number);
    submissionData.append("_method", "PUT"); // 告诉Laravel模拟PUT请求

    // 只有在输入了新密码时才将其添加到提交数据中
    if (formData.password && formData.password_confirmation) {
      submissionData.append("password", formData.password);
      submissionData.append(
        "password_confirmation",
        formData.password_confirmation
      );
    }

    // 只有在选择了新图片时才将其添加到提交数据中
    if (fileInputRef.current?.files?.[0]) {
      submissionData.append("user_image", fileInputRef.current.files[0]);
    }

    // 使用toast.promise来处理异步请求的UI反馈
    const promise = axios
      .post("/auth/user/profile", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res: { data: { user: any } }) => {
        // 请求成功后，使用后端返回的最新用户信息更新全局状态
        login(res.data.user, token as string);
        // 延迟一小段时间后跳转页面，让用户能看到成功提示
        setTimeout(() => {
          router.push("/profile");
        }, 500);
      });

    toast.promise(promise, {
      loading: "正在更新个人资料...",
      success: "个人资料更新成功！",
      error: (err: any) => {
        // 如果后端返回了验证错误，则拼接并显示它们
        const errors = err.response?.data?.errors;
        if (errors) {
          return Object.values(errors).flat().join(" ");
        }
        return "更新失败，请检查您的输入。";
      },
    });

    promise.finally(() => setIsSaving(false)); // 无论成功或失败，结束保存状态
  };

  // ---- 渲染 (Rendering) ----

  // 初始加载时显示加载动画
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        {/* 页面头部 */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {t("editProfile")}
                </h1>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* 页面主内容 */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <section className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 个人信息部分 */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {t("personalInformation")}
                  </h2>
                  {/* 头像上传 */}
                  <div className="flex flex-col items-center space-y-4 mb-8">
                    <div className="relative">
                      <Image
                        src={imagePreview || getFullImageUrl(userImage)}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full object-cover border-4 border-orange-200"
                        key={imagePreview || userImage || "default-image"}
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full h-8 w-8 shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("changePhoto")}
                    </p>
                  </div>

                  {/* 表单字段 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      id="name"
                      label={t("name")}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      id="email"
                      label={t("email")}
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <FormField
                      id="phone_number"
                      label={t("phoneNumber")}
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 更改密码部分 */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("changePassword")}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    {t("leavePasswordBlank")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      id="password"
                      label={t("newPassword")}
                      type="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <FormField
                      id="password_confirmation"
                      label={t("confirmNewPassword")}
                      type="password"
                      value={formData.password_confirmation || ""}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <Link href="/profile">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl flex items-center gap-2"
                    >
                      <X className="h-4 w-4" /> {t("cancel")}
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t("saveChanges")}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}