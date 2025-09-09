<?php

// 定义此文件所属的命名空间，用于组织和管理代码
namespace App\Filament\Resources;

// 引入 OrderResource 页面相关的类
use App\Filament\Resources\OrderResource\Pages;
// 引入 OrderResource 关联管理器相关的类
use App\Filament\Resources\OrderResource\RelationManagers;
// 引入 Order 模型，这是此资源文件操作的主要数据模型
use App\Models\Order;
// 引入 Filament 表单相关的类
use Filament\Forms;
// 引入 Filament 表单的 Form 类
use Filament\Forms\Form;
// 引入 Filament 的核心资源类
use Filament\Resources\Resource;
// 引入 Filament 表格相关的类
use Filament\Tables;
// 引入 Filament 表格的 Table 类
use Filament\Tables\Table;
// 引入 Eloquent 查询构建器，用于数据库查询
use Illuminate\Database\Eloquent\Builder;
// 引入软删除作用域
use Illuminate\Database\Eloquent\SoftDeletingScope;
// 引入表格中用于显示文本的列组件
use Filament\Tables\Columns\TextColumn;

// 定义 Order 资源的类，继承自 Filament 的基础资源类
class OrderResource extends Resource
{
    // 指定此资源对应的 Eloquent 模型
    protected static ?string $model = Order::class;

    // 指定在导航菜单中显示的图标（使用 heroicon-o-shopping-cart 图标）
    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';

    // --- 新增代码开始 ---
    // 定义一个静态方法，用于在导航菜单项旁显示一个徽章（Badge）
    public static function getNavigationBadge(): ?string
    {
        // 返回当前模型（Order）的总记录数作为徽章的文本内容
        return static::getModel()::count();
    }

    // 定义一个静态方法，用于设置导航徽章的颜色
    public static function getNavigationBadgeColor(): string|array|null
    {
        // 返回 'success'，这通常会显示为青色或绿色
        return 'success';
    }
    // --- 新增代码结束 ---

    // 定义基础的 Eloquent 查询，用于获取资源数据
    public static function getEloquentQuery(): Builder
    {
        // 调用父类的查询，并使用 with('user') 预加载 'user' 关联，以避免 N+1 查询问题
        return parent::getEloquentQuery()->with(['user']);
    }

    // 定义用于创建和编辑记录的表单结构（当前为空，因为您没有提供表单字段）
    public static function form(Form $form): Form
    {
        // 返回表单实例
        return $form
            // 定义表单的字段布局
            ->schema([
                // 在这里定义表单字段，例如 TextInput, Select 等
            ]);
    }

    // 定义资源列表页面显示的表格结构
    public static function table(Table $table): Table
    {
        // 返回表格实例
        return $table
            // 定义表格的列
            ->columns([
                // 定义第一列：订单号
                TextColumn::make('order_number')->label('Order Number')->sortable()->searchable(),
                // 定义第二列：顾客名称，通过 user 关联获取 name
                TextColumn::make('user.name')->label('Customer Name')->sortable()->searchable(),
                // 定义第三列：订单状态
                TextColumn::make('status')
                    ->label('Order Status') // 设置列的显示标签
                    ->badge() // 将此列显示为徽章样式
                    ->color(fn (string $state): string => match ($state) { // 根据状态值动态设置徽章颜色
                        'completed' => 'success', // 'completed' 状态为绿色
                        'processing' => 'warning', // 'processing' 状态为黄色
                        'pending' => 'primary', // 'pending' 状态为蓝色
                        'cancelled' => 'danger', // 'cancelled' 状态为红色
                        default => 'gray', // 其他状态为灰色
                    })
                    ->sortable(), // 允许按此列排序
                // 定义第四列：支付状态
                TextColumn::make('payment_status')
                    ->label('Payment Status') // 设置列的显示标签
                    ->badge() // 将此列显示为徽章样式
                    ->color(fn (string $state): string => match ($state) { // 根据状态值动态设置徽章颜色
                        'paid' => 'success', // 'paid' 状态为绿色
                        'unpaid' => 'warning', // 'unpaid' 状态为黄色
                        default => 'gray', // 其他状态为灰色
                    })
                    ->sortable(), // 允许按此列排序
                // 定义第五列：服务方式
                TextColumn::make('service_method')->label('Service Method')->sortable(),
                // 定义第六列：总金额
                TextColumn::make('total_amount')->label('Total Amount')->money('MYR')->sortable(),
                // 定义第七列：下单日期
                TextColumn::make('created_at')->label('Order Date')->dateTime()->sortable(),
            ])
            // 定义表格的过滤器（当前为空）
            ->filters([
                // 在这里定义过滤器，例如 SelectFilter
            ])
            // 定义每行记录可执行的操作
            ->actions([
                Tables\Actions\ViewAction::make(), // 添加“查看”操作
                Tables\Actions\EditAction::make(), // 添加“编辑”操作
                Tables\Actions\DeleteAction::make(), // 添加“删除”操作
            ])
            // 定义可对多条记录执行的批量操作
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([ // 创建一个批量操作组
                    Tables\Actions\DeleteBulkAction::make(), // 添加“批量删除”操作
                ]),
            ]);
    }

    // 定义与此资源相关的关联管理器（当前为空）
    public static function getRelations(): array
    {
        // 返回一个空数组，表示没有关联管理器
        return [
            //
        ];
    }

    // 定义此资源包含的页面及其路由
    public static function getPages(): array
    {
        // 返回页面和路由的映射数组
        return [
            // 'index' 键定义了列表页面的路由和对应的类
            'index' => Pages\ListOrders::route('/'),
            // 'create' 键定义了创建页面的路由和对应的类
            'create' => Pages\CreateOrder::route('/create'),
            // 'edit' 键定义了编辑页面的路由和对应的类
            'edit' => Pages\EditOrder::route('/{record}/edit'),
            // 'view' 键定义了查看页面的路由和对应的类
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}