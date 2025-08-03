<?php

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
    private function getTranslatedField($model, $fieldName, $lang)
    {
        return $model->{"{$fieldName}_{$lang}"};
    }

    public function homeCms(Request $request)
    {
        // 1. 获取语言参数，默认为 'en'
        $lang = $request->query('lang', 'en');

        // 2. 获取唯一的 HomeCms 记录
        $homeCms = HomeCms::first();

        // 3. 如果记录不存在，返回 404 错误
        if (!$homeCms) {
            return response()->json(['error' => 'Home CMS content not found.'], 404);
        }

        // 4. 构建返回给前端的 data 数组
        // [重点] 这里的键名与前端 HomePage.tsx 中的 HomeData 接口完全匹配
        $data = [
            // Hero Section
            'hero_title' => $this->getTranslatedField($homeCms, 'hero_title', $lang),
            'hero_main_title' => $this->getTranslatedField($homeCms, 'hero_main_title', $lang),
            'hero_description' => $this->getTranslatedField($homeCms, 'hero_description', $lang),
            'hero_background_image' => $homeCms->hero_background_image, // 非多语言字段
            'order_now_button_text' => $this->getTranslatedField($homeCms, 'order_now_button_text', $lang),
            'view_menu_button_text' => $this->getTranslatedField($homeCms, 'view_menu_button_text', $lang),

            // Story Section (新增)
            'story_title' => $this->getTranslatedField($homeCms, 'story_title', $lang),
            'story_description' => $this->getTranslatedField($homeCms, 'story_description', $lang),
            'story_image' => $homeCms->story_image, // 非多语言字段

            // Stats Section
            'stats_satisfied_customers_text' => $this->getTranslatedField($homeCms, 'stats_satisfied_customers_text', $lang),
            'stats_avg_delivery_time_text' => $this->getTranslatedField($homeCms, 'stats_avg_delivery_time_text', $lang),
            'stats_user_rating_text' => $this->getTranslatedField($homeCms, 'stats_user_rating_text', $lang),
            'stats_all_day_service_text' => $this->getTranslatedField($homeCms, 'stats_all_day_service_text', $lang),

            // Popular Categories & Today Special
            'popular_categories_title' => $this->getTranslatedField($homeCms, 'popular_categories_title', $lang),
            'today_special_title' => $this->getTranslatedField($homeCms, 'today_special_title', $lang),
            'today_special_description' => $this->getTranslatedField($homeCms, 'today_special_description', $lang),

            // Why Choose Us Section
            'why_choose_us_title' => $this->getTranslatedField($homeCms, 'why_choose_us_title', $lang),
            'feature_fast_delivery_title' => $this->getTranslatedField($homeCms, 'feature_fast_delivery_title', $lang),
            'feature_fast_delivery_desc' => $this->getTranslatedField($homeCms, 'feature_fast_delivery_desc', $lang),
            'feature_quality_ingredients_title' => $this->getTranslatedField($homeCms, 'feature_quality_ingredients_title', $lang),
            'feature_quality_ingredients_desc' => $this->getTranslatedField($homeCms, 'feature_quality_ingredients_desc', $lang),
            'feature_quality_guarantee_title' => $this->getTranslatedField($homeCms, 'feature_quality_guarantee_title', $lang),
            'feature_quality_guarantee_desc' => $this->getTranslatedField($homeCms, 'feature_quality_guarantee_desc', $lang),

            // Business Hours, Contact, and Delivery Section (键名已简化)
            'business_hours_title' => $this->getTranslatedField($homeCms, 'business_hours_title', $lang),
            'business_hours_description' => $this->getTranslatedField($homeCms, 'business_hours_description', $lang),
            'contact_title' => $this->getTranslatedField($homeCms, 'contact_title', $lang),
            'contact_number' => $homeCms->contact_number, // 非多语言字段
            'delivery_title' => $this->getTranslatedField($homeCms, 'delivery_title', $lang),
            'delivery_location' => $homeCms->delivery_location, // 非多语言字段

            // Footer Section
            'footer_slogan' => $this->getTranslatedField($homeCms, 'footer_slogan', $lang),
            'footer_privacy_policy_text' => $this->getTranslatedField($homeCms, 'footer_privacy_policy_text', $lang),
            'footer_terms_of_service_text' => $this->getTranslatedField($homeCms, 'footer_terms_of_service_text', $lang),
            'footer_help_center_text' => $this->getTranslatedField($homeCms, 'footer_help_center_text', $lang),
            'footer_all_rights_reserved_text' => $this->getTranslatedField($homeCms, 'footer_all_rights_reserved_text', $lang),
        ];

        // 5. 返回 JSON 响应
        return response()->json($data);
    }

    public function aboutUsCms(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $aboutUsCms = AboutUsCms::first();

        if (!$aboutUsCms) {
            return response()->json(['error' => 'About Us CMS not found'], 404);
        }

        $data = [
            'about_us_title' => $this->getTranslatedField($aboutUsCms, 'hero_title', $lang),
            'about_us_description' => $this->getTranslatedField($aboutUsCms, 'hero_description', $lang),
            'our_story_title' => $this->getTranslatedField($aboutUsCms, 'story_title', $lang),
            'our_story_content' => $this->getTranslatedField($aboutUsCms, 'story_description', $lang),
            'our_story_image' => $aboutUsCms->story_image,
            'achievements_title' => 'Our Achievements', // Hardcoded as it's not in the model
            'achievements' => Achievement::take(4)->get()->map(function ($item) use ($lang) {
                return [
                    'icon' => $item->icon,
                    'value' => $item->value,
                    'label' => $this->getTranslatedField($item, 'label', $lang),
                ];
            }),
            'our_team_title' => 'Our Team', // Hardcoded as it's not in the model
            'team_members' => OurTeam::take(4)->get()->map(function ($item) use ($lang) {
                return [
                    'name' => $this->getTranslatedField($item, 'name', $lang),
                    'role' => $this->getTranslatedField($item, 'role', $lang),
                    'image' => $item->image,
                    'description' => $this->getTranslatedField($item, 'description', $lang),
                ];
            }),
            'our_values_title' => 'Our Values', // Hardcoded as it's not in the model
            'values' => OurValue::take(3)->get()->map(function ($item) use ($lang) {
                return [
                    'icon' => $item->icon,
                    'title' => $this->getTranslatedField($item, 'title', $lang),
                    'description' => $this->getTranslatedField($item, 'description', $lang),
                ];
            }),
            'cta_title' => 'Learn More', // Hardcoded as it's not in the model
            'cta_description' => 'Contact us to learn more about our services.', // Hardcoded as it's not in the model
            'cta_contact_button' => 'Contact Us', // Hardcoded as it's not in the model
            'cta_menu_button' => 'View Menu', // Hardcoded as it's not in the model
        ];

        return response()->json($data);
    }

    public function contactCms(Request $request)
    {
        $lang = $request->query('lang', 'en');
        $contactCms = ContactCms::first();

        if (!$contactCms) {
            return response()->json(['error' => 'Contact CMS not found'], 404);
        }

        $data = [
            'hero_title' => $this->getTranslatedField($contactCms, 'contact_title', $lang),
            'hero_description' => $this->getTranslatedField($contactCms, 'contact_description', $lang),
            'contact_info_title' => 'Contact Information', // Hardcoded as it's not in the model
            'contact_info' => ContactInfo::all()->map(function ($item) use ($lang) {
                return [
                    'type' => $item->type,
                    'title' => $this->getTranslatedField($item, 'label', $lang),
                    'description' => $this->getTranslatedField($item, 'note', $lang),
                    'details' => $item->value,
                ];
            }),
            'store_location_title' => 'Our Location', // Hardcoded as it's not in the model
            'map_url' => ContactMap::first()->map_iframe_url,
            'send_message_title' => 'Send us a Message', // Hardcoded as it's not in the model
            'form_name_label' => 'Full Name', // Hardcoded as it's not in the model
            'form_name_placeholder' => 'Enter your full name', // Hardcoded as it's not in the model
            'form_phone_label' => 'Phone Number', // Hardcoded as it's not in the model
            'form_phone_placeholder' => 'Enter your phone number', // Hardcoded as it's not in the model
            'form_email_label' => 'Email Address', // Hardcoded as it's not in the model
            'form_email_placeholder' => 'Enter your email address', // Hardcoded as it's not in the model
            'form_subject_label' => 'Subject', // Hardcoded as it's not in the model
            'form_subject_placeholder' => 'Enter the subject of your message', // Hardcoded as it's not in the model
            'form_message_label' => 'Message', // Hardcoded as it's not in the model
            'form_message_placeholder' => 'Enter your message', // Hardcoded as it's not in the model
            'form_submit_button' => 'Send Message', // Hardcoded as it's not in the model
            'faq_title' => 'Frequently Asked Questions', // Hardcoded as it's not in the model
            'faqs' => ContactFaq::all()->map(function ($item) use ($lang) {
                return [
                    'question' => $this->getTranslatedField($item, 'question', $lang),
                    'answer' => $this->getTranslatedField($item, 'answer', $lang),
                ];
            }),
        ];

        return response()->json($data);
    }
}
