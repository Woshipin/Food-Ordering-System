"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart, Clock } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { useLanguage } from "../../../components/LanguageProvider"
import { LanguageSwitcher } from "../../../components/LanguageSwitcher"

export default function MenuDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("regular")

  // Mock data - in real app, fetch based on params.id
  const menuItem = {
    id: Number.parseInt(params.id),
    name: t("signatureBeefNoodles"),
    price: 28.0,
    originalPrice: 35.0,
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600&text=Image2",
      "/placeholder.svg?height=400&width=600&text=Image3",
    ],
    rating: 4.8,
    reviews: 156,
    description: t("beefNoodlesDetailDesc"),
    ingredients: [t("beef"), t("handPulledNoodles"), t("vegetables"), t("coriander"), t("specialBroth")],
    allergens: [t("gluten"), t("soy")],
    nutritionInfo: {
      calories: 580,
      protein: "32g",
      carbs: "65g",
      fat: "18g",
    },
    cookTime: t("cookTime15_20"),
    category: "main",
    isPopular: true,
    isSpicy: true,
    sizes: [
      { name: t("smallPortion"), price: 28.0 },
      { name: t("largePortion"), price: 35.0 },
    ],
    recommendations: [
      {
        id: 2,
        name: t("spicyHotPot"),
        price: 32.0,
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.7,
      },
      {
        id: 3,
        name: t("steamedDumplings"),
        price: 18.0,
        image: "/placeholder.svg?height=200&width=300",
        rating: 4.9,
      },
    ],
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const addToCart = () => {
    console.log(`Added ${quantity} x ${menuItem.name} (${selectedSize}) to cart`)
  }

  const totalPrice = selectedSize === "regular" ? menuItem.price * quantity : menuItem.sizes[1].price * quantity

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/menu">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t("menuDetail")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={menuItem.images[currentImageIndex] || "/placeholder.svg"}
                alt={menuItem.name}
                fill
                className="object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {menuItem.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    currentImageIndex === index ? "border-orange-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${menuItem.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{menuItem.name}</h1>
                <div className="flex gap-2">
                  {menuItem.isPopular && <Badge className="bg-red-500 hover:bg-red-600">{t("popular")}</Badge>}
                  {menuItem.isSpicy && <Badge className="bg-red-600 hover:bg-red-700">🌶️ {t("spicy")}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="ml-1 font-semibold">{menuItem.rating}</span>
                </div>
                <span className="text-gray-600">({menuItem.reviews} {t("reviews")})</span>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{menuItem.cookTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-orange-500">¥{menuItem.price}</span>
                {menuItem.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">¥{menuItem.originalPrice}</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("productDescription")}</h3>
              <p className="text-gray-600 leading-relaxed">{menuItem.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("selectSize")}</h3>
              <div className="grid grid-cols-2 gap-3">
                {menuItem.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(index === 0 ? "regular" : "large")}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedSize === (index === 0 ? "regular" : "large")
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-orange-500 font-bold">¥{size.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">{t("quantity")}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 rounded-lg bg-transparent"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-xl min-w-[40px] text-center">{quantity}</span>
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-orange-500 hover:bg-orange-600 rounded-lg"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">{t("totalPrice")}: ¥{totalPrice.toFixed(2)}</div>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6 rounded-xl" onClick={addToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t("addToCart")} ¥{totalPrice.toFixed(2)}
              </Button>
            </div>

            {/* Nutrition Info */}
            <Card className="rounded-xl">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">{t("nutritionInfo")}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t("calories")}</span>
                    <div className="font-semibold">{menuItem.nutritionInfo.calories} {t("caloriesUnit")}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t("protein")}</span>
                    <div className="font-semibold">{menuItem.nutritionInfo.protein}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t("carbs")}</span>
                    <div className="font-semibold">{menuItem.nutritionInfo.carbs}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t("fat")}</span>
                    <div className="font-semibold">{menuItem.nutritionInfo.fat}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t("recommendedDishes")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItem.recommendations.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 rounded-xl h-64"
              >
                <Link href={`/menu/${item.id}`} className="block">
                  <div className="h-32 relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={300}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <CardContent className="p-3 h-32 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-1">{item.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-500">¥{item.price}</span>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-lg">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
