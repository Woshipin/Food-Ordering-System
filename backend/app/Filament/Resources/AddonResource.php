<?php
// 定义此文件所属的命名空间，用于组织和管理PHP类
namespace App\Filament\Resources;

// 引入此资源的页面管理类（如列表、创建、编辑页面）
use App\Filament\Resources\AddonResource\Pages;
// 引入Addon模型，这是此资源文件操作的主要数据模型
use App\Models\Addon;
// 引入Filament核心类：表单
use Filament\Forms\Form;
// 引入Filament核心类：表格
use Filament\Tables\Table;
// 引入Filament核心类：资源
use Filament\Resources\Resource;
// 引入Filament表单组件：网格布局
use Filament\Forms\Components\Grid;
// 引入Filament表单组件：区域块，用于组织表单内容
use Filament\Forms\Components\Section;
// 引入Filament表单组件：单行文本输入
use Filament\Forms\Components\TextInput;
// 引入Filament表单组件：开关按钮
use Filament\Forms\Components\Toggle;
// 引入Filament表格操作集合
use Filament\Tables\Actions;
// 引入Filament表格列组件：文本列
use Filament\Tables\Columns\TextColumn;
// 引入Filament表格列组件：开关列
use Filament\Tables\Columns\ToggleColumn;

// 定义AddonResource类，它代表后台管理中的“附加项”资源
class AddonResource extends Resource
{
    // 指定此资源关联的Eloquent模型
    protected static ?string $model = Addon::class;

