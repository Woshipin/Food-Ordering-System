<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MenuPackageResource\Pages;
use App\Models\MenuPackage;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class MenuPackageResource extends Resource
{
    protected static ?string $model = MenuPackage::class;

    protected static ?string $navigationIcon = 'heroicon-o-gift';
    protected static ?string $navigationGroup = 'Menu Management';
    protected static ?int $navigationSort = 13;

    protected static ?string $modelLabel = 'Menu Package';
    protected static ?string $pluralModelLabel = 'Menu Packages';

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
        // 你的 form 方法是正确的，这里保持不变
        return $form
            ->schema([
                Section::make('Package Details')
                    ->description('Provide the basic information for the package.')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255),

                        Select::make('category_id')
                            ->relationship('category', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->label('Category'),

                        Textarea::make('description')
                            ->rows(4)
                            ->nullable(),
                    ]),

                Section::make('Pricing & Stock')
                    ->description('Set the pricing and available stock.')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('base_price')
                                ->label('Base Price')
                                ->numeric()
                                ->prefix('MYR')
                                ->step(0.01)
                                ->required(),

                            TextInput::make('promotion_price')
                                ->label('Promotion Price')
                                ->numeric()
                                ->prefix('MYR')
                                ->step(0.01)
                                ->helperText('Optional. If set, this price will be used.')
                                ->nullable(),
                        ]),

                        TextInput::make('quantity')
                            ->label('Available Quantity')
                            ->numeric()
                            ->helperText('Leave empty for unlimited quantity.')
                            ->nullable(),
                    ]),

                Section::make('Package Contents & Visuals')
                    ->schema([
                        Select::make('menus')
                            ->label('Included Menus')
                            ->relationship(
                                name: 'menus',
                                titleAttribute: 'name',
                                modifyQueryUsing: fn (Builder $query) => $query->where('menus.menu_status', true)
                            )
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->required(),

                        FileUpload::make('image')
                            ->image()
                            ->directory('menu-packages')
                            ->imageEditor()
                            ->nullable(),

                        Toggle::make('menu_package_status')
                            ->label('Package Active')
                            ->helperText('Inactive packages will not be visible to customers.')
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            // 优化1: 预加载所有需要的关联数据，避免 N+1 查询问题
            ->query(MenuPackage::with(['category', 'menus.addons', 'menus.variants']))
            ->columns([

                // 创建一个文本列用于显示ID
                TextColumn::make('id')
                    // 设置列的标题
                    ->label('ID')
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 基础信息列
                ImageColumn::make('image')
                    ->disk('public') // 确保 storage:link 已运行
                    ->label('Image'), // 隐藏标签，让它更紧凑

                TextColumn::make('name')
                    // ->description(fn (MenuPackage $record): string => $record->description ?: 'No description')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->sortable()
                    ->searchable(),

                // 价格列 (拆分显示)
                TextColumn::make('base_price')
                    ->label('Base Price')
                    ->money('MYR')
                    ->sortable(),

                TextColumn::make('promotion_price')
                    ->label('Promo Price')
                    ->money('MYR')
                    ->sortable()
                    ->placeholder('N/A') // 如果没有促销价则显示 N/A
                    ->color(fn ($state) => $state ? 'success' : 'gray'), // 有促销价时显示绿色

                // 库存和状态列
                TextColumn::make('quantity')
                    ->label('Stock')
                    ->sortable()
                    ->placeholder('Unlimited'),

                ToggleColumn::make('menu_package_status')
                    ->label('Active'),

                // 关联数据列 (菜单, Addons, Variants)
                TextColumn::make('menus.name')
                    ->label('Included Menus')
                    ->badge()
                    ->listWithLineBreaks()
                    ->limitList(3) // 使用 limitList 来限制显示的条目数
                    ->expandableLimitedList(), // 点击可展开查看全部

                TextColumn::make('addons')
                    ->label('Available Add-ons')
                    ->badge()
                    ->color('info')
                    ->listWithLineBreaks()
                    ->limitList(3)
                    ->expandableLimitedList()
                    // 核心逻辑: 从所有菜单中收集所有附加项，去重后提取名称
                    ->getStateUsing(function (MenuPackage $record): Collection {
                        return $record->menus->flatMap->addons->unique('id')->pluck('name');
                    }),

                TextColumn::make('variants')
                    ->label('Available Variants')
                    ->badge()
                    ->color('warning')
                    ->listWithLineBreaks()
                    ->limitList(3)
                    ->expandableLimitedList()
                    // 核心逻辑: 从所有菜单中收集所有规格项，去重后提取名称
                    ->getStateUsing(function (MenuPackage $record): Collection {
                        return $record->menus->flatMap->variants->unique('id')->pluck('name');
                    }),
            ])
            ->filters([
                // 这里可以添加过滤器，例如按分类过滤
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
