<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AboutUsCmsResource\Pages;
use App\Models\AboutUsCms;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Resources\Resource;

class AboutUsCmsResource extends Resource
{
    protected static ?string $model = AboutUsCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-information-circle';
    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'About Us CMS Management';
    // [优化] 按照Filament最佳实践，label应为单数形式
    protected static ?string $label = 'About Us CMS';
    // [优化] 添加复数形式的标签，用于页面标题等位置
    protected static ?string $pluralLabel = 'About Us CMS';
    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 1;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Category模型的总记录数作为徽章内容
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        // 设置徽章颜色为'success'（绿色）
        return 'success';
    }

    public static function getUrl(string $name = 'index', array $parameters = [], bool $isAbsolute = true, ?string $panel = null, ?\Illuminate\Database\Eloquent\Model $tenant = null): string
    {
        // Set the parameters for the edit route
        $parameters['record'] = AboutUsCms::first()->id;

        // Always return the URL for the 'edit' page
        return parent::getUrl('edit', $parameters, $isAbsolute, $panel, $tenant);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Hero Section')
                ->schema([
                    Grid::make(3)->schema([
                        TextInput::make('hero_title_en')->label('Title (EN)'),
                        TextInput::make('hero_title_zh')->label('Title (ZH)'),
                        TextInput::make('hero_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('hero_description_en')->label('Description (EN)'),
                        Textarea::make('hero_description_zh')->label('Description (ZH)'),
                        Textarea::make('hero_description_ms')->label('Description (MS)'),
                    ]),
                ])->collapsible(),

            Section::make('Story Section')
                ->schema([
                    FileUpload::make('story_image')->image()->columnSpanFull(),
                    Grid::make(3)->schema([
                        TextInput::make('story_title_en')->label('Title (EN)'),
                        TextInput::make('story_title_zh')->label('Title (ZH)'),
                        TextInput::make('story_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('story_description_en')->label('Description (EN)'),
                        Textarea::make('story_description_zh')->label('Description (ZH)'),
                        Textarea::make('story_description_ms')->label('Description (MS)'),
                    ]),
                ])->collapsible(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'edit' => Pages\EditAboutUsCms::route('/{record}/edit'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return true;
    }
}
