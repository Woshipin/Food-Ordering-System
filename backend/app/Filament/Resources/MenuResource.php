<?php
// 定义此文件所属的命名空间，用于组织和管理PHP类
namespace App\Filament\Resources;

// 引入Filament资源页面相关的类
use App\Filament\Resources\MenuResource\Pages;
// 引入Addon模型，用于数据交互
use App\Models\Addon;
// 引入Menu模型，这是此资源文件主要操作的模型
use App\Models\Menu;
// 引入Variant模型，用于数据交互
use App\Models\Variant;
// 引入Filament表单组件：文件上传
use Filament\Forms\Components\FileUpload;
// 引入Filament表单组件：网格布局
use Filament\Forms\Components\Grid;
// 引入Filament表单组件：中继器（用于一对多关系，如图片）
use Filament\Forms\Components\Repeater;
// 引入Filament表单组件：区域块
use Filament\Forms\Components\Section;
// 引入Filament表单组件：下拉选择
use Filament\Forms\Components\Select;
// 引入Filament表单组件：多行文本输入
use Filament\Forms\Components\Textarea;
// 引入Filament表单组件：单行文本输入
use Filament\Forms\Components\TextInput;
// 引入Filament表单组件：开关按钮
use Filament\Forms\Components\Toggle;
// 引入Filament核心类：表单
use Filament\Forms\Form;
// 引入Filament核心类：资源
use Filament\Resources\Resource;
// 引入Filament表格操作类
use Filament\Tables\Actions;
// 引入Filament表格列组件：图片列
use Filament\Tables\Columns\ImageColumn;
// 引入Filament表格列组件：文本列
use Filament\Tables\Columns\TextColumn;
// 引入Filament表格列组件：开关列
use Filament\Tables\Columns\ToggleColumn;
// 引入Filament核心类：表格
use Filament\Tables\Table;

// 定义MenuResource类，它代表了后台管理中的“菜单”资源
class MenuResource extends Resource
{
    // 指定此资源关联的Eloquent模型
    protected static ?string $model = Menu::class;
    // 指定在导航菜单中显示的图标（Heroicon图标库 'book-open'）
    protected static ?string $navigationIcon = 'heroicon-o-book-open';

    // 指定在导航菜单中所属的分组
    protected static ?string $navigationGroup = 'Menu Management';
    // 指定此资源在后台显示的标签名称
    protected static ?string $label = 'Menu Item';
    // 指定在导航菜单中的排序位置
    protected static ?int $navigationSort = 12;

    // 定义一个方法，用于在导航菜单旁显示一个徽章（Badge），通常是记录总数
    public static function getNavigationBadge(): ?string
    {
        // 返回Menu模型的总记录数
        return static::getModel()::count();
    }

    // 定义导航徽章的颜色
    public static function getNavigationBadgeColor(): string | array | null
    {
        // 设置徽章颜色为'success'（绿色）
        return 'success';
    }

