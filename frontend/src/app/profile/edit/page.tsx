"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, Save, X, Phone } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label" 
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { useLanguage } from "../../../components/LanguageProvider"
import { LanguageSwitcher } from "../../../components/LanguageSwitcher"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import { toast, Toaster } from "sonner"

export default function EditProfilePage() {
  const { t } = useLanguage()
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    user_image: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone_number: user.phone_number || "",
        user_image: user.user_image || "",
      })
    }
  }, [user])

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.put("/user/profile", formData)
      setUser(response.data.user)
      toast.success(t("profileUpdatedSuccessfully"))
      setTimeout(() => {
        window.location.href = "/profile"
      }, 1500)
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err.join(" "))
        })
      } else {
        toast.error(t("profileUpdateFailed"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          user_image: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t("editProfile")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t("editProfile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.user_image || "/placeholder.svg"} alt={formData.name} />
                    <AvatarFallback className="text-2xl">{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">{t("changePhoto")}</p>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入姓名"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="请输入邮箱"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t("phoneNumber")} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder={t("phoneNumberPlaceholder")}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? t("loading") : t("saveChanges")}
                </Button>
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    <X className="mr-2 h-4 w-4" />
                    {t("cancel")}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>账户安全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">修改密码</div>
                <div className="text-sm text-gray-500">定期更换密码保护账户安全</div>
              </div>
              <Button variant="outline" size="sm">
                修改
              </Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium">双重验证</div>
                <div className="text-sm text-gray-500">增强账户安全性</div>
              </div>
              <Button variant="outline" size="sm">
                设置
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">注销账户</div>
                <div className="text-sm text-gray-500">永久删除您的账户和所有数据</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              >
                注销
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  )
}
