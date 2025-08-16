"use client";
/**
 * =====================================================================================
 * @file        page.tsx
 * @brief       “联系我们”页面组件
 * @details
 *              该页面提供了多种联系方式，包括联系信息卡片、地理位置地图、
 *              一个在线留言表单以及常见问题解答(FAQ)。
 *              所有文本内容均通过API从后端CMS动态获取，并支持多语言。
 *
 * @purpose     1.  **信息提供**: 清晰地向用户展示所有联系方式。
 *              2.  **用户反馈**: 通过联系表单收集用户的咨询、建议或问题。
 *              3.  **问题解答**: 通过FAQ减少重复性咨询，提高用户自助解决问题的效率。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

// --- 核心依赖导入 (Core Dependencies) ---
import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

// --- UI组件和图标导入 (UI Components & Icons) ---
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { toast, Toaster } from "sonner";

// --- 自定义Hooks和上下文 (Custom Hooks & Context) ---
import { useLanguage } from "../../components/LanguageProvider";
import { useAuth } from "../../context/AuthContext";

// --- 数据和类型导入 (Data & Types) ---
import axios from "@/lib/axios";
import { FormData, ContactData } from "./lib/types"; // [优化] 从分离的文件导入类型

/**
 * @component ContactPage
 * @brief     “联系我们”页面的根组件
 */
