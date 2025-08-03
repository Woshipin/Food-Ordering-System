<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ServiceMethodResource\Pages;
use App\Models\ServiceMethod;
use Illuminate\Support\Str;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;

class ServiceMethodResource extends Resource
{
    protected static ?string $model = ServiceMethod::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck'; // 使用 Heroicon

    protected static ?string $navigationGroup = 'Cart Management';

    // [优化] 按照Filament最佳实践，label应为单数形式
    protected static ?string $label = 'Service Method';

    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 15;

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
                Section::make('Service Details')
                    ->description('Configure the details for this service method.')
                    ->collapsible()
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('display_name')
                                ->label('Display Name')
                                ->required()
                                ->maxLength(255)
                                ->helperText('This is the name shown to customers.'),

                            TextInput::make('name')
                                ->label('Internal Name (Slug)')
                                ->required()
                                ->unique(ignoreRecord: true)
                                ->maxLength(50)
                                ->helperText('A unique identifier for system use (e.g., "delivery"). No spaces or special characters.'),

                            Textarea::make('description')
                                ->label('Description')
                                ->columnSpanFull()
                                ->helperText('A short description of the service.'),

                            TextInput::make('details')
                                ->label('Details Text')
                                ->maxLength(255)
                                ->helperText('Optional text for fees or special notes (e.g., "Delivery fee: RM8.00").'),

                            TextInput::make('fee')
                                ->label('Fee')
                                ->numeric()
                                ->required()
                                ->prefix('RM')
                                ->default(0.00),

                            // --- 关键改进：引导用户输入正确的 Heroicon 名称 ---
                            TextInput::make('icon_name')
                                ->label('Icon Name')
                                ->required()
                                ->maxLength(50)
                                ->helperText('Enter a valid icon name from the Heroicons set (e.g., "truck", "store", "credit-card").'),

                            Toggle::make('is_active')
                                ->label('Active')
                                ->required()
                                ->default(true)
                                ->helperText('Inactive methods will not be shown to customers.'),
                        ]),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('display_name')
                    ->searchable()
                    ->sortable(),

                // --- 关键改进：使用 Heroicons 并包含智能映射 ---
                IconColumn::make('icon_name')
                    ->icon(function (string $state): string {
                        // 将数据库中的值转为 kebab-case (e.g., "DisplayName" -> "display-name")
                        $iconName = Str::kebab($state);

                        // 定义一个映射，用于将简单的名称转换为特定的 Heroicon 名称
                        // 这使得用户可以输入 "store"，系统会自动使用 "building-storefront"
                        $iconMap = [
                            'banknote' => 'banknotes',
                            'smartphone' => 'device-phone-mobile',
                            'store' => 'building-storefront',
                            'utensils-crossed' => 'building-storefront',
                        ];

                        // 使用 heroicon-o- 前缀，并优先使用映射中的值
                        return 'heroicon-o-' . ($iconMap[$iconName] ?? $iconName);
                    })
                    ->color('primary')
                    ->label('Icon Preview'),

                TextColumn::make('name')
                    ->searchable()
                    ->color('gray'),

                TextColumn::make('fee')
                    ->money('MYR')
                    ->sortable(),

                ToggleColumn::make('is_active')
                    ->label('Status'),

                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
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
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListServiceMethods::route('/'),
            'create' => Pages\CreateServiceMethod::route('/create'),
            'edit' => Pages\EditServiceMethod::route('/{record}/edit'),
        ];
    }
}
