<?php
// 定义此文件所属的命名空间，用于组织和管理PHP类
namespace App\Filament\Resources;

// 引入此资源的页面管理类（如列表、创建、编辑页面）
use App\Filament\Resources\CategoryResource\Pages;
// 引入Category模型，这是此资源文件操作的主要数据模型
use App\Models\Category;
// 引入Filament核心类：表单
use Filament\Forms\Form;
// 引入Filament核心类：资源
use Filament\Resources\Resource;
// 引入Filament核心类：表格
use Filament\Tables;
// 引入Filament核心类：表格的另一个引用方式
use Filament\Tables\Table;

// 引入Filament表单组件：区域块，用于组织表单内容
use Filament\Forms\Components\Section;
// 引入Filament表单组件：单行文本输入
use Filament\Forms\Components\TextInput;
// 引入Filament表格列组件：文本列
use Filament\Tables\Columns\TextColumn;

// 定义CategoryResource类，它代表后台管理中的“分类”资源
class CategoryResource extends Resource
{
    // 指定此资源关联的Eloquent模型
    protected static ?string $model = Category::class;

    // 指定在导航菜单中显示的图标（Heroicon图标库的 "tag" 图标）
    protected static ?string $navigationIcon = 'heroicon-o-tag';
    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'Category Management';
    // [优化] 按照Filament最佳实践，label应为单数形式
    protected static ?string $label = 'Category';
    // [优化] 添加复数形式的标签，用于页面标题等位置
    protected static ?string $pluralLabel = 'Categories';
    // 指定在导航菜单分组中的排序位置
    protected static ?int $navigationSort = 9;

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

    // 定义创建和编辑时使用的表单结构
    public static function form(Form $form): Form
    {
        // 返回表单实例并定义其内容和布局
        return $form
            // 定义表单的schema（结构）
            ->schema([
                // 创建一个名为“Category Info”的区域块
                Section::make('Category Info')
                    // 定义此区域块内的表单组件
                    ->schema([
                        // 创建一个文本输入框用于“分类名称”
                        TextInput::make('name')
                            // 设置字段标签
                            ->label('Category Name')
                            // 设置为必填项
                            ->required()
                            // 设置最大输入长度
                            ->maxLength(100)
                            // 设置输入框的占位符文本
                            ->placeholder('Enter category name'),
                    ])
                    // 设置此区域块内的布局为1列（虽然是默认值，但明确写出更清晰）
                    ->columns(1)
            ]);
    }

    // 定义资源列表页面的表格结构
    public static function table(Table $table): Table
    {
        // 返回表格实例并配置
        return $table
            // 禁用表格行的默认点击行为（默认点击会进入编辑页），所有操作通过右侧按钮进行
            ->recordUrl(null)
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

                // 创建一个文本列用于显示分类名称
                TextColumn::make('name')
                    // 设置列的标题
                    ->label('Category Name')
                    // 允许在此列上进行搜索
                    ->searchable()
                    // 允许在此列上进行排序
                    ->sortable(),

                // 创建一个文本列用于显示创建时间
                TextColumn::make('created_at')
                    // 设置列的标题
                    ->label('Created')
                    // 以 "日 月 年, 时:分" 的格式显示日期时间
                    ->dateTime('d M Y, H:i')
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 创建一个文本列用于显示更新时间
                TextColumn::make('updated_at')
                    // 设置列的标题
                    ->label('Updated')
                    // 以相对时间格式显示（例如："2 hours ago"）
                    ->since()
                    // 允许在此列上进行排序
                    ->sortable()
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            // 定义表格的过滤器（此处为空，但保留了结构以便将来添加）
            ->filters([
                //
            ])
            // 定义行操作（每一行记录末尾的操作按钮）
            ->actions([
                // [优化] 查看操作，在模态框中打开，提供更好的用户体验
                Tables\Actions\ViewAction::make(),
                // 编辑操作
                Tables\Actions\EditAction::make(),
                // 删除操作
                Tables\Actions\DeleteAction::make(),
            ])
            // 定义批量操作（选中多行后可以执行的操作）
            ->bulkActions([
                // 创建一个操作组
                Tables\Actions\BulkActionGroup::make([
                    // 批量删除操作
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            // [优化] 添加默认排序，让最新创建的分类显示在最前面
            ->defaultSort('created_at', 'desc')
            // [优化] 启用斑马纹（交替行颜色）样式，使表格更易读
            ->striped();
    }

    // 定义此资源关联的Relation Manager（用于在编辑/查看页面显示关联数据表格）
    public static function getRelations(): array
    {
        // 此处为空，因为分类没有需要在此管理的直接子关联
        return [];
    }

    // 定义此资源关联的页面和对应的路由
    public static function getPages(): array
    {
        // 返回一个页面路由映射数组
        return [
            // 'index' 对应列表页面，路由为'/'
            'index' => Pages\ListCategories::route('/'),
            // 'create' 对应创建页面，路由为'/create'
            'create' => Pages\CreateCategory::route('/create'),
            // 'edit' 对应编辑页面，路由为'/{record}/edit'，其中{record}是记录的ID
            'edit' => Pages\EditCategory::route('/{record}/edit'),
        ];
    }

    // 定义此资源可用于全局搜索的属性
    public static function getGloballySearchableAttributes(): array
    {
        // 返回一个包含可搜索字段的数组，这里是 'name' 字段
        return ['name'];
    }
}
