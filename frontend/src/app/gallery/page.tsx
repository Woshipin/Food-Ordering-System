"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, X, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
// 1. 从 dialog 组件中导入 DialogTitle
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog"
import { useLanguage } from "../../components/LanguageProvider"
import { LanguageSwitcher } from "../../components/LanguageSwitcher"
import axios from "../../lib/axios"

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  title: string;
  description: string;
}

export default function GalleryPage() {
  const { t } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGalleryImages = async () => {
      setLoading(true)
      try {
        const response = await axios.get("/galleries")
        if (Array.isArray(response.data.data)) {
          const formattedImages = response.data.data.map((item: any) => ({
            id: item.id,
            src: `http://127.0.0.1:8000/storage/${item.image}`,
            alt: item.title,
            category: item.category,
            title: item.title,
            description: item.description,
          }))
          setGalleryImages(formattedImages)
        }
      } catch (error) {
        console.error("Failed to fetch gallery images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGalleryImages()
  }, [])

  const categories = [
    { id: "all", name: t("all") },
    { id: "dishes", name: t("signatureDishes") },
    { id: "packages", name: t("packageCombos") },
    { id: "restaurant", name: t("restaurantEnvironment") },
    { id: "kitchen", name: t("kitchenProduction") },
  ]

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((image) => image.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white bg-clip-text">
                {t("galleryPageTitle")}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Category Filter Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-orange-100/50 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 font-medium transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200 transform scale-105" 
                    : "bg-white/80 hover:bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300 hover:shadow-md"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized // Add this if you are using external image URLs with Next.js Image component and don't have them configured in next.config.js
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Corner Accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-2xl" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                        {image.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {image.description}
                      </p>
                    </div>
                    
                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-200 transition-all duration-300" />
                    
                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredImages.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="text-orange-400 text-2xl mb-4">🍽️</div>
                  <div className="text-gray-600 text-lg mb-2 font-medium">{t("noImages")}</div>
                  <p className="text-gray-500">{t("noImagesDesc")}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          {/* 2. 为 accessibility 添加一个视觉上隐藏的标题 */}
          <DialogTitle className="sr-only">{t("galleryImage")}</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            {selectedImage && (
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt={t("galleryImage")}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}