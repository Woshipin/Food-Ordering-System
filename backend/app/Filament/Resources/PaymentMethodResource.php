<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentMethodResource\Pages;
use App\Models\PaymentMethod;
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

class PaymentMethodResource extends Resource
{
    protected static ?string $model = PaymentMethod::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Shop Configuration';

    protected static ?string $slug = 'payment-methods';

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
                // 大 Section
                Section::make('Payment Method Details')
                    ->description('Configure the details for this payment method.')
                    ->collapsible()
                    ->schema([
                        // Grid 布局
                        Grid::make(2)->schema([
                            TextInput::make('display_name')
                                ->label('Display Name')
                                ->required()
                                ->maxLength(255),

                            TextInput::make('name')
                                ->label('Internal Name (Slug)')
                                ->required()
                                ->unique(ignoreRecord: true)
                                ->maxLength(50)
                                ->helperText('A unique identifier (e.g., "credit_card").'),

                            Textarea::make('description')
                                ->label('Description')
                                ->columnSpanFull(),

                            TextInput::make('icon_name')
                                ->label('Icon Name')
                                ->required()
                                ->maxLength(50)
                                ->helperText('Enter a valid icon name from Lucide (e.g., "CreditCard", "Wallet").'),

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

                // IconColumn 可以直接在表格中渲染出图标，非常酷！
                IconColumn::make('icon_name')
                    ->icon(function (string $state): string {
                        $iconName = Str::kebab($state);

                        $iconMap = [
                            'banknote' => 'banknotes',
                            'smartphone' => 'device-phone-mobile',
                            'store' => 'building-storefront',
                            'utensils-crossed' => 'building-storefront',
                        ];

                        return 'heroicon-o-' . ($iconMap[$iconName] ?? $iconName);
                    })
                    ->color('primary')
                    ->label('Icon Preview'),

                TextColumn::make('name')
                    ->searchable()
                    ->color('gray'),

                ToggleColumn::make('is_active')
                    ->label('Status'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListPaymentMethods::route('/'),
            'create' => Pages\CreatePaymentMethod::route('/create'),
            'edit' => Pages\EditPaymentMethod::route('/{record}/edit'),
        ];
    }
}
