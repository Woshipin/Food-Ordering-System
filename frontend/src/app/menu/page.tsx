"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, Star, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"

export default function MenuPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({})

  const categories = [
    { id: "all", name: t("all"), count: 84 },
    { id: "main", name: t("main"), count: 25 },
    { id: "appetizer", name: t("appetizer"), count: 18 },
    { id: "beverage", name: t("beverage"), count: 12 },
    { id: "dessert", name: t("dessert"), count: 8 },
    { id: "package", name: t("package"), count: 6 },
    { id: "vegetarian", name: t("vegetarianFood"), count: 15 },
  ]

  const menuItems = [
    {
      id: 1,
      name: t("signatureBeefNoodles"),
      price: 28.0,
      originalPrice: 35.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 156,
      description: t("beefNoodlesDesc"),
      category: "main",
      isPopular: true,
      isSpicy: true,
      cookTime: t("cookTime15_20"),
    },
    {
      id: 2,
      name: t("spicyHotPot"),
      price: 32.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 89,
      description: t("hotPotDesc"),
      category: "main",
      isNew: true,
      isSpicy: true,
      cookTime: t("cookTime20_25"),
    },
    {
      id: 3,
      name: t("steamedDumplings"),
      price: 18.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.9,
      reviews: 234,
      description: t("dumplingsDesc"),
      category: "appetizer",
      cookTime: t("cookTime10_15"),
    },
    {
      id: 4,
      name: t("freshOrangeJuice"),
      price: 12.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.6,
      reviews: 67,
      description: t("orangeJuiceDesc"),
      category: "beverage",
      cookTime: t("cookTime5"),
    },
    {
      id: 5,
      name: t("tiramisu"),
      price: 25.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 123,
      description: t("tiramisuDesc"),
      category: "dessert",
      cookTime: t("readyToEat"),
    },
    {
      id: 6,
      name: t("vegetarianPlatter"),
      price: 22.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.5,
      reviews: 45,
      description: t("vegetarianPlatterDesc"),
      category: "vegetarian",
      isVegetarian: true,
      cookTime: t("cookTime15"),
    },
    {
      id: 7,
      name: t("braisedPork"),
      price: 35.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 98,
      description: t("braisedPorkDesc"),
      category: "main",
      cookTime: t("cookTime25_30"),
    },
    {
      id: 8,
      name: t("cucumberSalad"),
      price: 8.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.3,
      reviews: 56,
      description: t("cucumberSaladDesc"),
      category: "appetizer",
      cookTime: t("cookTime5"),
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

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
              <h1 className="text-2xl font-bold text-white">{t("menu")}</h1>
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
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 border-orange-200 focus:border-orange-400">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Category Tabs Section */}
        <div className="mb-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg p-6 border border-orange-200">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-white/80 backdrop-blur-sm">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="text-xs md:text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Menu Items Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {selectedCategory === "all" ? t("allDishes") : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-orange-100"
              >
                {/* Image Section */}
                <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      {t("onlyLeft")} {Math.floor(Math.random() * 15) + 1} {t("vibesLeft")}
                    </span>
                  </div>
                  <Link href={`/menu/${item.id}`}>
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
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
                    <h4 className="text-lg font-bold text-gray-900 truncate">{item.name}</h4>
                    <span className="text-lg font-bold text-orange-500 ml-2">¥{item.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-current text-yellow-500 mr-1" />
                      <span>{item.rating}</span>
                    </div>
                    <span>
                      ({item.reviews} {t("reviews")})
                    </span>
                  </div>
                  {cartItems[item.id] > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-lg min-w-[30px] text-center">{cartItems[item.id]}</span>
                        <button
                          className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                          onClick={() => addToCart(item.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-500">{t("subtotalPrice")} ¥{(item.price * cartItems[item.id]).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-2.5 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
                      onClick={() => addToCart(item.id)}
                    >
                      {t("addToCart")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">{t("noDishesFound")}</div>
              <p className="text-gray-500">{t("tryOtherKeywords")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <Button className="rounded-full h-14 w-14 bg-orange-500 hover:bg-orange-600 shadow-lg">
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {totalCartItems}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  )
}