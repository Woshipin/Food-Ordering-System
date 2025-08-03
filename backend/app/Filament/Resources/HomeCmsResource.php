<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeCmsResource\Pages;
use App\Models\HomeCms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;

class HomeCmsResource extends Resource
{
    protected static ?string $model = HomeCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationGroup = 'Content Management System';

    protected static ?string $label = 'Home CMS';

    protected static ?string $pluralLabel = 'Home CMS';

    protected static ?int $navigationSort = 0;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    // 重定向 'index' 到第一个记录的 'edit' 页面，实现单例模式
    public static function getUrl(string $name = 'index', array $parameters = [], bool $isAbsolute = true, ?string $panel = null, ?\Illuminate\Database\Eloquent\Model $tenant = null): string
    {
        // 如果数据库中没有记录，则先跳转到创建页面
        if ($name === 'index' && static::getModel()::count() === 0) {
            return parent::getUrl('create', $parameters, $isAbsolute, $panel, $tenant);
        }

        // 确保总有一条记录可以编辑
        if ($record = static::getModel()::first()) {
             $parameters['record'] = $record->id;
        }

        return parent::getUrl('edit', $parameters, $isAbsolute, $panel, $tenant);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Hero Section')
                    ->description('首页顶部的主要展示区域')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('hero_title_en')->label('Title (EN)'),
                            TextInput::make('hero_title_zh')->label('Title (ZH)'),
                            TextInput::make('hero_title_ms')->label('Title (MS)'),

                            TextInput::make('hero_main_title_en')->label('Main Title (EN)'),
                            TextInput::make('hero_main_title_zh')->label('Main Title (ZH)'),
                            TextInput::make('hero_main_title_ms')->label('Main Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            Textarea::make('hero_description_en')->label('Description (EN)'),
                            Textarea::make('hero_description_zh')->label('Description (ZH)'),
                            Textarea::make('hero_description_ms')->label('Description (MS)'),
                        ]),
                        FileUpload::make('hero_background_image')->image()->label('Background Image'),