    // 指定在导航菜单中显示的图标（Heroicon图标库的 "puzzle-piece" 图标）
    protected static ?string $navigationIcon = 'heroicon-o-puzzle-piece';
    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'Menu Management';
    // 指定此资源在后台显示的标签名称
    protected static ?string $label = 'Addon';
    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 1;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Addon模型的总记录数作为徽章内容
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        // 设置徽章颜色为'success'（绿色）
        return 'success';
    }

    // 定义创建和编辑时使用的表单结构
    public static function form(Form $form): Form
    {
        // 返回表单实例并定义其内容和布局
        return $form->schema([
            // 创建一个名为“Addon Details”的区域块
            Section::make('Addon Details')
                // 设置区域块的描述信息
                ->description('Enter the details for the menu addon.')
                // 设置区域块的图标
                ->icon('heroicon-o-information-circle')
                // 定义区域块内的表单组件
                ->schema([
                    // 使用一个三列的网格布局来组织组件
                    Grid::make(3)->schema([
                        // 创建一个文本输入框用于“附加项名称”
                        TextInput::make('name')
                            // 设置字段标签
                            ->label('Addon Name')
                            // 设置为必填项
                            ->required()
                            // 设置最大输入长度
                            ->maxLength(255)
                            // 设置输入框的占位符文本
                            ->placeholder('e.g., Extra Cheese')
                            // 设置此组件在网格中占据1列
                            ->columnSpan(1),

                        // 创建一个文本输入框用于“价格”
                        TextInput::make('price')
                            // 设置字段标签
                            ->label('Price')
                            // 设置为必填项
                            ->required()
                            // 限制只能输入数字
                            ->numeric()
                            // 设置输入框的前缀
                            ->prefix('MYR')
                            // 设置数字输入的步长（例如，用于上下箭头调整数值）
                            ->step(0.01)
                            // 设置输入框的占位符文本
                            ->placeholder('0.00')
                            // 设置此组件在网格中占据1列
                            ->columnSpan(1),

                        // 创建一个开关按钮用于“附加项状态”
                        Toggle::make('addon_status')
                            // 设置字段标签
                            ->label('Status')
                            // 提供一个辅助提示文本
                            ->helperText('Enable/disable this addon')
                            // 设置默认值为true（开启）
                            ->default(true)
                            // 设置开启状态显示的图标
                            ->onIcon('heroicon-o-check-circle')
                            // 设置关闭状态显示的图标
                            ->offIcon('heroicon-o-x-circle')
                            // 设置开启状态的颜色
                            ->onColor('success')
                            // 设置关闭状态的颜色
                            ->offColor('danger')
                            // 设置标签和开关是否在同一行显示（false表示不在同一行）
                            ->inline(false)
                            // 设置此组件在网格中占据1列
                            ->columnSpan(1),
                    ]),
                ])
                // 使此区域块可以被用户折叠/展开
                ->collapsible(),
        ]);
    }

    // 定义资源列表页面的表格结构
    public static function table(Table $table): Table
    {
        // 返回表格实例并配置
        return $table
            // 定义表格的列
            ->columns([
                // 创建一个文本列用于显示ID
                TextColumn::make('id')
                    // 设置列的标题
                    ->label('ID')
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 创建一个文本列用于显示名称
                TextColumn::make('name')
                    // 设置列的标题
                    ->label('Name')
                    // 允许在此列上进行搜索
                    ->searchable()
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置字体粗细为中等
                    ->weight('medium')
                    // 当文本过长时自动换行
                    ->wrap(),

                // 创建一个文本列用于显示价格
                TextColumn::make('price')
                    // 设置列的标题
                    ->label('Price')
                    // 以货币格式（MYR）显示
                    ->money('MYR')
                    // 允许在此列上进行排序
                    ->sortable()
                    // 内容右对齐
                    ->alignEnd(),

                // 创建一个开关列用于显示和修改附加项状态
                ToggleColumn::make('addon_status')
                    // 设置列的标题
                    ->label('Status')
                    // 设置开启状态的图标
                    ->onIcon('heroicon-o-check-circle')
                    // 设置关闭状态的图标
                    ->offIcon('heroicon-o-x-circle')
                    // 设置开启状态的颜色
                    ->onColor('success')
                    // 设置关闭状态的颜色
                    ->offColor('danger')
                    // 允许在此列上进行排序
                    ->sortable()
                    // [优化] 定义点击开关时的操作，直接更新数据库记录的状态
                    ->action(fn(Addon $record) => $record->update(['addon_status' => !$record->addon_status]))
                    // [优化] 增加鼠标悬停提示，提升用户体验
                    ->tooltip(fn(Addon $record): string => $record->addon_status ? '当前为启用状态，点击禁用' : '当前为禁用状态，点击启用'),


                // 创建一个文本列用于显示创建时间
                TextColumn::make('created_at')
                    // 设置列的标题
                    ->label('Created At')
                    // 以日期时间格式显示
                    ->dateTime()
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),

                // 创建一个文本列用于显示更新时间
                TextColumn::make('updated_at')
                    // 设置列的标题
                    ->label('Updated At')
                    // 以日期时间格式显示
                    ->dateTime()
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            // 定义表格的过滤器（此处为空，但保留了结构以便将来添加）
            ->filters([
                // 如果需要，可以在这里添加过滤器
            ])
            // 定义行操作（每一行记录末尾的操作按钮）
            ->actions([
                // 查看操作
                Actions\ViewAction::make(),
                // 编辑操作
                Actions\EditAction::make(),
                // 删除操作
                Actions\DeleteAction::make(),
            ])
            // 定义批量操作（选中多行后可以执行的操作）
            ->bulkActions([
                // 创建一个操作组
                Actions\BulkActionGroup::make([
                    // 批量删除操作
                    Actions\DeleteBulkAction::make(),
                ]),
            ])
            // 设置表格的默认排序字段和顺序（按创建时间降序）
            ->defaultSort('created_at', 'desc')
            // 启用斑马纹（交替行颜色）样式，使表格更易读
            ->striped();
    }

    // 定义此资源关联的Relation Manager（用于在编辑/查看页面显示关联数据表格，如此处不需要，则为空数组）
    public static function getRelations(): array
    {
        // 如果需要，可以在这里定义关联管理器
        return [];
    }

    // 定义此资源关联的页面和对应的路由
    public static function getPages(): array
    {
        // 返回一个页面路由映射数组
        return [
            // 'index' 对应列表页面，路由为'/'
            'index' => Pages\ListAddons::route('/'),
            // 'create' 对应创建页面，路由为'/create'
            'create' => Pages\CreateAddon::route('/create'),
            // 'edit' 对应编辑页面，路由为'/{record}/edit'，其中{record}是记录的ID
            'edit' => Pages\EditAddon::route('/{record}/edit'),
        ];
    }
}
