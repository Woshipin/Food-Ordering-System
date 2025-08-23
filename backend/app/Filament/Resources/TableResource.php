<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TableResource\Pages;
use App\Models\Table as TableModel; // 使用别名以避免与Filament\Tables\Table类名冲突
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

// 引入所需的表单组件
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select; // 引入 Select 以处理外键

// 引入所需的表格列组件
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;

class TableResource extends Resource
{
    // 指定此资源关联的Eloquent模型
    protected static ?string $model = TableModel::class;

    // 指定在导航菜单中显示的图标（heroicon-o-table-cells 是一个很形象的图标）
    protected static ?string $navigationIcon = 'heroicon-o-table-cells';
    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'Cart Management';
    // 单数形式的标签
    protected static ?string $label = 'Table';
    // 复数形式的标签
    protected static ?string $pluralLabel = 'Tables';
    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 17;

    // 定义一个方法，用于在导航菜单旁显示记录总数徽章
    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    // 定义创建和编辑时使用的表单结构
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                // 创建一个名为“Table Details”的区域块
                Section::make('Table Details')
                    ->description('Fill in the basic information about the table.')
                    ->schema([
                        // 1. 字段名修正：'name' -> 'table_code'
                        TextInput::make('table_code')
                            ->label('Table Code')
                            ->required()
                            ->maxLength(50)
                            ->placeholder('e.g., A01'),

                        // 可容纳人数
                        TextInput::make('capacity')
                            ->label('Capacity')
                            ->required()
                            ->numeric() // 确保输入是数字
                            ->minValue(1) // 最小容量为1
                            ->placeholder('Enter the number of seats'),

                        // 描述
                        TextInput::make('description')
                            ->label('Description')
                            ->maxLength(255) // Textarea更合适，但按要求保留TextInput
                            ->nullable()
                            ->placeholder('e.g., By the window'),

                        // 位置
                        TextInput::make('location')
                            ->label('Location')
                            ->maxLength(100)
                            ->nullable()
                            ->placeholder('e.g., Patio Area'),

                        // 是否可用 (使用Toggle开关，用户体验更好)
                        Toggle::make('is_available')
                            ->label('Is Available')
                            ->required()
                            ->default(true), // 默认值为true，与数据库迁移一致
                    ])
                    ->columns(2), // 将表单布局设置为2列，让界面更紧凑
            ]);
    }

    // 定义资源列表页面的表格结构
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                // ID列
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),

                // 1. 字段名修正：'name' -> 'table_code'
                TextColumn::make('table_code')
                    ->label('Table Code')
                    ->searchable()
                    ->sortable(),

                // 可容纳人数列
                TextColumn::make('capacity')
                    ->label('Capacity')
                    ->sortable()
                    ->alignCenter(), // 居中显示数字

                // 位置列
                TextColumn::make('location')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // 默认隐藏此列

                // 是否可用列 (按要求保留 ToggleColumn)
                ToggleColumn::make('is_available')
                    ->label('Available')
                    ->sortable(),

                // 创建时间列
                TextColumn::make('created_at')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // 默认隐藏

                // 更新时间列
                TextColumn::make('updated_at')
                    ->since() // 使用相对时间，如 '2 hours ago'
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                // 这里可以添加过滤器，例如按“是否可用”过滤
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
            ])
            ->defaultSort('id', 'asc') // 默认按ID升序排列
            ->striped(); // 启用斑马纹样式
    }

    // ... 其余方法保持不变 ...

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTables::route('/'),
            'create' => Pages\CreateTable::route('/create'),
            'edit' => Pages\EditTable::route('/{record}/edit'),
        ];
    }
}