                        Grid::make(3)->schema([
                            TextInput::make('order_now_button_text_en')->label('Order Now Button (EN)'),
                            TextInput::make('order_now_button_text_zh')->label('Order Now Button (ZH)'),
                            TextInput::make('order_now_button_text_ms')->label('Order Now Button (MS)'),

                            TextInput::make('view_menu_button_text_en')->label('View Menu Button (EN)'),
                            TextInput::make('view_menu_button_text_zh')->label('View Menu Button (ZH)'),
                            TextInput::make('view_menu_button_text_ms')->label('View Menu Button (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Stats Section')
                    ->description('用于展示关键统计数据的文本')
                    ->schema([
                         Grid::make(3)->schema([
                            TextInput::make('stats_satisfied_customers_text_en')->label('Satisfied Customers (EN)'),
                            TextInput::make('stats_satisfied_customers_text_zh')->label('Satisfied Customers (ZH)'),
                            TextInput::make('stats_satisfied_customers_text_ms')->label('Satisfied Customers (MS)'),

                            TextInput::make('stats_avg_delivery_time_text_en')->label('Avg. Delivery Time (EN)'),
                            TextInput::make('stats_avg_delivery_time_text_zh')->label('Avg. Delivery Time (ZH)'),
                            TextInput::make('stats_avg_delivery_time_text_ms')->label('Avg. Delivery Time (MS)'),

                            TextInput::make('stats_user_rating_text_en')->label('User Rating (EN)'),
                            TextInput::make('stats_user_rating_text_zh')->label('User Rating (ZH)'),
                            TextInput::make('stats_user_rating_text_ms')->label('User Rating (MS)'),

                            TextInput::make('stats_all_day_service_text_en')->label('All Day Service (EN)'),
                            TextInput::make('stats_all_day_service_text_zh')->label('All Day Service (ZH)'),
                            TextInput::make('stats_all_day_service_text_ms')->label('All Day Service (MS)'),
                         ]),
                    ])->collapsible(),

                Section::make('Popular Categories & Today\'s Special')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('popular_categories_title_en')->label('Popular Categories Title (EN)'),
                            TextInput::make('popular_categories_title_zh')->label('Popular Categories Title (ZH)'),
                            TextInput::make('popular_categories_title_ms')->label('Popular Categories Title (MS)'),
                        ]),
                        Grid::make(3)->schema([
                            TextInput::make('today_special_title_en')->label('Today\'s Special Title (EN)'),
                            TextInput::make('today_special_title_zh')->label('Today\'s Special Title (ZH)'),
                            TextInput::make('today_special_title_ms')->label('Today\'s Special Title (MS)'),
                        ]),
                         Grid::make(3)->schema([
                            Textarea::make('today_special_description_en')->label('Today\'s Special Description (EN)'),
                            Textarea::make('today_special_description_zh')->label('Today\'s Special Description (ZH)'),
                            Textarea::make('today_special_description_ms')->label('Today\'s Special Description (MS)'),
                        ]),
                    ])->collapsible(),

                Section::make('Why Choose Us Section')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('why_choose_us_title_en')->label('Section Title (EN)'),
                            TextInput::make('why_choose_us_title_zh')->label('Section Title (ZH)'),
                            TextInput::make('why_choose_us_title_ms')->label('Section Title (MS)'),
                        ]),
                        // Feature 1: Fast Delivery
                        Section::make('Feature 1: Fast Delivery')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('feature_fast_delivery_title_en')->label('Title (EN)'),
                                    TextInput::make('feature_fast_delivery_title_zh')->label('Title (ZH)'),
                                    TextInput::make('feature_fast_delivery_title_ms')->label('Title (MS)'),
                                ]),
                                Grid::make(3)->schema([
                                    Textarea::make('feature_fast_delivery_desc_en')->label('Description (EN)'),
                                    Textarea::make('feature_fast_delivery_desc_zh')->label('Description (ZH)'),
                                    Textarea::make('feature_fast_delivery_desc_ms')->label('Description (MS)'),
                                ]),
                            ])->collapsible(),
                        // Feature 2: Quality Ingredients
                        Section::make('Feature 2: Quality Ingredients')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('feature_quality_ingredients_title_en')->label('Title (EN)'),
                                    TextInput::make('feature_quality_ingredients_title_zh')->label('Title (ZH)'),
                                    TextInput::make('feature_quality_ingredients_title_ms')->label('Title (MS)'),
                                ]),
                                Grid::make(3)->schema([
                                    Textarea::make('feature_quality_ingredients_desc_en')->label('Description (EN)'),
                                    Textarea::make('feature_quality_ingredients_desc_zh')->label('Description (ZH)'),
                                    Textarea::make('feature_quality_ingredients_desc_ms')->label('Description (MS)'),
                                ]),
                            ])->collapsible(),
                        // Feature 3: Quality Guarantee
                        Section::make('Feature 3: Quality Guarantee')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('feature_quality_guarantee_title_en')->label('Title (EN)'),
                                    TextInput::make('feature_quality_guarantee_title_zh')->label('Title (ZH)'),
                                    TextInput::make('feature_quality_guarantee_title_ms')->label('Title (MS)'),
                                ]),
                                Grid::make(3)->schema([
                                    Textarea::make('feature_quality_guarantee_desc_en')->label('Description (EN)'),
                                    Textarea::make('feature_quality_guarantee_desc_zh')->label('Description (ZH)'),
                                    Textarea::make('feature_quality_guarantee_desc_ms')->label('Description (MS)'),
                                ]),
                            ])->collapsible(),
                    ])->collapsible(),

                Section::make('Contact & Location Section')
                    ->schema([
                        Section::make('Business Hours')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('business_hours_title_en')->label('Title (EN)'),
                                    TextInput::make('business_hours_title_zh')->label('Title (ZH)'),
                                    TextInput::make('business_hours_title_ms')->label('Title (MS)'),
                                ]),
                                Grid::make(3)->schema([
                                    Textarea::make('business_hours_description_en')->label('Description (EN)'),
                                    Textarea::make('business_hours_description_zh')->label('Description (ZH)'),
                                    Textarea::make('business_hours_description_ms')->label('Description (MS)'),
                                ]),
                            ])->collapsible(),
                        Section::make('Contact Info')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('contact_title_en')->label('Title (EN)'),
                                    TextInput::make('contact_title_zh')->label('Title (ZH)'),
                                    TextInput::make('contact_title_ms')->label('Title (MS)'),
                                ]),
                                TextInput::make('contact_number')->label('Contact Number'),
                            ])->collapsible(),
                        Section::make('Delivery Location')
                            ->schema([
                                Grid::make(3)->schema([
                                    TextInput::make('delivery_title_en')->label('Title (EN)'),
                                    TextInput::make('delivery_title_zh')->label('Title (ZH)'),
                                    TextInput::make('delivery_title_ms')->label('Title (MS)'),
                                ]),
                                TextInput::make('delivery_location')->label('Delivery Location'),
                            ])->collapsible(),
                    ])->collapsible(),

                Section::make('Footer Section')
                    ->description('网站底部显示的信息')
                    ->schema([
                        Grid::make(3)->schema([
                            TextInput::make('footer_slogan_en')->label('Slogan (EN)'),
                            TextInput::make('footer_slogan_zh')->label('Slogan (ZH)'),
                            TextInput::make('footer_slogan_ms')->label('Slogan (MS)'),

                            TextInput::make('footer_privacy_policy_text_en')->label('Privacy Policy Text (EN)'),
                            TextInput::make('footer_privacy_policy_text_zh')->label('Privacy Policy Text (ZH)'),
                            TextInput::make('footer_privacy_policy_text_ms')->label('Privacy Policy Text (MS)'),

                            TextInput::make('footer_terms_of_service_text_en')->label('Terms of Service Text (EN)'),
                            TextInput::make('footer_terms_of_service_text_zh')->label('Terms of Service Text (ZH)'),
                            TextInput::make('footer_terms_of_service_text_ms')->label('Terms of Service Text (MS)'),

                            TextInput::make('footer_help_center_text_en')->label('Help Center Text (EN)'),
                            TextInput::make('footer_help_center_text_zh')->label('Help Center Text (ZH)'),
                            TextInput::make('footer_help_center_text_ms')->label('Help Center Text (MS)'),

                            TextInput::make('footer_all_rights_reserved_text_en')->label('All Rights Reserved Text (EN)')->columnSpan(1),
                            TextInput::make('footer_all_rights_reserved_text_zh')->label('All Rights Reserved Text (ZH)')->columnSpan(1),
                            TextInput::make('footer_all_rights_reserved_text_ms')->label('All Rights Reserved Text (MS)')->columnSpan(1),
                        ]),
                    ])->collapsible(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            // 因为是单例模式，所以只有创建和编辑页面
            'edit' => Pages\EditHomeCms::route('/{record}/edit'),
        ];
    }
}
