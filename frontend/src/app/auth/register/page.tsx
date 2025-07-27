"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../components/LanguageProvider";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { Toaster, toast } from "sonner";
import axios from "../../../lib/axios";

export default function RegisterPage() {
  // 使用语言切换钩子
  const { t } = useLanguage();
  // 使用认证钩子
  const { login } = useAuth();
  // 控制密码是否可见的状态
  const [showPassword, setShowPassword] = useState(false);
  // 控制确认密码是否可见的状态
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 控制加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 表单数据状态
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    user_image: "",
    password: "",
    password_confirmation: "",
    agreeToTerms: false,
  });

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    // 检查两次输入的密码是否一致
    if (formData.password !== formData.password_confirmation) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }
    setIsLoading(true); // 开始加载

    try {
      // 发送注册请求到后端 /api/auth/register
      const response = await axios.post("/auth/register", formData);
      const { access_token } = response.data; // 从响应中获取 access_token

      // 注册成功后，使用获取到的 token 去获取用户信息
      const userResponse = await axios.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`, // 在请求头中附带 token
        },
      });

      // 显示成功提示
      toast.success(t("registrationSuccess"));
      // 调用 AuthContext 中的 login 方法，保存用户信息和 token
      login(userResponse.data, access_token);
      
      // 2秒后重定向到首页
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      // 处理注册失败的情况
      if (
        error.response &&
        error.response.data &&
        error.response.data.errors
      ) {
        // 如果后端返回了验证错误
        const errors = error.response.data.errors;
        Object.values(errors).forEach((error) => {
          toast.error((error as string[]).join(" "));
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 如果后端返回了其他错误信息
        toast.error(error.response.data.message);
      } else {
        // 显示通用的注册失败信息
        toast.error(t("registrationFailed"));
      }
    } finally {
      setIsLoading(false); // 结束加载
    }
  };

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // 根据输入类型更新表单数据
    }));
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0 rounded-3xl overflow-hidden">
              <CardHeader className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Link href="/">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    </Link>
                    <LanguageSwitcher />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-white/30">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      {t("registerTitle")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8">
                {/* Personal Information Section */}
                <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    {t("personalInformation")}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        {t("name")}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t("namePlaceholder")}
                          className="pl-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        {t("emailAddress")}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t("emailPlaceholder")}
                          className="pl-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone_number"
                        className="text-gray-700 font-medium"
                      >
                        {t("phoneNumber")}
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="phone_number"
                          name="phone_number"
                          type="text"
                          value={formData.phone_number}
                          onChange={handleChange}
                          placeholder={t("phoneNumberPlaceholder")}
                          className="pl-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-green-500" />
                    {t("passwordSettings")}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        {t("password")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder={t("passwordPlaceholder")}
                          className="pl-10 pr-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password_confirmation"
                        className="text-gray-700 font-medium"
                      >
                        {t("confirmPassword")}
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          placeholder={t("passwordPlaceholder")}
                          className="pl-10 pr-10 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Register Section */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked: boolean) =>
                          setFormData((prev) => ({
                            ...prev,
                            agreeToTerms: checked,
                          }))
                        }
                        required
                      />
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm text-gray-600"
                      >
                        {t("iAgreeTo")}{" "}
                        <Link
                          href="/"
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          {t("termsOfServiceLink")}
                        </Link>{" "}
                        {t("and")}{" "}
                        <Link
                          href="/"
                          className="text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          {t("privacyPolicyLink")}
                        </Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={!formData.agreeToTerms || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        t("registerButton")
                      )}
                    </Button>
                  </div>
                </div>

                {/* Login Link Section */}
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="text-center">
                    <p className="text-gray-600">
                      {t("alreadyHaveAccount")}{" "}
                      <Link
                        href="/auth/login"
                        className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      >
                        {t("clickToLogin")}
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
