<?php
/**
 * =====================================================================================
 * @file        CMSControlled.php
 * @brief       内容管理系统(CMS)的API控制器
 * @details
 *              该控制器负责处理所有与前端CMS页面（如首页、关于我们、联系我们）
 *              相关的数据请求。它从数据库中获取内容，根据用户请求的语言进行转换，
 *              并以统一的JSON格式返回给前端应用。
 *
 * @purpose     1.  **提供动态内容**: 使网站的文本、图片等内容可以通过后台管理系统进行修改，
 *                  而无需直接修改前端代码。
 *              2.  **支持多语言**: 根据前端传递的 `lang` 参数（如 'en', 'cn'），
 *                  动态返回相应语言的内容。
 *              3.  **数据聚合**: 将来自多个数据表（如 `home_cms`, `about_us_cms` 等）
 *                  的数据聚合成单个API端点，简化前端的请求逻辑。
 *
 * @author      [作者姓名]
 * @date        [创建日期]
 * @version     1.0.0
 * =====================================================================================
 */
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HomeCms;
use App\Models\AboutUsCms;
use App\Models\Achievement;
use App\Models\OurTeam;
use App\Models\OurValue;
use App\Models\ContactCms;
use App\Models\ContactInfo;
use App\Models\ContactMap;
use App\Models\ContactFaq;

class CMSControlled extends Controller
{
    /**
     * @brief   获取模型中指定语言的字段值
     * @details 这是一个辅助函数，用于根据语言后缀（如 _en, _cn）动态获取字段值。
     *          例如，当 $fieldName 为 'hero_title'，$lang 为 'cn' 时，
     *          它会尝试获取 $model->hero_title_cn 的值。
     *
     * @param   \Illuminate\Database\Eloquent\Model $model 数据模型实例
     * @param   string $fieldName 字段名的前缀 (e.g., 'hero_title')
     * @param   string $lang 语言代码 (e.g., 'en', 'cn')
     * @return  string|null 翻译后的字段值
     */
    private function getTranslatedField($model, $fieldName, $lang)
    {
        // 使用动态属性访问来拼接字段名，例如 "hero_title_en"
        return $model->{"{$fieldName}_{$lang}"};
    }

    /**
     * @brief   获取首页CMS数据
     * @param   Request $request Laravel的HTTP请求对象，用于获取查询参数
     * @return  \Illuminate\Http\JsonResponse 包含首页所有动态内容的JSON响应
     */
    public function homeCms(Request $request)
    {
        // 1. 从请求的查询字符串中获取 'lang' 参数，如果不存在则默认为 'en'
        $lang = $request->query('lang', 'en');

        // 2. 从数据库中获取第一条（也是唯一一条）HomeCms记录
        $homeCms = HomeCms::first();

        // 3. 如果数据库中没有找到内容，返回404 Not Found错误
        if (!$homeCms) {
            return response()->json(['error' => 'Home CMS content not found.'], 404);
        }

        // 4. 构建一个与前端 `HomeData` 接口完全匹配的数据数组
        $data = [
            // --- Hero Section (英雄区) ---
            'hero_title' => $this->getTranslatedField($homeCms, 'hero_title', $lang),
            'hero_main_title' => $this->getTranslatedField($homeCms, 'hero_main_title', $lang),
            'hero_description' => $this->getTranslatedField($homeCms, 'hero_description', $lang),
            'hero_background_image' => $homeCms->hero_background_image, // 图片字段，非多语言
            'order_now_button_text' => $this->getTranslatedField($homeCms, 'order_now_button_text', $lang),
            'view_menu_button_text' => $this->getTranslatedField($homeCms, 'view_menu_button_text', $lang),

            // --- Story Section (我们的故事区) ---
            'story_title' => $this->getTranslatedField($homeCms, 'story_title', $lang),
            'story_description' => $this->getTranslatedField($homeCms, 'story_description', $lang),
            'story_image' => $homeCms->story_image, // 图片字段，非多语言

            // --- Stats Section (统计数据区) ---
            'stats_satisfied_customers_text' => $this->getTranslatedField($homeCms, 'stats_satisfied_customers_text', $lang),
            'stats_avg_delivery_time_text' => $this->getTranslatedField($homeCms, 'stats_avg_delivery_time_text', $lang),
            'stats_user_rating_text' => $this->getTranslatedField($homeCms, 'stats_user_rating_text', $lang),
            'stats_all_day_service_text' => $this->getTranslatedField($homeCms, 'stats_all_day_service_text', $lang),

            // --- Popular Categories & Today Special (热门分类 & 今日特选) ---
            'popular_categories_title' => $this->getTranslatedField($homeCms, 'popular_categories_title', $lang),
            'today_special_title' => $this->getTranslatedField($homeCms, 'today_special_title', $lang),
            'today_special_description' => $this->getTranslatedField($homeCms, 'today_special_description', $lang),

            // --- Why Choose Us Section (为何选择我们) ---
            'why_choose_us_title' => $this->getTranslatedField($homeCms, 'why_choose_us_title', $lang),
            'feature_fast_delivery_title' => $this->getTranslatedField($homeCms, 'feature_fast_delivery_title', $lang),
            'feature_fast_delivery_desc' => $this->getTranslatedField($homeCms, 'feature_fast_delivery_desc', $lang),
            'feature_quality_ingredients_title' => $this->getTranslatedField($homeCms, 'feature_quality_ingredients_title', $lang),
            'feature_quality_ingredients_desc' => $this->getTranslatedField($homeCms, 'feature_quality_ingredients_desc', $lang),
            'feature_quality_guarantee_title' => $this->getTranslatedField($homeCms, 'feature_quality_guarantee_title', $lang),
            'feature_quality_guarantee_desc' => $this->getTranslatedField($homeCms, 'feature_quality_guarantee_desc', $lang),

            // --- Business Hours, Contact, and Delivery Section (营业时间、联系方式和配送) ---
            'business_hours_title' => $this->getTranslatedField($homeCms, 'business_hours_title', $lang),
            'business_hours_description' => $this->getTranslatedField($homeCms, 'business_hours_description', $lang),
            'contact_title' => $this->getTranslatedField($homeCms, 'contact_title', $lang),
            'contact_number' => $homeCms->contact_number, // 非多语言字段
            'delivery_title' => $this->getTranslatedField($homeCms, 'delivery_title', $lang),
            'delivery_location' => $homeCms->delivery_location, // 非多语言字段

            // --- Footer Section (页脚) ---
            'footer_slogan' => $this->getTranslatedField($homeCms, 'footer_slogan', $lang),
            'footer_privacy_policy_text' => $this->getTranslatedField($homeCms, 'footer_privacy_policy_text', $lang),
            'footer_terms_of_service_text' => $this->getTranslatedField($homeCms, 'footer_terms_of_service_text', $lang),
            'footer_help_center_text' => $this->getTranslatedField($homeCms, 'footer_help_center_text', $lang),
            'footer_all_rights_reserved_text' => $this->getTranslatedField($homeCms, 'footer_all_rights_reserved_text', $lang),
        ];

        // 5. 将构建好的数据数组作为JSON响应返回
        return response()->json($data);
    }

