<?php

namespace App\Filament\Resources;

// 引入所需的类
use App\Filament\Resources\ContactInfoResource\Pages;
use App\Models\ContactInfo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
// 新增：引入 Filament 表单工具类 Get 和 Set，用于动态交互
use Filament\Forms\Get;
use Filament\Forms\Set;
// 新增：引入 Guzzle HTTP 客户端和 Log 门面，用于 API 请求和日志记录
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ContactInfoResource extends Resource
{
    protected static ?string $model = ContactInfo::class;
    protected static ?string $navigationIcon = 'heroicon-o-identification';
    protected static ?string $navigationGroup = 'Contact Management System';
    protected static ?int $navigationSort = 6;

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    // 定义表单结构
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Contact Information')
                    ->schema([
                        Forms\Components\Grid::make(2)->schema([
                            Forms\Components\Select::make('type')
                                ->options([
                                    'phone' => 'Phone',
                                    'email' => 'Email',
                                    'address' => 'Address',
                                    'hours' => 'Hours',
                                ])
                                ->required()
                                // 新增：live() 使该字段的更改能够被表单实时捕获，从而动态显示/隐藏其他字段
                                ->live(),

                            Forms\Components\TextInput::make('value')
                                ->label('Value / Address') // 修改标签以更清晰地指示地址输入
                                ->required()
                                // 新增：在失去焦点时触发实时更新
                                ->live(onBlur: true)
                                // 新增：当该字段的值更新后执行的钩子
                                ->afterStateUpdated(function (Get $get, Set $set, ?string $state) {
                                    // 检查类型是否为 'address' 并且地址输入不为空
                                    if ($get('type') === 'address' && filled($state)) {
                                        // 调用私有方法获取坐标
                                        $coordinates = static::getCoordinatesForAddress($state);
                                        if ($coordinates) {
                                            // 如果成功获取坐标，则使用 Set 工具填充经纬度字段
                                            $set('latitude', $coordinates['latitude']);
                                            $set('longitude', $coordinates['longitude']);
                                        }
                                    }
                                }),
                        ]),

                        // 新增：经纬度输入框的网格布局
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('latitude')
                                    ->numeric() // 限制为数字输入
                                    ->readOnly(), // 设置为只读，因为它是自动填充的
                                Forms\Components\TextInput::make('longitude')
                                    ->numeric()
                                    ->readOnly(),
                            ])
                            // 新增：动态控制该网格的可见性
                            // 只有当 'type' 字段的值为 'address' 时，这个网格（包含经纬度字段）才可见
                            ->visible(fn (Get $get): bool => $get('type') === 'address'),

                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('label_en')->label('Label (EN)'),
                            Forms\Components\TextInput::make('label_zh')->label('Label (ZH)'),
                            Forms\Components\TextInput::make('label_ms')->label('Label (MS)'),
                        ]),
                        Forms\Components\Grid::make(3)->schema([
                            Forms\Components\TextInput::make('note_en')->label('Note (EN)'),
                            Forms\Components\TextInput::make('note_zh')->label('Note (ZH)'),
                            Forms\Components\TextInput::make('note_ms')->label('Note (MS)'),
                        ]),
                    ])
            ]);
    }

    // 定义表格列
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\IconColumn::make('type')
                    ->icon(fn (string $state): string => match ($state) {
                        'phone' => 'heroicon-o-phone',
                        'email' => 'heroicon-o-envelope',
                        'address' => 'heroicon-o-map-pin',
                        'hours' => 'heroicon-o-clock',
                        default => 'heroicon-o-question-mark-circle',
                    })
                   ->color('warning'),
                Tables\Columns\TextColumn::make('value')->searchable(),
                Tables\Columns\TextColumn::make('label_en')->searchable(),
                // 新增：在表格中显示经纬度，并使其可排序
                Tables\Columns\TextColumn::make('latitude')->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('longitude')->sortable()->toggleable(isToggledHiddenByDefault: true),
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
            'index' => Pages\ListContactInfos::route('/'),
            'create' => Pages\CreateContactInfo::route('/create'),
            'edit' => Pages\EditContactInfo::route('/{record}/edit'),
        ];
    }

    /**
     * 新增：根据地址字符串获取地理坐标 (经纬度) 的私有静态方法。
     * 使用 OpenStreetMap 的 Nominatim API。
     *
     * @param string $address 要查询的地址。
     * @return array|null 如果成功，返回包含 'latitude' 和 'longitude' 的数组，否则返回 null。
     */
    private static function getCoordinatesForAddress(string $address): ?array
    {
        // 如果地址为空，直接返回 null
        if (empty($address)) {
            return null;
        }

        $client = new Client(); // 创建一个新的 Guzzle HTTP 客户端实例
        try { // 使用 try-catch 块来捕获可能发生的请求异常
            // 发送 GET 请求到 Nominatim API
            $response = $client->get('https://nominatim.openstreetmap.org/search', [
                'query' => [
                    'q' => $address, // 要搜索的地址
                    'format' => 'json', // 返回 JSON 格式
                    'limit' => 1 // 只返回最匹配的一个结果
                ],
                'headers' => [
                    // 设置 User-Agent 是 Nominatim API 的使用要求
                    'User-Agent' => 'YourAppName/1.0 (your-contact-email@example.com)',
                ],
                'timeout' => 10, // 设置请求超时时间为 10 秒
            ]);

            // 解码 JSON 响应
            $data = json_decode($response->getBody(), true);

            // 检查数据是否有效并包含经纬度
            if (!empty($data) && isset($data[0]['lat'], $data[0]['lon'])) {
                return [
                    'latitude' => $data[0]['lat'],
                    'longitude' => $data[0]['lon'],
                ];
            }
        } catch (\Exception $e) {
            // 如果请求失败，记录错误日志
            Log::error('Nominatim API geocoding failed: ' . $e->getMessage());
        }

        // 如果失败，返回 null
        return null;
    }
}
