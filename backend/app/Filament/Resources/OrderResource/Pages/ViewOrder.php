<?php

// 定义此文件所属的命名空间
namespace App\Filament\Resources\OrderResource\Pages;

// 引入所属的资源类 OrderResource
use App\Filament\Resources\OrderResource;
// 引入 Filament 查看记录页面的基类
use Filament\Resources\Pages\ViewRecord;
// 引入 Filament 的信息列表（Infolist）类，用于展示信息
use Filament\Infolists\Infolist;
// 引入信息列表中的文本条目组件
use Filament\Infolists\Components\TextEntry;
// 引入信息列表中的区域（Section）组件，并重命名以避免冲突
use Filament\Infolists\Components\Section as InfolistSection;
// 引入信息列表中的网格（Grid）组件，并重命名以避免冲突
use Filament\Infolists\Components\Grid as InfolistGrid;
// 引入信息列表中的视图（View）条目组件，用于加载自定义的 Blade 视图
use Filament\Infolists\Components\ViewEntry;

// 定义查看订单页面的类，继承自 Filament 的 ViewRecord 基类
class ViewOrder extends ViewRecord
{
    // 指定此页面属于哪个资源
    protected static string $resource = OrderResource::class;

    // 指定此页面使用的 Blade 视图文件（如果需要自定义布局）
    protected static string $view = 'filament.resources.order-resource.pages.view-order';

    // 定义信息列表的结构和内容
    public function infolist(Infolist $infolist): Infolist
    {
        // 返回一个信息列表实例
        return $infolist
            // 绑定当前正在查看的记录数据
            ->record($this->record)
            // 定义信息列表的整体结构
            ->schema([
                // 第一个主要区域：订单详情
                InfolistSection::make('Order Details')
                    ->columnSpanFull() // 让这个区域占据全部可用列宽
                    ->schema([
                        // 在这个区域内创建一个4列的网格布局
                        InfolistGrid::make(4)
                            ->schema([
                                // 网格中的第一个子区域：订单信息
                                InfolistSection::make('Order Information')
                                    ->schema([
                                        // 显示订单号
                                        TextEntry::make('order_number'),
                                        // 显示订单状态，并使用徽章样式
                                        TextEntry::make('status')->badge()->color(fn (string $state): string => match ($state) {
                                            'completed' => 'success', // 'completed' 状态为绿色
                                            'processing' => 'warning', // 'processing' 状态为黄色
                                            'pending' => 'primary', // 'pending' 状态为蓝色
                                            'cancelled' => 'danger', // 'cancelled' 状态为红色
                                            default => 'gray', // 其他状态为灰色
                                        }),
                                        // 显示创建时间，并格式化为日期时间
                                        TextEntry::make('created_at')->dateTime(),
                                    ])->columnSpan(1)->grow(false), // 此子区域占据1列，并且不自动增长宽度

                                // 网格中的第二个子区域：顾客信息
                                InfolistSection::make('Customer Information')
                                    ->schema([
                                        // 显示顾客名称
                                        TextEntry::make('user.name'),
                                        // 显示顾客邮箱
                                        TextEntry::make('user.email'),
                                    ])->columnSpan(1)->grow(false), // 此子区域占据1列，并且不自动增长宽度

                                // 网格中的第三个子区域：支付与服务信息
                                InfolistSection::make('Payment & Service')
                                    ->schema([
                                        // 显示支付状态，并使用徽章样式
                                        TextEntry::make('payment_status')->badge()->color(fn (string $state): string => match ($state) {
                                            'paid' => 'success', // 'paid' 状态为绿色
                                            'unpaid' => 'warning', // 'unpaid' 状态为黄色
                                            default => 'gray', // 其他状态为灰色
                                        }),
                                        // 显示支付方式
                                        TextEntry::make('payment_method'),
                                        // 显示服务方式
                                        TextEntry::make('service_method'),
                                    ])->columnSpan(1)->grow(false), // 此子区域占据1列，并且不自动增长宽度

                                // 网格中的第四个子区域：服务详情（内容根据服务方式动态生成）
                                InfolistSection::make('Service Details')
                                    ->schema(function ($record) { // 使用闭包动态定义此区域的结构
                                        // 根据当前记录的 'service_method' 字段的值进行判断
                                        switch ($record->service_method) {
                                            case 'delivery': // 如果是配送服务
                                                return [
                                                    TextEntry::make('delivery_name')->label('Recipient Name'), // 显示收件人姓名
                                                    TextEntry::make('delivery_phone')->label('Recipient Phone'), // 显示收件人电话
                                                    TextEntry::make('delivery_address')->label('Delivery Address'), // 显示配送地址
                                                ];
                                            case 'pickup': // 如果是自提服务
                                                return [
                                                    TextEntry::make('pickup_time')->label('Pickup Time')->dateTime(), // 显示自提时间
                                                ];
                                            case 'dine_in': // 如果是堂食服务
                                                return [
                                                    TextEntry::make('table.table_number')->label('Table Number'), // 显示桌号
                                                    TextEntry::make('guests_count')->label('Number of Guests'), // 显示客人数量
                                                    TextEntry::make('dining_date')->label('Dining Date')->date(), // 显示用餐日期
                                                    TextEntry::make('checkin_time')->label('Check-in Time'), // 显示签到时间
                                                ];
                                            default: // 如果是其他情况
                                                return []; // 不显示任何内容
                                        }
                                    })->columnSpan(1)->grow(false), // 此子区域占据1列，并且不自动增长宽度
                            ])->extraAttributes(['class' => 'h-full']), // 给网格添加额外的 HTML 属性，确保高度一致
                    ]),

                // 第二个主要区域：订单项目
                InfolistGrid::make(1)->schema([ // 创建一个单列网格
                    InfolistSection::make('Order Items')
                        ->schema([
                            // 使用 ViewEntry 加载一个自定义的 Blade 视图来显示订单项目列表
                            ViewEntry::make('orderItems')->view('filament.infolists.components.order-items-list')
                        ]),
                ]),

                // 第三个主要区域：价格信息
                InfolistGrid::make(1)->schema([ // 创建一个单列网格
                    InfolistSection::make('Pricing')
                        ->schema([
                            // 在这个区域内创建一个4列的网格
                            InfolistGrid::make(4)->schema([
                                // 显示小计金额，并添加金色的图标
                                TextEntry::make('subtotal')->money('myr')->icon('heroicon-o-shopping-bag')->iconColor('warning'),
                                // 显示运费，并添加金色的图标
                                TextEntry::make('delivery_fee')->money('myr')->icon('heroicon-o-truck')->iconColor('warning'),
                                // 显示折扣金额，并添加金色的图标
                                TextEntry::make('discount_amount')->money('myr')->icon('heroicon-o-receipt-refund')->iconColor('warning'),
                                // 显示总金额，加粗字体，并添加金色的图标
                                TextEntry::make('total_amount')->money('myr')->weight('bold')->icon('heroicon-o-credit-card')->iconColor('warning'),
                            ])
                        ])
                ])
            ]);
    }
}