    /**
     * @brief   获取“关于我们”页面的CMS数据
     * @param   Request $request Laravel的HTTP请求对象
     * @return  \Illuminate\Http\JsonResponse 包含“关于我们”页面所有动态内容的JSON响应
     */
    public function aboutUsCms(Request $request)
    {
        // 1. 获取语言参数
        $lang = $request->query('lang', 'en');
        // 2. 获取“关于我们”的主记录
        $aboutUsCms = AboutUsCms::first();

        // 3. 如果记录不存在，返回404错误
        if (!$aboutUsCms) {
            return response()->json(['error' => 'About Us CMS not found'], 404);
        }

        // 4. 构建与前端 `AboutData` 接口匹配的数据数组
        $data = [
            // --- Hero and Story (英雄区和我们的故事) ---
            'about_us_title' => $this->getTranslatedField($aboutUsCms, 'hero_title', $lang),
            'about_us_description' => $this->getTranslatedField($aboutUsCms, 'hero_description', $lang),
            'our_story_title' => $this->getTranslatedField($aboutUsCms, 'story_title', $lang),
            'our_story_content' => $this->getTranslatedField($aboutUsCms, 'story_description', $lang),
            'our_story_image' => $aboutUsCms->story_image,

            // --- Achievements (我们的成就) ---
            // [优化] 从主记录中获取标题，而不是硬编码
            'achievements_title' => $this->getTranslatedField($aboutUsCms, 'achievements_title', $lang),
            'achievements' => Achievement::take(4)->get()->map(function ($item) use ($lang) {
                return [
                    'icon' => $item->icon,
                    'value' => $item->value,
                    'label' => $this->getTranslatedField($item, 'label', $lang),
                ];
            }),

            // --- Our Team (我们的团队) ---
            // [优化] 从主记录中获取标题
            'our_team_title' => $this->getTranslatedField($aboutUsCms, 'our_team_title', $lang),
            'team_members' => OurTeam::take(4)->get()->map(function ($item) use ($lang) {
                return [
                    'name' => $this->getTranslatedField($item, 'name', $lang),
                    'role' => $this->getTranslatedField($item, 'role', $lang),
                    'image' => $item->image,
                    'description' => $this->getTranslatedField($item, 'description', $lang),
                ];
            }),

            // --- Our Values (我们的价值观) ---
            // [优化] 从主记录中获取标题
            'our_values_title' => $this->getTranslatedField($aboutUsCms, 'our_values_title', $lang),
            'values' => OurValue::take(3)->get()->map(function ($item) use ($lang) {
                return [
                    'icon' => $item->icon,
                    'title' => $this->getTranslatedField($item, 'title', $lang),
                    'description' => $this->getTranslatedField($item, 'description', $lang),
                ];
            }),

            // --- Call to Action (行动号召) ---
            // [优化] 从主记录中获取所有CTA文本
            'cta_title' => $this->getTranslatedField($aboutUsCms, 'cta_title', $lang),
            'cta_description' => $this->getTranslatedField($aboutUsCms, 'cta_description', $lang),
            'cta_contact_button' => $this->getTranslatedField($aboutUsCms, 'cta_contact_button_text', $lang),
            'cta_menu_button' => $this->getTranslatedField($aboutUsCms, 'cta_menu_button_text', $lang),
        ];

        // 5. 返回JSON响应
        return response()->json($data);
    }

