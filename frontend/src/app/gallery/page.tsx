"use client"
/**
 * =====================================================================================
 * @file        page.tsx
 * @brief       画廊页面组件
 * @details
 *              该页面从后端动态加载所有分类和画廊图片。用户可以通过一个响应式的
 *              下拉菜单筛选不同分类的图片，并点击图片查看大图。
 *
 * @purpose     1.  **动态内容**: 分类和图片完全由后端提供，便于管理。
 *              2.  **高效过滤**: 图片筛选逻辑已移至后端，前端只请求所需数据，性能更佳。
 *              3.  **响应式设计**: 使用下拉菜单在不同尺寸的设备（桌面、平板、手机）上
 *                  都能提供良好的分类选择体验。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

// --- 核心依赖导入 (Core Dependencies) ---
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// --- UI组件和图标导入 (UI Components & Icons) ---
import { ArrowLeft, X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";

// --- 自定义Hooks和上下文 (Custom Hooks & Context) ---
import { useLanguage } from "../../components/LanguageProvider";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

// --- 数据和类型导入 (Data & Types) ---
import axios from "../../lib/axios";
import { Category, GalleryImage, FormattedGalleryImage } from "./lib/types";

/**
 * @component GalleryPage
 * @brief     画廊页面的根组件
 */
export default function GalleryPage() {
  // --- Hooks ---
  const { t } = useLanguage();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  // --- 状态管理 (State Management) ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<FormattedGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [isFilterAreaOpen, setIsFilterAreaOpen] = useState(false);


  // --- 数据格式化辅助函数 ---
  const formatImages = (data: GalleryImage[]): FormattedGalleryImage[] => {
    return data.map((item) => ({
      id: item.id,
      src: `${API_BASE_URL}/storage/${item.image}`,
      alt: item.title,
      title: item.title,
      description: item.description,
      categoryId: item.category_id,
    }));
  };

  // --- 数据获取 (Data Fetching) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, galleriesResponse] = await Promise.all([
          axios.get("/categories"),
          axios.get("/galleries"),
        ]);
        if (Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }
        if (Array.isArray(galleriesResponse.data.data)) {
          setGalleryImages(formatImages(galleriesResponse.data.data));
        }
      } catch (error) {
        console.error("获取初始化数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const fetchImagesByCategory = async () => {
      setImagesLoading(true);
      try {
        const endpoint = selectedCategoryId
          ? `/galleries?category_id=${selectedCategoryId}`
          : "/galleries";
        const response = await axios.get(endpoint);
        if (Array.isArray(response.data.data)) {
          setGalleryImages(formatImages(response.data.data));
        }
      } catch (error) {
        console.error("按分类获取图片失败:", error);
      } finally {
        setImagesLoading(false);
      }
    };
    fetchImagesByCategory();
  }, [selectedCategoryId]);

  // --- 渲染逻辑与辅助函数 (Render Logic & Helpers) ---
  const getCategoryName = (id: number | null) => {
    if (id === null) return t("all");
    return categories.find((c) => c.id === id)?.name || t("selectCategory");
  };

  const getCategoryNameById = (id: number): string => {
    return categories.find((c) => c.id === id)?.name || "";
  };
  
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setIsFilterAreaOpen(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* ==================== 页头 (Header) ==================== */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black/10">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">{t("galleryPageTitle")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ==================== 分类筛选区 (Category Filter Section) ==================== */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-orange-100/50 py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => setIsFilterAreaOpen(!isFilterAreaOpen)}
            className="w-full flex items-center justify-between bg-white/80 hover:bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300 hover:shadow-md px-6 py-2 font-medium transition-all duration-300 rounded-full text-base h-12"
          >
            <span className="truncate">{getCategoryName(selectedCategoryId)}</span>
            <ChevronDown className={`h-5 w-5 ml-2 flex-shrink-0 transition-transform duration-200 ${isFilterAreaOpen ? 'rotate-180' : ''}`} />
          </Button>

          <div 
            className={`grid transition-all duration-500 ease-in-out ${
              isFilterAreaOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="p-4 bg-amber-50 rounded-2xl border border-orange-200 shadow-inner">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategoryId === null
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-100 hover:border-orange-200'
                    }`}
                  >
                    {t("all")}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedCategoryId === category.id
                          ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-100 hover:border-orange-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ==================== 画廊主体 (Gallery Section) ==================== */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="relative">
            {imagesLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex justify-center items-center z-10 rounded-2xl">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-2xl" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-baseline justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 truncate">
                          {image.title}
                        </h3>
                        <span className="flex-shrink-0 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                          {getCategoryNameById(image.categoryId) || "No Category"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {image.description}
                      </p>
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-200 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {!imagesLoading && galleryImages.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto shadow-lg">
                  <div className="text-orange-400 text-2xl mb-4">🍽️</div>
                  <div className="text-gray-600 text-lg mb-2 font-medium">{t("noImages")}</div>
                  <p className="text-gray-500">{t("noImagesDesc")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== 图片放大弹窗 (Image Modal) ==================== */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
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
  );
}