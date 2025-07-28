"use client";

{/* "use client" 指令声明这是一个客户端组件，可以在浏览器中执行并使用 React 的状态和生命周期钩子。 */}
// 导入 React 相关的类型，这里导入 React 是为了在 JSDoc 中使用类型定义，但在现代 Next.js 中通常不是必需的。
import type React from "react";

// 从 "react" 中导入 useEffect 和 useState 钩子，用于处理组件的副作用和状态管理。
import { useEffect, useState } from "react";
// 从 "next/link" 导入 Link 组件，用于在 Next.js 应用中实现客户端导航，避免页面完全刷新。
import Link from "next/link";
// 从 "lucide-react" 库导入图标组件，这是一个轻量级的图标库。
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
// 从自定义的 UI 组件库中导入 Button 组件。
import { Button } from "../../components/ui/button";
// 从自定义的 UI 组件库中导入 Input 组件。
import { Input } from "../../components/ui/input";
// 从自定义的 UI 组件库中导入 Label 组件。
import { Label } from "../../components/ui/label";
// 从自定义的 UI 组件库中导入 Textarea 组件，用于多行文本输入。
import { Textarea } from "../../components/ui/textarea";
// 导入自定义的 useLanguage 钩子，用于实现多语言功能。
import { useLanguage } from "../../components/LanguageProvider";
// 导入语言切换组件。
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
// 导入自定义的 useAuth 钩子，用于获取当前用户的认证状态和信息。
import { useAuth } from "../../context/AuthContext";
// 导入配置好的 axios 实例，用于发送 HTTP 请求。
import axios from "@/lib/axios";
// 从 "sonner" 库导入 toast 通知组件，用于显示美观的提示信息。
import { toast, Toaster } from "sonner";

