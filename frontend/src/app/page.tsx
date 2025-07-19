"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Star, Clock, MapPin, Phone, ShoppingCart, ChefHat, Truck, Menu, X, Globe, Plus, Minus, User, LogOut } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { useLanguage } from "../components/LanguageProvider"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { ClipLoader } from "react-spinners"
import { useLogout } from "@/hooks/useLogout"

export default function HomePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { handleLogout, isLoggingOut } = useLogout()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [itemStock, setItemStock] = useState<Record<number, number>>({})

  useEffect(() => {
    const stock: Record<number, number> = {}
    featuredItems.forEach((item) => {
      stock[item.id] = Math.floor(Math.random() * 15) + 5
    })
    setItemStock(stock)
  }, [])
  
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({})

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

  const featuredItems = [
    {
      id: 1,
      name: t("signatureBeefNoodles") || "招牌牛肉面",
      price: 28.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 156,
      description: t("beefNoodlesDesc") || "精选优质牛肉，手工拉面，浓郁汤底",
    },
    {
      id: 2,
      name: t("spicyHotPot") || "麻辣香锅",
      price: 32.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 89,
      description: t("hotPotDesc") || "新鲜蔬菜配香辣调料，口感丰富",
    },
    {
      id: 3,
      name: t("steamedDumplings") || "蒸饺套餐",
      price: 18.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.9,
      reviews: 234,
      description: t("dumplingsDesc") || "手工包制，皮薄馅大，营养丰富",
    },
    {
      id: 4,
      name: t("braisedPork") || "红烧肉",
      price: 35.0,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 98,
      description: t("braisedPorkDesc") || "肥而不腻，入口即化，家的味道",
    },
  ]

  const categories = [
    { name: t("main"), icon: "🍜", count: 25 },
    { name: t("appetizer"), icon: "🥟", count: 18 },
    { name: t("beverage"), icon: "🥤", count: 12 },
    { name: t("dessert"), icon: "🍰", count: 8 },
    { name: t("package"), icon: "🍱", count: 6 },
    { name: t("vegetarianFood"), icon: "🥗", count: 15 },
  ]

  const navItems = [
    { href: "/menu", label: t("menu") || "Menu" },
    { href: "/package", label: t("packages") || "Packages" },
    { href: "/gallery", label: t("gallery") || "Gallery" },
    { href: "/about", label: t("about") || "About Us" },
    { href: "/contact", label: t("contact") || "Contact" },
  ]

  const isActiveRoute = (href: string): boolean => {
    return pathname === href
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-2xl">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border-2 border-white/50 shadow-lg">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white truncate">
                {t("heroTitle") || "Delicious Food"}
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex justify-center flex-1 mx-4">
              <nav className="flex items-center space-x-1 lg:space-x-2 bg-white/10 backdrop-blur-md rounded-2xl p-1 border-2 border-white/30 shadow-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 lg:px-4 xl:px-5 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-medium transition-all duration-300 whitespace-nowrap ${
                      isActiveRoute(item.href)
                        ? "bg-white text-orange-600 shadow-lg transform scale-105"
                        : "text-white hover:bg-white/20 hover:shadow-md hover:scale-105"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden xl:flex items-center space-x-2 lg:space-x-3">
              {user ? (
                <>
                  <LanguageSwitcher />
                  <Link href="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">
                        3
                      </Badge>
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <User className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {isLoggingOut ? <ClipLoader size={24} color={"#fff"} /> : <LogOut className="h-6 w-6" />}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      {t("register")}
                    </Button>
                  </Link>
                  <LanguageSwitcher />
                  <Link href="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-2 border-white/50 rounded-xl h-11 w-11 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-lg">
                        3
                      </Badge>
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="flex xl:hidden items-center space-x-2">
                <LanguageSwitcher />
                <Link href="/cart">
                    <Button variant="ghost" size="icon" className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/50 rounded-xl h-10 w-10">
                        <ShoppingCart className="h-5 w-5" />
                        <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white border-2 border-white shadow-md">
                            3
                        </Badge>
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/50 rounded-xl h-10 w-10" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 h-auto bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 p-4 pb-8 shadow-xl rounded-b-3xl xl:hidden">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/50 shadow-lg">
                  <ChefHat className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Delicious Food</h1>
              </Link>
              <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/50 rounded-xl h-10 w-10" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
    
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/30 shadow-lg mb-6">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 rounded-xl text-lg font-medium text-white hover:bg-white/20 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
    
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link href="/profile" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("profile")}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 w-full bg-white text-orange-600 hover:bg-orange-50 shadow-lg text-base h-12 font-medium rounded-xl"
                  >
                    {isLoggingOut ? <ClipLoader size={24} color={"#f97316"} /> : t("logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-white/10 backdrop-blur-md text-white border-2 border-white/50 hover:bg-white hover:text-orange-600 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("login") || "Login"}
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 shadow-lg text-base h-12 font-medium rounded-xl">
                      {t("register") || "Register"}
                    </Button>
                  </Link>
                </>
              )}
            </div>
        </div>
      )}

      <div className="pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none text-center">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6">
                {t("heroTitle")}
                <span className="text-orange-500 block">{t("heroSubtitle")}</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto">
                {t("heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/menu">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-base sm:text-lg lg:text-xl px-8 sm:px-10 py-4 sm:py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    {t("orderNow")}
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg lg:text-xl px-8 sm:px-10 py-4 sm:py-6 bg-white/80 backdrop-blur-sm border-2 border-orange-500 text-orange-600 hover:bg-orange-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {t("viewMenu")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">1000+</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{t("satisfiedCustomers")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">30{t("minutes")}</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{t("avgDelivery")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">4.8★</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{t("userRating")}</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-3xl shadow-lg">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-2">24/7</div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">{t("allDayService")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">{t("popularCategories")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {categories.map((category, index) => (
                <Link href={`/menu?category=${index}`} key={index}>
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 rounded-2xl h-32 sm:h-36 lg:h-40 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 p-0">
                    <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                      <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base lg:text-lg">{category.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">{category.count} 道菜</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Items Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-orange-50 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{t("todaySpecial")}</h3>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">{t("todaySpecialDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {featuredItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border-orange-100 p-0"
                >
                  <div className="relative h-56 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                    <div className="absolute top-3 right-3 z-10">
                      {itemStock[item.id] && (
                        <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                          {t("onlyLeft") || "Only"} {itemStock[item.id]} {t("vibesLeft") || "left"}
                        </span>
                      )}
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
                  <CardContent className="p-4">
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
                        ({item.reviews} {t("reviews") || "reviews"})
                      </span>
                    </div>
                    {cartItems[item.id] > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Remove one item"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold text-lg min-w-[30px] text-center" aria-live="polite">{cartItems[item.id]}</span>
                          <button
                            className="w-9 h-9 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all"
                            onClick={() => addToCart(item.id)}
                             aria-label="Add one item"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-center">
                          <span className="text-sm text-gray-500">{t("subtotalPrice") || 'Subtotal'}: ¥{(item.price * cartItems[item.id]).toFixed(2)}</span>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">{t("whyChooseUs")}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Truck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{t("fastDelivery")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{t("fastDeliveryDesc")}</p>
              </Card>
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{t("qualityIngredients")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{t("qualityIngredientsDesc")}</p>
              </Card>
              <Card className="text-center p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 rounded-3xl sm:col-span-2 lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">{t("qualityGuarantee")}</h4>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{t("qualityGuaranteeDesc")}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* ===== CONTACT INFO SECTION: UPDATED STYLES ===== */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-900 to-black text-white px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white
               shadow-lg shadow-white/5">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{t("businessHours")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">{t("mondayToSunday")}</p>
              </div>
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white shadow-lg">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{t("orderHotline")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">400-123-4567</p>
              </div>
              <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white shadow-lg sm:col-span-2 lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-500 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{t("deliveryRange")}</h4>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg">{t("freeDeliveryRange")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
          <div className="w-full max-w-none text-center">
            <Link href="/" className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl shadow-lg">
                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{t("heroTitle")}</span>
            </Link>
            <p className="text-gray-400 mb-6 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">{t("footerSlogan")}</p>
            <div className="flex justify-center space-x-6 sm:space-x-8 text-sm sm:text-base text-gray-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
                {t("privacyPolicy")}
              </Link>
              <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
                {t("termsOfService")}
              </Link>
              <Link href="/" className="hover:text-white transition-colors hover:scale-105 duration-300">
                {t("helpCenter")}
              </Link>
            </div>
            <div className="pt-6 border-t border-gray-700 text-sm sm:text-base text-gray-400">
              © 2024 {t("heroTitle")}. {t("allRightsReserved")}.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}