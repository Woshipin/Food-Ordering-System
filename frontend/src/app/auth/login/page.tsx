"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Lock,
  Mail,
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
import { LoginFormState, LoginValidationErrors } from "./lib/types";

export default function LoginPage() {
  // 使用语言切换钩子
  const { t } = useLanguage();
  const router = useRouter();
  // 使用认证钩子
  const { login } = useAuth();
  // 控制密码是否可见的状态
  const [showPassword, setShowPassword] = useState(false);
  // 控制加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 表单数据状态
  const [formData, setFormData] = useState<LoginFormState>({
    email: "aaa@gmail.com",
    password: "123456",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginValidationErrors>({});
 
   // 使用 useEffect 在组件加载时清空表单字段
   useEffect(() => {
     setFormData((prev) => ({
       ...prev,
       email: "",
       password: "",
     }));
   }, []); // 空依赖数组确保只在组件首次加载时运行
 
   // 处理表单提交
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    setIsLoading(true); // 开始加载
    setErrors({}); // 清除之前的错误

    try {
      // 发送登录请求到后端 /api/auth/login
      const response = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      const { access_token } = response.data; // 从响应中获取 access_token

      // 登录成功后，使用获取到的 token 去获取用户信息
      const userResponse = await axios.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`, // 在请求头中附带 token
        },
      });

      // 显示成功提示
      toast.success(t("loginSuccess"));
      // 调用 AuthContext 中的 login 方法，保存用户信息和 token
      login(userResponse.data, access_token);
      
      // 2秒后重定向到首页
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      // 处理登录失败的情况
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 如果后端返回了具体的错误信息，则显示它
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        // 否则显示通用的登录失败信息
        toast.error(t("loginFailed"));
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
        {/* 背景装饰元素 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
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
                      <LogIn className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      {t("loginTitle")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-100">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
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
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
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
                          autoComplete="current-password"
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
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.password[0]}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked: boolean) =>
                            setFormData((prev) => ({
                              ...prev,
                              rememberMe: checked,
                            }))
                          }
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-600 font-normal"
                        >
                          {t("rememberMe")}
                        </Label>
                      </div>
                      <Link
                        href="/"
                        className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        t("loginButton")
                      )}
                    </Button>
                  </form>
                </div>

                <div className="bg-orange-50 rounded-2xl p-3 mb-4 border border-orange-100">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {t("dontHaveAccount")}{" "}
                      <Link
                        href="/auth/register"
                        className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      >
                        {t("clickToRegister")}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">
                        {t("orWithSocial")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-gray-50 rounded-xl border-gray-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285f4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34a853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#fbbc05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#ea4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t("signInWithGoogle")}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-white hover:bg-gray-50 rounded-xl border-gray-200 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="#1877f2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      {t("signInWithFacebook")}
                    </Button>
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
