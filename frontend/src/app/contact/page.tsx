"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { Button } from "../../components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">{t("contact")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Contact Information Section - Full Width */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100 mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">{t("contactInfo")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Google Map Section - CORRECTED */}
          <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100 flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-xl md:text-2xl font-bold text-white text-center">{t("storeLocation")}</h3>
            </div>
            {/*
              This container ensures the map fills the available space correctly.
              On mobile (<lg), it has a fixed height.
              On desktop (lg+), it grows to match the height of the adjacent form.
            */}
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

          {/* Contact Form Section */}
          <section className="bg-white rounded-2xl shadow-xl border border-orange-100">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-xl md:text-2xl font-bold text-white text-center">{t("sendMessage")}</h3>
            </div>
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">{t("fullName")}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("enterYourName")}
                      required
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">{t("phoneNumber")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("enterPhoneNumber")}
                      className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

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
                    className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-700 font-medium">{t("subject")}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t("enterMessageSubject")}
                    required
                    className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

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
                    className="mt-1 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Send className="mr-2 h-5 w-5" />
                  {t("sendMessageButton")}
                </Button>
              </form>
            </div>
          </section>
        </div>

        {/* FAQ Section - Full Width */}
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
  )
}