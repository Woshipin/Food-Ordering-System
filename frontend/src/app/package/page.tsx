"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Users } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"

export default function PackagesPage() {
  const { t } = useLanguage()
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({})

  const packages = [
    {
      id: 1,
      name: t("familyPackageA"),
      price: 88.0,
      originalPrice: 120.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 156,
      description: t("familyPackageADesc"),
      serves: t("serves3_4"),
      items: [t("beefNoodlesX2"), t("dumplingsX1"), t("hotAndSourSoupX1"), t("orangeJuiceX2")],
      discount: "27% OFF",
      isPopular: true,
    },
    {
      id: 2,
      name: t("couplesPackage"),
      price: 58.0,
      originalPrice: 75.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.9,
      reviews: 89,
      description: t("couplesPackageDesc"),
      serves: t("serves2"),
      items: [t("hotPotX1"), t("dumplingsX1"), t("tiramisuX2"), t("redWineX1")],
      discount: "23% OFF",
      isNew: true,
    },
    {
      id: 3,
      name: t("businessLunch"),
      price: 35.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 234,
      description: t("businessLunchDesc"),
      serves: t("serves1"),
      items: [t("beefNoodlesX1"), t("appetizerPlatterX1"), t("greenTeaX1")],
      cookTime: t("cookTime15"),
    },
    {
      id: 4,
      name: t("vegetarianPackage"),
      price: 42.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.6,
      reviews: 67,
      description: t("vegetarianPackageDesc"),
      serves: t("serves1_2"),
      items: [t("vegetarianPlatterX1"), t("vegetableSoupX1"), t("soybeanMilkX1"), t("fruitSaladX1")],
      isVegetarian: true,
    },
    {
      id: 5,
      name: t("partyFeast"),
      price: 168.0,
      originalPrice: 220.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 123,
      description: t("partyFeastDesc"),
      serves: t("serves6_8"),
      items: [t("beefNoodlesX3"), t("hotPotX2"), t("dumplingsX2"), t("assortedAppetizersX4"), t("drinksX6")],
      discount: "24% OFF",
    },
    {
      id: 6,
      name: t("kidsMeal"),
      price: 25.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.5,
      reviews: 45,
      description: t("kidsMealDesc"),
      serves: t("serves1"),
      items: [t("kidsNoodlesX1"), t("wontonX1"), t("milkX1"), t("smallCakeX1")],
      isKidFriendly: true,
    },
    {
      id: 7,
      name: t("officeLunch"),
      price: 128.0,
      originalPrice: 160.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 78,
      description: t("officeLunchDesc"),
      serves: t("serves5_6"),
      items: [t("beefNoodlesX3"), t("dumplingsX2"), t("appetizersX3"), t("drinksX5")],
      discount: "20% OFF",
    },
    {
      id: 8,
      name: t("studentSpecial"),
      price: 18.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.4,
      reviews: 156,
      description: t("studentSpecialDesc"),
      serves: t("serves1"),
      items: [t("plainBeefNoodlesX1"), t("appetizerX1"), t("soupX1")],
      isStudentSpecial: true,
    },
  ]

  const addToCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }))
  }

  const removeFromCart = (itemId: number) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }))
  }

  const totalCartItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">{t("packages")}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Link href="/cart">
                <Button className="relative bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{t("cart")}</span>
                  {totalCartItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">
                      {totalCartItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-100">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("featuredPackages")}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("featuredPackagesDesc")}
            </p>
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("packageSelection")}</h3>
          
          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100"
              >
                {/* Image Section */}
                <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Users className="h-3 w-3 inline mr-1" />
                      {pkg.serves}
                    </span>
                  </div>
                  <Link href={`/packages/${pkg.id}`}>
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      <Image
                        src={pkg.image || "/placeholder.svg"}
                        alt={pkg.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
                      />
                    </div>
                  </Link>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 truncate">{pkg.name}</h4>
                    <span className="text-lg font-bold text-orange-500 ml-2">¥{pkg.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{pkg.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-700 mb-1">{t("packageIncludes")}:</h5>
                    <div className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">{pkg.items.join(" • ")}</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                      <span>{pkg.rating}</span>
                    </div>
                    <span>
                      ({pkg.reviews} {t("reviews")})
                    </span>
                  </div>
                  
                  {cartItems[pkg.id] > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                          onClick={() => removeFromCart(pkg.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-lg min-w-[30px] text-center">{cartItems[pkg.id]}</span>
                        <button
                          className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                          onClick={() => addToCart(pkg.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-500">{t("subtotalPrice")} ¥{(pkg.price * cartItems[pkg.id]).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                      onClick={() => addToCart(pkg.id)}
                    >
                      {t("addToCart")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg p-8 border border-orange-200">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">{t("packageAdvantages")}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("betterPrice")}</h4>
              <p className="text-sm text-gray-600">{t("betterPriceDesc")}</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("nutritionalBalance")}</h4>
              <p className="text-sm text-gray-600">{t("nutritionalBalanceDesc")}</p>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2 text-gray-900">{t("convenientChoice")}</h4>
              <p className="text-sm text-gray-600">{t("convenientChoiceDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Link href="/cart">
            <Button className="rounded-full h-14 w-14 bg-orange-500 hover:bg-orange-600 shadow-lg">
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {totalCartItems}
              </Badge>
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}