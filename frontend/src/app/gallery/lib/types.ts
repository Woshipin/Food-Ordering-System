/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义画廊页面组件所需的所有TypeScript类型接口
 * @details
 *              将类型定义与组件逻辑分离，有助于提高代码的可读性和可维护性。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

/**
 * @interface Category
 * @brief     分类数据结构
 * @details   对应后端 /api/categories 返回的单个分类对象。
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * @interface GalleryImage
 * @brief     画廊图片数据结构
 * @details   对应后端 /api/galleries 返回的单个图片对象。
 */
export interface GalleryImage {
  id: number;
  image: string;
  title: string;
  description: string;
  // 正确地定义了 API 返回的字段为 category_id
  category_id: number;
}

/**
 * @interface FormattedGalleryImage
 * @brief     前端组件中使用的格式化后的画廊图片数据结构
 * @details   这个接口是为了方便在组件中使用而对 `GalleryImage` 进行转换后的形态。
 */
export interface FormattedGalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
  // 正确地定义了前端内部使用的字段为 categoryId
  categoryId: number;
}