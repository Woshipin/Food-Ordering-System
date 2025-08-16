/**
 * =====================================================================================
 * @file        data.ts
 * @brief       提供首页所需的静态和模拟数据
 * @details
 *              该文件用于存放那些目前在前端写死的数据，例如“今日推荐”和“热门分类”。
 *              在未来的开发中，这些数据应该通过API从后端动态获取，届时可以移除此文件。
 *              将这些数据分离出来，可以使主组件 `page.tsx` 更加简洁。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

/**
 * @brief 热门分类的模拟数据
 * @todo  未来应通过调用后端的 `/api/categories` 接口动态获取这些数据。
 */
export const getCategories = (t: (key: string) => string) => [
  { name: t("main"), icon: "🍜", count: 25 },
  { name: t("appetizer"), icon: "🥟", count: 18 },
  { name: t("beverage"), icon: "🥤", count: 12 },
  { name: t("dessert"), icon: "🍰", count: 8 },
  { name: t("package"), icon: "🍱", count: 6 },
  { name: t("vegetarianFood"), icon: "🥗", count: 15 },
];

/**
 * @brief “今日推荐”菜品的模拟数据
 * @todo  未来应通过调用后端的 `/api/menus?featured=true` 或类似接口动态获取。
 */
export const getFeaturedItems = (t: (key: string) => string) => [
  {
    id: 1,
    name: t("signatureBeefNoodles"),
    price: 28.0,
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.8,
    reviews: 156,
    description: t("beefNoodlesDesc"),
  },
  {
    id: 2,
    name: t("spicyHotPot"),
    price: 32.0,
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.7,
    reviews: 89,
    description: t("hotPotDesc"),
  },
  {
    id: 3,
    name: t("steamedDumplings"),
    price: 18.0,
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.9,
    reviews: 234,
    description: t("dumplingsDesc"),
  },
  {
    id: 4,
    name: t("braisedPork"),
    price: 35.0,
    image: "/placeholder.svg?height=300&width=400",
    rating: 4.7,
    reviews: 98,
    description: t("braisedPorkDesc"),
  },
];

/**
 * @brief 导航栏项目
 * @details 定义了网站主导航栏的链接和显示文本。
 */
export const getNavItems = (t: (key: string) => string) => [
  { href: "/menu", label: t("menu") },
  { href: "/package", label: t("packages") },
  { href: "/gallery", label: t("gallery") },
  { href: "/about", label: t("about") },
  { href: "/contact", label: t("contact") },
];