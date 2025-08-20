"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { RegisterFormState, RegisterValidationErrors } from "./lib/types";

// =====================================================================================
// 加载覆盖层组件 (Loading Overlay Component)
// =====================================================================================
interface LoadingOverlayProps {
  title?: string;
  description?: string;
  isFullScreen?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
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
// 注册页面主组件 (Register Page Main Component)
// =====================================================================================
export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormState>({
    name: "",
    email: "",
    phone_number: "",
    user_image: "",
    password: "",
    password_confirmation: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<RegisterValidationErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }
    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post("/auth/register", formData);
      const { access_token } = response.data;

      const userResponse = await axios.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      toast.success(t("registrationSuccess"));
      login(userResponse.data, access_token);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t("registrationFailed"));
      }
      // 注册失败后也要停止加载
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <>
      {/* **关键改动 1：添加 LoadingOverlay** */}
      {isLoading && (
        <LoadingOverlay
          isFullScreen={true}
          title={t("creatingAccount") || "正在创建账户"}
          description={t("pleaseWaitRegistration") || "请稍候，我们正在为您完成注册..."}
        />
      )}
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 relative overflow-hidden">
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
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name[0]}
                        </p>
                      )}
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
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email[0]}
                        </p>
                      )}
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
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone_number && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.phone_number[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

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
                          autoComplete="new-password"
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
                      {errors.password && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.password[0]}
                        </p>
                      )}
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
                          autoComplete="new-password"
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
                      {errors.password_confirmation && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.password_confirmation[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

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
                        {t("iAgreeTo")} {t("termsOfServiceLink")} {t("and")}{" "}
                        {t("privacyPolicyLink")}
                      </Label>
                    </div>

                    {/* **关键改动 2：移除按钮内的加载动画** */}
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={!formData.agreeToTerms || isLoading}
                    >
                      {t("registerButton")}
                    </Button>
                  </div>
                </div>

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