    // 定义创建和编辑时使用的表单结构
    public static function form(Form $form): Form
    {
        // 返回表单实例并定义其结构
        return $form->schema([
            // 创建一个大的区域块，用于包含所有菜单信息
            Section::make('Menu Information')
                // 设置区域块的描述信息
                ->description('Complete menu item details, pricing, and image management')
                // 设置区域块的图标
                ->icon('heroicon-o-information-circle')
                // 定义区域块内的组件
                ->schema([
                    // 使用一个单列的网格布局来组织内部的Section
                    Grid::make(1)->schema([
                        // 创建一个用于“基本信息”的子区域块
                        Section::make('Basic Details')
                            // 设置子区域块的图标
                            ->icon('heroicon-o-document-text')
                            // 定义子区域块内的组件
                            ->schema([
                                // 使用一个两列的网格布局
                                Grid::make(2)->schema([
                                    // 创建一个文本输入框用于“菜单名称”
                                    TextInput::make('name')
                                        // 设置字段标签
                                        ->label('Menu Name')
                                        // 设置为必填项
                                        ->required()
                                        // 设置最大长度
                                        ->maxLength(255)
                                        // 设置输入框的占位符文本
                                        ->placeholder('Enter menu item name'),

                                    // 创建一个下拉选择框用于“分类”
                                    Select::make('category_id')
                                        // 设置字段标签
                                        ->label('Category')
                                        // 定义关联关系，'category'是Menu模型中的关联方法名，'name'是Category模型中要显示的字段
                                        ->relationship('category', 'name')
                                        // 启用搜索功能
                                        ->searchable()
                                        // 预加载选项，以提高用户体验
                                        ->preload()
                                        // 设置为可空
                                        ->nullable()
                                        // 设置选择框的占位符文本
                                        ->placeholder('Select a category'),
                                ]),
                                // 创建一个多行文本输入框用于“描述”
                                Textarea::make('description')
                                    // 设置字段标签
                                    ->label('Description')
                                    // 设置默认显示的行数
                                    ->rows(3)
                                    // 设置为可空
                                    ->nullable()
                                    // 设置输入框的占位符文本
                                    ->placeholder('Enter menu item description')
                                    // 让此组件占据整个父容器的宽度
                                    ->columnSpanFull(),
                            ])
                            // 设置此区域块的默认列数
                            ->columns(2)
                            // 使此区域块可以折叠/展开
                            ->collapsible(),

                        // 创建一个用于“价格与状态”的子区域块
                        Section::make('Pricing & Status')
                            // 设置子区域块的图标
                            ->icon('heroicon-o-currency-dollar')
                            // 定义子区域块内的组件
                            ->schema([
                                // 使用一个三列的网格布局
                                Grid::make(3)->schema([
                                    // 创建一个文本输入框用于“基础价格”
                                    TextInput::make('base_price')
                                        // 设置字段标签
                                        ->label('Base Price')
                                        // 限制只能输入数字
                                        ->numeric()
                                        // 设置输入框前缀
                                        ->prefix('MYR')
                                        // 设置为必填项
                                        ->required()
                                        // 设置数字输入的步长
                                        ->step(0.01)
                                        // 设置输入框的占位符文本
                                        ->placeholder('0.00'),

                                    // 创建一个文本输入框用于“促销价格”
                                    TextInput::make('promotion_price')
                                        // 设置字段标签
                                        ->label('Promotion Price')
                                        // 限制只能输入数字
                                        ->numeric()
                                        // 设置输入框前缀
                                        ->prefix('MYR')
                                        // 设置为可空
                                        ->nullable()
                                        // 设置数字输入的步长
                                        ->step(0.01)
                                        // 设置输入框的占位符文本
                                        ->placeholder('0.00')
                                        // 提供一个辅助提示文本
                                        ->helperText('Leave empty if no promotion'),

                                    // 创建一个开关按钮用于“菜单状态”
                                    Toggle::make('menu_status')
                                        // 设置字段标签
                                        ->label('Menu Status')
                                        // 设置默认值为true（开启）
                                        ->default(true)
                                        // 设置开启状态显示的图标
                                        ->onIcon('heroicon-o-check-circle')
                                        // 设置关闭状态显示的图标
                                        ->offIcon('heroicon-o-x-circle')
                                        // 设置开启状态的颜色
                                        ->onColor('success')
                                        // 设置关闭状态的颜色
                                        ->offColor('danger'),
                                ]),
                            ])
                            // 设置此区域块的默认列数
                            ->columns(3)
                            // 使此区域块可以折叠/展开
                            ->collapsible(),

                        // 创建一个用于“图片管理”的子区域块
                        Section::make('Image Management')
                            // 设置子区域块的图标
                            ->icon('heroicon-o-photo')
                            // 定义子区域块内的组件
                            ->schema([
                                // 创建一个中继器，用于管理菜单图片（一对多关系）
                                Repeater::make('images')
                                    // 设置字段标签
                                    ->label('Menu Images')
                                    // 定义关联关系，'images'是Menu模型中的关联方法名
                                    ->relationship()
                                    // 定义中继器内每个子项的表单结构
                                    ->schema([
                                        // 创建一个文件上传组件
                                        FileUpload::make('image_path')
                                            // 设置字段标签
                                            ->label('Image')
                                            // 限制只能上传图片
                                            ->image()
                                            // 启用图片编辑器
                                            ->imageEditor()
                                            // 指定图片上传后存储的目录
                                            ->directory('menu-images')
                                            // 保留原始文件名
                                            ->preserveFilenames()
                                            // 设置最大文件大小（5MB）
                                            ->maxSize(5120)
                                            // 设置为必填项
                                            ->required()
                                            // 让此组件占据整个父容器的宽度
                                            ->columnSpanFull(),
                                    ])
                                    // 设置“添加新项”按钮的标签
                                    ->addActionLabel('Add New Image')
                                    // 允许拖拽排序
                                    ->reorderable()
                                    // 允许克隆项目
                                    ->cloneable()
                                    // 使中继器本身可以折叠/展开
                                    ->collapsible()
                                    // 设置最少项目数为0
                                    ->minItems(0)
                                    // 设置最多项目数为5
                                    ->maxItems(5)
                                    // 让此组件占据整个父容器的宽度
                                    ->columnSpanFull(),
                            ])
                            // 使此区域块可以折叠/展开
                            ->collapsible()
                            // 设置默认状态为展开
                            ->collapsed(false),

                        // 创建一个用于“附加项与规格”的子区域块
                        Section::make('Add-ons & Variants')
                            // 设置子区域块的图标
                            ->icon('heroicon-o-puzzle-piece')
                            // 定义子区域块内的组件
                            ->schema([
                                // [已修改] 创建一个下拉选择框用于“附加项” (多对多关系)
                                Select::make('addon_ids')
                                    // 设置字段标签
                                    ->label('Add-ons')
                                    // 允许多选
                                    ->multiple()
                                    // 启用搜索功能
                                    ->searchable()
                                    // 预加载选项
                                    ->preload()
                                    // 定义关联关系
                                    ->relationship(
                                        name: 'addons', // Menu模型中的关联方法名
                                        titleAttribute: 'name', // Addon模型中要显示的字段
                                        // [核心修改] 使用闭包来修改关联查询，只获取状态为启用的附加项
                                        modifyQueryUsing: fn ($query) => $query->where('addon_status', true)
                                    ),

                                // [已修改] 创建一个下拉选择框用于“规格” (多对多关系)
                                Select::make('variant_ids')
                                    // 设置字段标签
                                    ->label('Variants')
                                    // 允许多选
                                    ->multiple()
                                    // 启用搜索功能
                                    ->searchable()
                                    // 预加载选项
                                    ->preload()
                                    // 定义关联关系
                                    ->relationship(
                                        name: 'variants', // Menu模型中的关联方法名
                                        titleAttribute: 'name', // Variant模型中要显示的字段
                                        // [核心修改] 使用闭包来修改关联查询，只获取状态为启用的规格
                                        modifyQueryUsing: fn ($query) => $query->where('variant_status', true)
                                    ),
                            ])
                            // 设置此区域块的默认列数
                            ->columns(2)
                            // 使此区域块可以折叠/展开
                            ->collapsible(),
                    ]),
                ])
                // 让此最外层Section占据整个表单宽度
                ->columnSpanFull()
                // 使其可以折叠/展开
                ->collapsible()
                // 记忆折叠状态，下次打开页面时保持上次的状态
                ->persistCollapsed(),
        ]);
    }