    /**
     * @brief   获取“联系我们”页面的CMS数据
     * @param   Request $request Laravel的HTTP请求对象
     * @return  \Illuminate\Http\JsonResponse 包含“联系我们”页面所有动态内容的JSON响应
     */
    public function contactCms(Request $request)
    {
        // 1. 获取语言参数
        $lang = $request->query('lang', 'en');
        // 2. 获取“联系我们”的主记录
        $contactCms = ContactCms::first();

        // 3. 如果记录不存在，返回404错误
        if (!$contactCms) {
            return response()->json(['error' => 'Contact CMS not found'], 404);
        }

        // 4. 查找类型为 'address' 的联系信息，用于地图定位
        $addressInfo = ContactInfo::where('type', 'address')->first();

        // 5. 构建与前端 `ContactData` 接口匹配的数据数组
        $data = [
            // --- Hero Section (英雄区) ---
            // [修复] 修正了字段名前缀，确保能从ContactCms模型中正确读取数据
            'hero_title' => $this->getTranslatedField($contactCms, 'contact_title', $lang),
            'hero_description' => $this->getTranslatedField($contactCms, 'contact_description', $lang),

            // --- Contact Info (联系信息) ---
            // [优化] 从主记录中获取标题
            'contact_info_title' => $this->getTranslatedField($contactCms, 'contact_info_title', $lang),
            'contact_info' => ContactInfo::all()->map(function ($item) use ($lang) {
                return [
                    'type' => $item->type,
                    'title' => $this->getTranslatedField($item, 'label', $lang),
                    'description' => $this->getTranslatedField($item, 'note', $lang),
                    'details' => $item->value,
                    'latitude' => $item->latitude,
                    'longitude' => $item->longitude,
                ];
            }),

            // --- Store Location (店铺位置) ---
            // [优化] 从主记录中获取标题
            'store_location_title' => $this->getTranslatedField($contactCms, 'store_location_title', $lang),
            'map_url' => ContactMap::first()?->map_iframe_url, // 从ContactMap模型获取地图URL

            // --- Message Form (留言表单) ---
            // [优化] 从主记录中获取所有表单相关的文本
            'send_message_title' => $this->getTranslatedField($contactCms, 'send_message_title', $lang),
            'form_name_label' => $this->getTranslatedField($contactCms, 'form_name_label', $lang),
            'form_name_placeholder' => $this->getTranslatedField($contactCms, 'form_name_placeholder', $lang),
            'form_phone_label' => $this->getTranslatedField($contactCms, 'form_phone_label', $lang),
            'form_phone_placeholder' => $this->getTranslatedField($contactCms, 'form_phone_placeholder', $lang),
            'form_email_label' => $this->getTranslatedField($contactCms, 'form_email_label', $lang),
            'form_email_placeholder' => $this->getTranslatedField($contactCms, 'form_email_placeholder', $lang),
            'form_subject_label' => $this->getTranslatedField($contactCms, 'form_subject_label', $lang),
            'form_subject_placeholder' => $this->getTranslatedField($contactCms, 'form_subject_placeholder', $lang),
            'form_message_label' => $this->getTranslatedField($contactCms, 'form_message_label', $lang),
            'form_message_placeholder' => $this->getTranslatedField($contactCms, 'form_message_placeholder', $lang),
            'form_submit_button' => $this->getTranslatedField($contactCms, 'form_submit_button_text', $lang),

            // --- FAQ (常见问题) ---
            // [优化] 从主记录中获取标题
            'faq_title' => $this->getTranslatedField($contactCms, 'faq_title', $lang),
            'faqs' => ContactFaq::all()->map(function ($item) use ($lang) {
                return [
                    'question' => $this->getTranslatedField($item, 'question', $lang),
                    'answer' => $this->getTranslatedField($item, 'answer', $lang),
                ];
            }),
        ];

        // 6. 返回JSON响应
        return response()->json($data);
    }
}