export default function ContactPage() {
  // --- Hooks ---
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // --- 状态管理 (State Management) ---
  // 存储从后端获取的“联系我们”页面的CMS数据
  const [contactData, setContactData] = useState<ContactData | null>(null);
  // 表单的初始状态
  const initialFormData: FormData = { name: "", email: "", phone: "", subject: "", message: "" };
  // 存储当前表单数据
  const [formData, setFormData] = useState<FormData>(initialFormData);
  // 存储表单字段的验证错误信息
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  // 标记表单是否正在提交中
  const [isLoading, setIsLoading] = useState(false);

  // --- 数据获取 (Data Fetching) ---
  /**
   * @effect fetchContactData
   * @brief  当语言 `language` 改变时，从后端API获取“联系我们”页面的CMS数据。
   */
  useEffect(() => {
    const fetchContactData = async () => {
        try {
            const response = await axios.get(`/cms/contact?lang=${language}`);
            setContactData(response.data);
        } catch (error) {
            console.error("获取联系我们页面数据失败:", error);
        }
    };
    fetchContactData();
  }, [language]);

  // --- 副作用 (Side Effects) ---
  /**
   * @effect prefillFormWithUserData
   * @brief  如果用户已登录，则使用用户的姓名、邮箱和电话预填写表单。
   */
  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.name,
        email: user.email,
        phone: user.phone_number || "",
      }));
    }
  }, [user]); // 依赖于 user 对象

  // --- 事件处理 (Event Handlers) ---
  /**
   * @function handleChange
   * @brief  处理输入框和文本域的变化，更新表单状态。
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * @function handleSubmit
   * @brief  处理表单提交事件，包括前端验证和API调用。
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止表单默认的刷新页面行为
    
    // --- 前端验证 ---
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = t('nameIsRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('emailIsRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailIsInvalid');
    }
    if (!formData.subject.trim()) newErrors.subject = t('subjectIsRequired');
    if (!formData.message.trim()) newErrors.message = t('messageIsRequired');
    setErrors(newErrors);

    // --- API调用 ---
    // 如果没有验证错误
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true); // 开始加载状态
      try {
        // 发送POST请求到 /api/contact
        await axios.post("/contact", formData);
        toast.success(t("Message Sent Successfully")); // 显示成功提示
        // 提交成功后，重置表单（保留用户信息）
        setFormData({
          ...initialFormData,
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone_number || "",
        });
        setErrors({}); // 清空错误
      } catch (error) {
        toast.error(t("failed To Send Message")); // 显示失败提示
      } finally {
        setIsLoading(false); // 结束加载状态
      }
    }
  };

  // --- 辅助渲染函数 (Render Helpers) ---
  /**
   * @function renderIcon
   * @brief  根据传入的类型字符串，返回对应的Lucide图标组件。
   * @param  {string} type - 图标类型 ('phone', 'email', 'address', 'hours')
   * @returns {React.ReactNode} 对应的图标组件或null
   */
  const renderIcon = (type: string) => {
    switch (type) {
        case 'phone': return <Phone className="h-6 w-6 text-white" />;
        case 'email': return <Mail className="h-6 w-6 text-white" />;
        case 'address': return <MapPin className="h-6 w-6 text-white" />;
        case 'hours': return <Clock className="h-6 w-6 text-white" />;
        default: return null;
    }
  };

  /**
   * @function extractMapSrc
   * @brief  从完整的iframe HTML字符串中安全地提取 'src' 属性。
   * @param  {string | undefined} iframeHtml - 包含iframe的HTML字符串
   * @returns {string} 提取出的URL，如果失败则返回一个默认的地图URL
   */
  const extractMapSrc = (iframeHtml: string | undefined): string => {
    if (!iframeHtml) {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.98823492404069!3d40.75889497138558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1696234567890!5m2!1sen!2sus";
    }
    const match = iframeHtml.match(/src="([^"]+)"/);
    return match ? match[1] : "about:blank"; // 如果匹配失败，返回空白页以防出错
  };

  // --- 渲染逻辑 (Render Logic) ---
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        {/* ==================== 页头 (Header) ==================== */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-black/10">
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-white">{t("contact")}</h1>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* ==================== 页面主体内容 (Main Content) ==================== */}
        <main>
          {/* --- 英雄区 (Hero Section) --- */}
          <section className="bg-gradient-to-r from-orange-100/30 to-amber-100/30 text-black py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">{contactData?.hero_title || t("contactUsHeroTitle")}</h2>
                <p className="text-lg md:text-xl text-black max-w-3xl mx-auto leading-relaxed">
                  {contactData?.hero_description || t("contactUsHeroDesc")}
                </p>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12">
            {/* --- 联系信息 (Contact Info Section) --- */}
            <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">{contactData?.contact_info_title || t("contactInfo")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(contactData?.contact_info || []).map((info, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                    <div className="bg-orange-500 p-3 rounded-full shadow-lg">
                      {renderIcon(info.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{info.title}</h4>
                      <p className="text-gray-700 font-medium">{info.details}</p>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* --- 地图位置 (Map Location Section) --- */}
              <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 flex flex-col">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white text-center">{contactData?.store_location_title || t("storeLocation")}</h3>
                </div>
                <div className="h-96 lg:flex-grow">
                  <iframe
                    src={extractMapSrc(contactData?.map_url)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>

              {/* --- 在线留言 (Send Message Section) --- */}
              <section className="bg-white rounded-2xl shadow-xl border border-orange-100">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white text-center">{contactData?.send_message_title || t("sendMessage")}</h3>
                </div>
                <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">{contactData?.form_name_label || t("fullName")}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder={contactData?.form_name_placeholder || t("enterYourName")} required className={`mt-1 focus:ring-2 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`} />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-gray-700 font-medium">{contactData?.form_phone_label || t("phoneNumber")}</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={contactData?.form_phone_placeholder || t("enterPhoneNumber")} className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">{contactData?.form_email_label || t("emailAddressLabel")}</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={contactData?.form_email_placeholder || t("enterEmailAddress")} required className={`mt-1 focus:ring-2 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`} />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-medium">{contactData?.form_subject_label || t("subject")}</Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder={contactData?.form_subject_placeholder || t("enterMessageSubject")} required className={`mt-1 focus:ring-2 ${errors.subject ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`} />
                      {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-gray-700 font-medium">{contactData?.form_message_label || t("messageContent")}</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder={contactData?.form_message_placeholder || t("describeYourIssue")} rows={6} required className={`mt-1 focus:ring-2 ${errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-orange-200 focus:border-orange-500 focus:ring-orange-200"}`} />
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" disabled={isLoading}>
                      <Send className="mr-2 h-5 w-5" />
                      {isLoading ? t("sending") : (contactData?.form_submit_button || t("sendMessageButton"))}
                    </Button>
                  </form>
                </div>
              </section>
            </div>

            {/* --- 常见问题 (FAQ Section) --- */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 mt-8">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-white text-center">{contactData?.faq_title || t("faq")}</h3>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {(contactData?.faqs || []).map((faq, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      {/* `Toaster` 用于显示 `toast` 消息 */}
      <Toaster />
    </>
  );
}