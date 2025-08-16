/**
 * =====================================================================================
 * @file        types.ts
 * @brief       定义“关于我们”页面组件所需的所有TypeScript类型接口
 * @details
 *              将类型定义与组件逻辑分离，有助于提高代码的可读性和可维护性。
 *              这个文件定义了从后端 /api/cms/about 端点获取的数据结构。
 *
 * @author      [你的名字]
 * @date        [当前日期]
 * =====================================================================================
 */

/**
 * @interface AboutData
 * @brief     “关于我们”页面CMS内容的完整数据结构
 * @details   此接口的字段名与后端 `CMSControlled.php` 中 `aboutUsCms` 方法返回的JSON键名
 *            必须完全一致，以确保类型安全和数据正确映射。
 */
export interface AboutData {
  // --- Hero and Story (英雄区和我们的故事) ---
  about_us_title: string;       // 页面主标题
  about_us_description: string; // 页面主描述
  our_story_title: string;      // “我们的故事”区域标题
  our_story_content: string;    // “我们的故事”内容 (可以是HTML字符串)
  our_story_image: string;      // “我们的故事”区域配图URL

  // --- Achievements (我们的成就) ---
  achievements_title: string;   // “我们的成就”区域标题
  achievements: {
    icon: string;               // 成就图标 (例如: '🏆')
    value: string;              // 成就数值 (例如: '1000+')
    label: string;              // 成就标签 (例如: '满意顾客')
  }[];

  // --- Our Team (我们的团队) ---
  our_team_title: string;       // “我们的团队”区域标题
  team_members: {
    name: string;               // 团队成员姓名
    role: string;               // 团队成员角色/职位
    image: string;              // 团队成员照片URL
    description: string;        // 团队成员简介
  }[];

  // --- Our Values (我们的价值观) ---
  our_values_title: string;     // “我们的价值观”区域标题
  values: {
    icon: string;               // 价值观图标 (例如: 'Heart', 'Award', 'Users')
    title: string;              // 价值观标题 (例如: '热情服务')
    description: string;        // 价值观描述
  }[];

  // --- Call to Action (行动号召) ---
  cta_title: string;            // CTA区域标题
  cta_description: string;      // CTA区域描述
  cta_contact_button: string;   // “联系我们”按钮文本
  cta_menu_button: string;      // “查看菜单”按钮文本
}