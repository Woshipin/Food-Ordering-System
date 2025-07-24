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
                        Section::make('Package Contents')
                            ->schema([
                                Select::make('menus')
                                    ->label('Included Menus')
                                    ->relationship('menus', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->searchable()
                                    ->required(),
                            ]),

                        // *** 修改结束 ***
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    // 设置列标题
                    ->label('ID')
                    // 允许排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),
                TextColumn::make('name')->searchable()->sortable(),
                ImageColumn::make('image')
                    ->disk('public')
                    ->label('Image')
                    ->height(50)
                    ->width(50)
                    ->circular(),
                TextColumn::make('description')->limit(30),
                TextColumn::make('price')->money('MYR')->sortable(),
                TextColumn::make('menus_count')
                    ->counts('menus')
                    ->label('Items')
                    ->sortable(),
                TextColumn::make('quantity')->sortable(),
                ToggleColumn::make('status')->label('Active'),
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
