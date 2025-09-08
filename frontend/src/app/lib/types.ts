/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义首页组件所需的所有TypeScript类型接口
 * @details
 *              将类型定义与组件逻辑分离，有助于提高代码的可读性和可维护性。
 *              这个文件定义了从后端 /api/cms/home 端点获取的数据结构。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

/**
 * @interface HomeData
 * @brief     首页CMS内容的完整数据结构
 * @details   此接口的字段名与后端 `CMSControlled.php` 中 `homeCms` 方法返回的JSON键名
 *            必须完全一致，以确保类型安全和数据正确映射。
 */
export interface HomeData {
  // --- Hero Section (英雄区) ---
  hero_title: string;                     // 网站主标题 (例如: "美味之家")
  hero_main_title: string;                // 英雄区大标题 (例如: "品味极致美食")
  hero_description: string;               // 英雄区描述文本
  order_now_button_text: string;          // "立即下单" 按钮文本
  view_menu_button_text: string;          // "查看菜单" 按钮文本
  hero_background_image?: string;         // 英雄区背景图片 URL (可选)
  
  // --- Stats Section (统计数据区) ---
  stats_satisfied_customers_text: string; // "满意顾客" 标签文本
  stats_avg_delivery_time_text: string;   // "平均配送时间" 标签文本
  stats_user_rating_text: string;         // "用户评分" 标签文本
  stats_all_day_service_text: string;     // "全天候服务" 标签文本

  // --- Popular Categories & Today Special (热门分类 & 今日特选) ---
  popular_categories_title: string;       // "热门分类" 区域标题
  today_special_title: string;            // "今日特选" 区域标题
  today_special_description: string;      // "今日特选" 区域描述

  // --- Why Choose Us Section (为何选择我们) ---
  why_choose_us_title: string;            // "为何选择我们" 区域标题
  feature_fast_delivery_title: string;    // 特点1: 快速配送标题
  feature_fast_delivery_desc: string;     // 特点1: 快速配送描述
  feature_quality_ingredients_title: string; // 特点2: 优质食材标题
  feature_quality_ingredients_desc: string;  // 特点2: 优质食材描述
  feature_quality_guarantee_title: string;   // 特点3: 品质保证标题
  feature_quality_guarantee_desc: string;    // 特点3: 品质保证描述

  // --- Contact / Business Hours / Delivery (联系信息/营业时间/配送范围) ---
  business_hours_title: string;           // "营业时间" 标题
  business_hours_description: string;     // 营业时间具体描述
  contact_title: string;                  // "联系我们" 标题
  contact_number: string;                 // 联系电话号码
  delivery_title: string;                 // "配送范围" 标题
  delivery_location: string;              // 配送范围具体描述

  // --- Footer Section (页脚) ---
  footer_slogan: string;                  // 页脚口号
  footer_privacy_policy_text: string;     // "隐私政策" 链接文本
  footer_terms_of_service_text: string;   // "服务条款" 链接文本
  footer_help_center_text: string;        // "帮助中心" 链接文本
  footer_all_rights_reserved_text: string; // "版权所有" 文本
}