// 定义表单数据接口，明确表单包含的字段和它们的类型。
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// 定义 ContactPage 组件，这是联系我们页面的主功能组件。
export default function ContactPage() {
  // 从 useLanguage 钩子获取 t 函数，用于翻译文本。
  const { t } = useLanguage();
  // 从 useAuth 钩子获取当前登录的用户信息。
  const { user } = useAuth();

  // 使用 useState 钩子创建表单数据的状态。
  // initialFormData 定义了表单的初始值，所有字段都为空字符串。
  const initialFormData: FormData = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // 使用 useState 钩子创建错误信息的状态，用于存储表单验证的错误。
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  // 使用 useState 钩子管理加载状态，防止用户在请求处理期间重复提交。
  const [isLoading, setIsLoading] = useState(false);

  // 使用 useEffect 钩子，当用户信息 (user) 发生变化时，自动填充表单中的姓名、邮箱和电话号码。
  useEffect(() => {
    // 检查用户是否存在，如果存在则更新表单数据。
    if (user) {
      setFormData((prevData) => ({
        ...prevData, // 保留其他字段（如 subject 和 message）的值
        name: user.name, // 设置用户姓名
        email: user.email, // 设置用户邮箱
        phone: user.phone_number || "", // 设置用户电话，如果不存在则为空字符串
      }));
    }
  }, [user]); // 这个 effect 的依赖数组是 [user]，所以只在 user 对象变化时执行。

  // 定义表单输入变化的处理函数。
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // 从事件目标中解构出输入字段的 name 和 value。
    const { name, value } = e.target;
    // 更新 formData 状态，使用计算属性名 [name] 来动态设置对应字段的值。
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 定义表单提交的处理函数。
  const handleSubmit = async (e: React.FormEvent) => {
    // 阻止表单的默认提交行为，防止页面刷新。
    e.preventDefault();

    // 创建一个新的错误对象。
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    // 验证姓名是否为空。
    if (!formData.name.trim()) newErrors.name = t('nameIsRequired');
    // 验证邮箱是否为空。
    if (!formData.email.trim()) {
      newErrors.email = t('emailIsRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      // 使用正则表达式验证邮箱格式是否正确。
      newErrors.email = t('emailIsInvalid');
    }
    // 验证主题是否为空。
    if (!formData.subject.trim()) newErrors.subject = t('subjectIsRequired');
    // 验证消息内容是否为空。
    if (!formData.message.trim()) newErrors.message = t('messageIsRequired');

    // 更新错误状态。
    setErrors(newErrors);

    // 检查 newErrors 对象中是否有任何错误。如果没有错误，则可以提交表单。
    if (Object.keys(newErrors).length === 0) {
      // 设置加载状态为 true，表示正在提交。
      setIsLoading(true);
      try {
        // 使用 axios 发送 POST 请求到后端的 /contact 接口。
        await axios.post("/contact", formData);
        // 如果请求成功，显示一个成功的 toast 通知。
        toast.success(t("Message Sent Successfully"));
        // 提交成功后，重置表单，但保留已登录用户的姓名、邮箱和电话。
        setFormData({
          ...initialFormData,
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone_number || "",
        });
        // 清空错误信息。
        setErrors({});
      } catch (error) {
        // 如果请求失败，显示一个错误的 toast 通知。
        toast.error(t("failed To Send Message"));
      } finally {
        // 无论成功还是失败，最后都将加载状态设置回 false。
        setIsLoading(false);
      }
    }
  };

  // 返回页面的 JSX 结构。
  return (
    <>
      {/* 主容器，设置最小高度和背景渐变色。 */}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        {/* 页面头部 */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 返回主页的链接 */}
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-black">
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </Button>
                </Link>
                {/* 页面标题 */}
                <h1 className="text-2xl font-bold text-white">{t("contact")}</h1>
              </div>
              {/* 语言切换组件 */}
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* Hero 区域，包含大标题和描述。 */}
        <section className="bg-gradient-to-r from-orange-100/30 to-amber-100/30 text-black py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">{t("contactUsHeroTitle")}</h2>
              <p className="text-lg md:text-xl text-black max-w-3xl mx-auto leading-relaxed">
                {t("contactUsHeroDesc")}
              </p>
            </div>
          </div>
        </section>

        {/* 主内容区域 */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* 联系信息区域 */}
          <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">{t("contactInfo")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 客服热线 */}
              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="bg-orange-500 p-3 rounded-full shadow-lg">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t("customerHotline")}</h4>
                  <p className="text-gray-700 font-medium">400-123-4567</p>
                  <p className="text-sm text-gray-500">{t("hotline24h")}</p>
                </div>
              </div>
              {/* 电子邮箱 */}
              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="bg-orange-500 p-3 rounded-full shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t("emailAddressLabel")}</h4>
                  <p className="text-gray-700 font-medium">service@fooddelivery.com</p>
                  <p className="text-sm text-gray-500">{t("replyWithin24h")}</p>
                </div>
              </div>
              {/* 门店地址 */}
              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="bg-orange-500 p-3 rounded-full shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t("storeAddress")}</h4>
                  <p className="text-gray-700 font-medium">北京市朝阳区三里屯街道工体北路8号</p>
                  <p className="text-sm text-gray-500">{t("welcomeToStore")}</p>
                </div>
              </div>
              {/* 营业时间 */}
              <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <div className="bg-orange-500 p-3 rounded-full shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{t("businessHours")}</h4>
                  <p className="text-gray-700 font-medium">{t("mondayToSunday")}</p>
                  <p className="text-sm text-gray-500">9:00 - 23:00</p>
                </div>
              </div>
            </div>
          </section>

          {/* 地图和联系表单的网格布局 */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 谷歌地图区域 */}
            <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 flex flex-col">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-white text-center">{t("storeLocation")}</h3>
              </div>
              <div className="h-96 lg:flex-grow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.98823492404069!3d40.75889497138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1696234567890!5m2!1sen!2sus"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </section>

            {/* 联系表单区域 */}
            <section className="bg-white rounded-2xl shadow-xl border border-orange-100">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-white text-center">{t("sendMessage")}</h3>
              </div>
              <div className="p-6 md:p-8">
                {/* 表单元素，提交时调用 handleSubmit 函数 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* 姓名输入框 */}
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">{t("fullName")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("enterYourName")}
                        required
                        className={`mt-1 focus:ring-2 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`}
                      />
                      {/* 如果存在姓名错误，则显示错误信息 */}
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    {/* 电话号码输入框 */}
                    <div>
                      <Label htmlFor="phone" className="text-gray-700 font-medium">{t("phoneNumber")}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t("enterPhoneNumber")}
                        className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                      />
                    </div>
                  </div>

                  {/* 邮箱输入框 */}
                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">{t("emailAddressLabel")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("enterEmailAddress")}
                      required
                      className={`mt-1 focus:ring-2 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`}
                    />
                    {/* 如果存在邮箱错误，则显示错误信息 */}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* 主题输入框 */}
                  <div>
                    <Label htmlFor="subject" className="text-gray-700 font-medium">{t("subject")}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("enterMessageSubject")}
                      required
                      className={`mt-1 focus:ring-2 ${errors.subject ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`}
                    />
                    {/* 如果存在主题错误，则显示错误信息 */}
                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                  </div>

                  {/* 消息内容输入框 */}
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">{t("messageContent")}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("describeYourIssue")}
                      rows={6}
                      required
                      className={`mt-1 focus:ring-2 ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`}
                    />
                    {/* 如果存在消息内容错误，则显示错误信息 */}
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                  </div>

                  {/* 提交按钮 */}
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" disabled={isLoading}>
                    <Send className="mr-2 h-5 w-5" />
                    {/* 根据 isLoading 状态显示不同文本 */}
                    {isLoading ? t("sending") : t("sendMessageButton")}
                  </Button>
                </form>
              </div>
            </section>
          </div>

          {/* 常见问题解答区域 */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 mt-8">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <h3 className="text-xl md:text-2xl font-bold text-white text-center">{t("faq")}</h3>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{t("deliveryRangeQ")}</h4>
                  <p className="text-gray-600 text-sm">{t("deliveryRangeA")}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{t("deliveryTimeQ")}</h4>
                  <p className="text-gray-600 text-sm">{t("deliveryTimeA")}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{t("paymentMethodsQ")}</h4>
                  <p className="text-gray-600 text-sm">{t("paymentMethodsA")}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{t("refundPolicyQ")}</h4>
                  <p className="text-gray-600 text-sm">{t("refundPolicyA")}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}