    // 定义资源列表页面的表格结构
    public static function table(Table $table): Table
    {
        // 返回表格实例并配置
        return $table
            // 定义表格数据查询，并预加载关联数据以避免N+1问题
            ->query(Menu::with(['images', 'category', 'addons', 'variants']))
            // 定义表格的列
            ->columns([
                // 创建一个文本列用于显示ID
                TextColumn::make('id')
                    // 设置列标题
                    ->label('ID')
                    // 允许排序
                    ->sortable()
                    // 设置此列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 创建一个图片列
                ImageColumn::make('first_image')
                    // 设置列的标题
                    ->label('Image')
                    // 自定义获取状态（图片URL）的逻辑
                    ->getStateUsing(function (Menu $record): ?string {
                        // 获取菜单的第一张图片
                        $firstImage = $record->images->first();
                        // 如果图片存在且路径不为空
                        if ($firstImage && $firstImage->image_path) {
                            // 返回图片的公共访问URL，并处理文件名中的空格
                            return asset('storage/' . str_replace(' ', '%20', $firstImage->image_path));
                        }
                        // 如果没有图片，返回null
                        return null;
                    })
                    // 设置图片显示的尺寸
                    ->size(60)
                    // 设置默认图片URL，当没有图片时显示
                    ->defaultImageUrl(asset('images/placeholder.png'))
                    // 设置鼠标悬停时的提示文本
                    ->tooltip(function (Menu $record): ?string {
                        // 获取图片总数
                        $imageCount = $record->images()->count();
                        // 根据图片数量返回不同的提示信息
                        return $imageCount > 1 ? "Total: {$imageCount} images" : ($imageCount === 1 ? "1 image" : "No images");
                    }),

                // 创建一个文本列用于显示名称
                TextColumn::make('name')
                    // 设置列标题
                    ->label('Name')
                    // 允许在此列上进行搜索
                    ->searchable()
                    // 允许在此列上进行排序
                    ->sortable()
                    // 当文本过长时自动换行
                    ->wrap(),

                // 创建一个文本列用于显示分类名称
                TextColumn::make('category.name')
                    // 设置列标题
                    ->label('Category')
                    // 以徽章（Badge）样式显示
                    ->badge()
                    // 允许排序
                    ->sortable()
                    // 设置徽章颜色
                    ->color('primary')
                    // 当没有分类时显示的占位符
                    ->placeholder('No Category'),

                // 创建一个文本列用于显示基础价格
                TextColumn::make('base_price')
                    // 设置列标题
                    ->label('Base Price')
                    // 以货币格式（MYR）显示
                    ->money('MYR')
                    // 允许排序
                    ->sortable()
                    // 内容右对齐
                    ->alignEnd(),

                // 创建一个文本列用于显示促销价格
                TextColumn::make('promotion_price')
                    // 设置列标题
                    ->label('Promo Price')
                    // 以货币格式（MYR）显示
                    ->money('MYR')
                    // 允许排序
                    ->sortable()
                    // 内容右对齐
                    ->alignEnd()
                    // 当没有促销价时显示的占位符
                    ->placeholder('—')
                    // 设置文本颜色
                    ->color('success'),

                // 创建一个开关列用于显示和修改菜单状态
                ToggleColumn::make('menu_status')
                    ->label('Status'),

                // 创建一个文本列用于显示附加项列表
                TextColumn::make('addons_list')
                    // 设置列标题
                    ->label('Add-ons')
                    // 允许渲染HTML内容
                    ->html()
                    // 自定义获取状态（显示的HTML）的逻辑
                    ->getStateUsing(function (Menu $record): string {
                        // 获取所有附加项
                        $addons = $record->addons;
                        // 定义最多显示的限制数量
                        $limit = 5;
                        // 获取前5个附加项，并将它们映射为HTML徽章字符串
                        $displayAddons = $addons->take($limit)->map(fn($addon) =>
                            "<span class='inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1'>{$addon->name}</span>"
                        )->implode('');
                        // 如果附加项总数超过限制
                        if ($addons->count() > $limit) {
                            // 在末尾添加一个省略号徽章
                            $displayAddons .= "<span class='inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1'>...</span>";
                        }
                        // 返回最终的HTML字符串
                        return $displayAddons;
                    })
                    // 以徽章（Badge）样式显示
                    ->badge()
                    // 允许排序
                    ->sortable()
                    // 设置徽章颜色
                    ->color('primary')
                    // 当没有分类时显示的占位符
                    ->placeholder('No Add On')
                    // 设置列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 创建一个文本列用于显示规格列表
                TextColumn::make('variants_list')
                    // 设置列标题
                    ->label('Variants')
                    // 允许渲染HTML内容
                    ->html()
                    // 自定义获取状态（显示的HTML）的逻辑
                    ->getStateUsing(function (Menu $record): string {
                        // 获取所有规格
                        $variants = $record->variants;
                        // 定义最多显示的限制数量
                        $limit = 5;
                        // 获取前5个规格，并将它们映射为HTML徽章字符串
                        $displayVariants = $variants->take($limit)->map(fn($variant) =>
                            "<span class='inline-block bg-success-100 text-success-700 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1'>{$variant->name}</span>"
                        )->implode('');
                        // 如果规格总数超过限制
                        if ($variants->count() > $limit) {
                             // 在末尾添加一个省略号徽章
                            $displayVariants .= "<span class='inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mb-1'>...</span>";
                        }
                        // 返回最终的HTML字符串
                        return $displayVariants;
                    })
                    // 以徽章（Badge）样式显示
                    ->badge()
                    // 允许排序
                    ->sortable()
                    // 设置徽章颜色
                    ->color('primary')
                    // 当没有分类时显示的占位符
                    ->placeholder('No Variant')
                    // 设置列可以被用户在界面上显示或隐藏
                    ->toggleable(),

                // 创建一个文本列用于显示描述
                TextColumn::make('description')
                    // 设置列标题
                    ->label('Description')
                    // 限制显示的字符数为50
                    ->limit(50)
                    // 当内容被截断时，鼠标悬停显示完整内容
                    ->tooltip(fn(TextColumn $column): ?string => strlen($column->getState()) <= 50 ? null : $column->getState())
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),

                // 创建一个文本列用于显示图片数量
                TextColumn::make('images_count')
                    // 设置列标题
                    ->label('Images')
                    // 自动计算'images'关联模型的数量
                    ->counts('images')
                    // 以徽章样式显示
                    ->badge()
                    // 设置徽章颜色
                    ->color('info')
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),

                // 创建一个文本列用于显示创建时间
                TextColumn::make('created_at')
                    // 设置列标题
                    ->label('Created At')
                    // 以日期时间格式显示
                    ->dateTime()
                    // 允许排序
                    ->sortable()
                    // 设置此列可以被用户隐藏，并且默认是隐藏的
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            // 定义行操作（每一行记录末尾的操作按钮）
            ->actions([
                // 查看操作，以模态框形式打开，并设置模态框宽度
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
            // 设置表格的默认排序字段和顺序
            ->defaultSort('created_at', 'desc')
            // 启用斑马纹（交替行颜色）样式
            ->striped()
            // 配置分页选项
            ->paginated([10, 25, 50, 100]);
    }

    // 定义此资源关联的页面和路由
    public static function getPages(): array
    {
        // 返回一个页面路由映射数组
        return [
            // 'index' 对应列表页面
            'index'  => Pages\ListMenus::route('/'),
            // 'create' 对应创建页面
            'create' => Pages\CreateMenu::route('/create'),
            // 'edit' 对应编辑页面，'{record}' 是一个路由参数
            'edit'   => Pages\EditMenu::route('/{record}/edit'),
        ];
    }
}
