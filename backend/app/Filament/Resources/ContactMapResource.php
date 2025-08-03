<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactMapResource\Pages;
use App\Filament\Resources\ContactMapResource\RelationManagers;
use App\Models\ContactMap;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ContactMapResource extends Resource
{
    protected static ?string $model = ContactMap::class;

    protected static ?string $navigationIcon = 'heroicon-o-map';

    protected static ?string $navigationGroup = 'Contact Management System';

    protected static ?int $navigationSort = 7;

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

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Contact Map')
                    ->schema([
                        Forms\Components\Textarea::make('map_iframe_url')
                            ->label('Map Iframe URL')
                            ->required(),
                    ])
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getUrl(string $name = 'index', array $parameters = [], bool $isAbsolute = true, ?string $panel = null, ?\Illuminate\Database\Eloquent\Model $tenant = null): string
    {
        $map = \App\Models\ContactMap::first();

        if ($map) {
            $parameters['record'] = $map->id;
            return parent::getUrl('edit', $parameters, $isAbsolute, $panel, $tenant);
        }

        return parent::getUrl('create', $parameters, $isAbsolute, $panel, $tenant);
    }

    public static function getPages(): array
    {
        return [
            'create' => Pages\CreateContactMap::route('/create'),
            'edit' => Pages\EditContactMap::route('/{record}/edit'),
        ];
    }
}
