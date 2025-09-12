<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactCmsResource\Pages;
use App\Models\ContactCms;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;

class ContactCmsResource extends Resource
{
    protected static ?string $model = ContactCms::class;

    protected static ?string $navigationIcon = 'heroicon-o-phone-arrow-up-right';
    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'Contact Management System';
    // [优化] 按照Filament最佳实践，label应为单数形式
    protected static ?string $label = 'Contact CMS';
    // [优化] 添加复数形式的标签，用于页面标题等位置
    protected static ?string $pluralLabel = 'Contact CMS';
    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 5;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回ContactCMS模型的总记录数作为徽章内容
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
        $parameters['record'] = ContactCms::first()->id;

        // Always return the URL for the 'edit' page
        return parent::getUrl('edit', $parameters, $isAbsolute, $panel, $tenant);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Contact Section')
                ->schema([
                    Grid::make(3)->schema([
                        TextInput::make('contact_title_en')->label('Title (EN)'),
                        TextInput::make('contact_title_zh')->label('Title (ZH)'),
                        TextInput::make('contact_title_ms')->label('Title (MS)'),
                    ]),
                    Grid::make(3)->schema([
                        Textarea::make('contact_description_en')->label('Description (EN)'),
                        Textarea::make('contact_description_zh')->label('Description (ZH)'),
                        Textarea::make('contact_description_ms')->label('Description (MS)'),
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
            'edit' => Pages\EditContactCms::route('/{record}/edit'),
        ];
    }

}
