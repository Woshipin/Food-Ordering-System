/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义“联系我们”页面组件所需的所有TypeScript类型接口
 * @details
 *              将类型定义与组件逻辑分离，有助于提高代码的可读性和可维护性。
 *              这个文件定义了从后端 /api/cms/contact 端点获取的数据结构，以及
 *              联系表单自身的数据结构。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

/**
 * @interface FormData
 * @brief     联系表单的数据结构
 * @details   定义了用户在联系表单中需要填写的字段。
 */
export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * @interface ContactData
 * @brief     “联系我们”页面CMS内容的完整数据结构
 * @details   此接口的字段名与后端 `CMSControlled.php` 中 `contactCms` 方法返回的JSON键名
 *            必须完全一致，以确保类型安全和数据正确映射。
 */
export interface ContactData {
  // --- Hero Section (英雄区) ---
  hero_title: string;
  hero_description: string;

  // --- Contact Info (联系信息) ---
  contact_info_title: string;
  contact_info: {
    type: 'phone' | 'email' | 'address' | 'hours'; // 限制类型以增强代码健壮性
    title: string;
    description: string;
    details: string;
  }[];

  // --- Store Location (店铺位置) ---
  store_location_title: string;
  map_url: string; // 完整的Google Maps iframe HTML字符串

  // --- Message Form (留言表单) ---
  send_message_title: string;
  form_name_label: string;
  form_name_placeholder: string;
  form_phone_label: string;
  form_phone_placeholder: string;
  form_email_label: string;
  form_email_placeholder: string;
  form_subject_label: string;
  form_subject_placeholder: string;
  form_message_label: string;
  form_message_placeholder: string;
  form_submit_button: string;

  // --- FAQ (常见问题) ---
  faq_title: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}