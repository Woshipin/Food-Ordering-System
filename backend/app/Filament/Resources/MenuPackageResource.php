<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MenuPackageResource\Pages;
use App\Models\MenuPackage;
use Filament\Forms\Components\FileUpload;
// 我们不再需要 Grid 和 Group，所以可以移除它们的 use 语句，不过留着也无妨
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class MenuPackageResource extends Resource
{
    protected static ?string $model = MenuPackage::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    // --- 导航优化 ---
    protected static ?string $navigationGroup = 'Menu Package Management';
    protected static ?int $navigationSort = 4;

    // --- 标签优化 ---
    protected static ?string $modelLabel = 'Menu Package';
    protected static ?string $pluralModelLabel = 'Menu Packages';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Manage Menu Package')
                    ->description('Fill in all the required information to create or update a package.')
                    ->schema([
                        // *** 修改开始 ***
                        // 移除了 Grid 和 Group，将四个 Section 直接放在这里

                        // Section 1: 套餐基本信息
                        Section::make('Basic Details')
                            ->schema([
                                TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true),
                                Textarea::make('description')
                                    ->rows(4)
                                    ->nullable(),
                            ]),

                        // Section 2: 价格与库存
                        Section::make('Pricing & Stock')
                            ->schema([
                                TextInput::make('price')
                                    ->label('Package Price')
                                    ->numeric()
                                    ->prefix('MYR')
                                    ->step(0.01)
                                    ->required(),
                                TextInput::make('quantity')
                                    ->label('Available Quantity')
                                    ->numeric()
                                    ->nullable(),
                                Toggle::make('status')
                                    ->label('Is Package Active?')
                                    ->helperText('Inactive packages will not be visible to customers.')
                                    ->default(true),
                            ]),

                        // Section 3: 图片与状态
                        Section::make('Visuals & Status')
                            ->schema([
                                // 提醒：如果您的图片实际在'images'目录，请将下面的 'menu-packages' 改为 'images'
                                FileUpload::make('image')
                                    ->image()
                                    ->directory('menu-packages')
                                    ->imageEditor()
                                    ->nullable(),
                            ]),

                        // Section 4: 套餐内容
                        Section::make('Select Menus')
                            ->schema([
                                Select::make('menus')
                                    ->label('Included Menus')
                                    ->relationship(name: 'menus', titleAttribute: 'name', modifyQueryUsing: fn ($query) => $query->where('menu_status', true))
                                    ->multiple()
                                    ->preload()
                                    ->searchable()
                                    ->required(),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->query(MenuPackage::with(['menus.addons', 'menus.variants']))
            ->columns([
                TextColumn::make('id')->sortable()->toggleable(),
                TextColumn::make('name')->searchable()->sortable(),
                ImageColumn::make('image')->disk('public')->label('Image')->height(50)->width(50)->circular(),
                TextColumn::make('description')->limit(30)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('price')->money('MYR')->sortable(),
                TextColumn::make('quantity')->sortable()->toggleable(isToggledHiddenByDefault: true),
                ToggleColumn::make('status')->label('Active'),

                TextColumn::make('menus_list')
                    ->label('Menus')
                    ->html()
                    ->getStateUsing(function (MenuPackage $record): string {
                        $menus = $record->menus;
                        if ($menus->isEmpty()) {
                            return '-';
                        }
                        $limit = 3;
                        $displayMenus = $menus->take($limit)->map(fn($menu) =>
                            "<span class='inline-block border border-amber-600 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>{$menu->name}</span>"
                        )->implode('');
                        if ($menus->count() > $limit) {
                            $displayMenus .= "<span class='inline-block border border-gray-500 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>...</span>";
                        }
                        return $displayMenus;
                    })
                    ->badge()
                    ->color('primary')
                    ->placeholder('No Menus')
                    ->toggleable(),

                TextColumn::make('addons_list')
                    ->label('Add-ons')
                    ->html()
                    ->getStateUsing(function (MenuPackage $record): string {
                        $addons = $record->menus->flatMap->addons->unique('id');
                        if ($addons->isEmpty()) {
                            return '-';
                        }
                        $limit = 3;
                        $displayAddons = $addons->take($limit)->map(fn($addon) =>
                            "<span class='inline-block border border-amber-600 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>{$addon->name}</span>"
                        )->implode('');
                        if ($addons->count() > $limit) {
                            $displayAddons .= "<span class='inline-block border border-gray-500 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>...</span>";
                        }
                        return $displayAddons;
                    })
                    ->badge()
                    ->color('primary')
                    ->placeholder('No Add-ons')
                    ->toggleable(),

                TextColumn::make('variants_list')
                    ->label('Variants')
                    ->html()
                    ->getStateUsing(function (MenuPackage $record): string {
                        $variants = $record->menus->flatMap->variants->unique('id');
                        if ($variants->isEmpty()) {
                            return '-';
                        }
                        $limit = 3;
                        $displayVariants = $variants->take($limit)->map(fn($variant) =>
                            "<span class='inline-block border border-amber-600 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>{$variant->name}</span>"
                        )->implode('');
                        if ($variants->count() > $limit) {
                            $displayVariants .= "<span class='inline-block border border-gray-500 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-md mr-1 mb-1'>...</span>";
                        }
                        return $displayVariants;
                    })
                    ->badge()
                    ->color('primary')
                    ->placeholder('No Variants')
                    ->toggleable(),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\DeleteBulkAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMenuPackages::route('/'),
            'create' => Pages\CreateMenuPackage::route('/create'),
            'edit' => Pages\EditMenuPackage::route('/{record}/edit'),
        ];
    }
}
