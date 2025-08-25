// @/app/cart/lib/lib.ts
// 这个文件定义了购物车页面所需的所有TypeScript类型和接口。
// 将类型定义分离到单独的文件中可以使主组件文件更清晰，也便于在其他文件中重用这些类型。

// 定义了菜单项附加选项的结构
export interface Addon {
    addon_name: string;      // 附加选项的名称
    addon_price: number;     // 附加选项的价格
}

// 定义了菜单项规格（如大小、辣度）的结构
export interface Variant {
    variant_name: string;    // 规格的名称
    variant_price: number;   // 规格的附加价格
}

// 定义了购物车中单个菜单项的结构
export interface CartMenuItem {
    id: number;                      // 菜单项在购物车中的唯一ID
    menu_name: string;               // 菜单项的名称
    base_price: number;              // 菜单项的基础价格
    promotion_price?: number;        // 菜单项的促销价格（可选）
    quantity: number;                // 菜单项的数量
    menu_description: string;        // 菜单项的描述
    addons: Addon[];                 // 附加选项列表
    variants: Variant[];             // 规格列表
    image_url?: string | null;       // 菜单项的图片URL（可选）
    category_name?: string;          // 菜单项所属的分类名称（可选）
}

// 定义了套餐中包含的菜单项的结构
export interface CartPackageItemMenu {
    id: number;          // 套餐中菜单项的ID
    menu_name: string;   // 菜单项的名称
    addons: Addon[];     // 附加选项列表
    variants: Variant[]; // 规格列表
}

// 定义了购物车中套餐的结构
export interface CartPackageItem {
    id: number;                      // 套餐在购物车中的唯一ID
    package_name: string;            // 套餐的名称
    package_price: number;           // 套餐的价格
    promotion_price?: number;        // 套餐的促销价格（可选）
    quantity: number;                // 套餐的数量
    package_description: string;     // 套餐的描述
    menus: CartPackageItemMenu[];    // 套餐中包含的菜单项列表
    package_image?: string | null;   // 套餐的图片URL（可选）
    category_name?: string;          // 套餐所属的分类名称（可选）
}

// 定义了整个购物车数据的结构
export interface CartData {
    id: number;                      // 购物车的唯一ID
    user_id: number;                 // 所属用户的ID
    menu_items: CartMenuItem[];      // 购物车中的菜单项列表
    package_items: CartPackageItem[];// 购物车中的套餐列表
}

// 定义了服务方式（如外卖、自取）的结构
export interface ServiceMethod {
    name: string;            // 服务方式的内部名称（如 'delivery'）
    display_name: string;    // 服务方式的显示名称（如 'Delivery'）
    description: string;     // 服务方式的描述
    details: string;         // 服务方式的额外详情
    fee: number | string;    // 服务费用
    icon_name: string;       // 用于显示的图标名称
}

// 定义了支付方式（如信用卡、在线支付）的结构
export interface PaymentMethod {
    name: string;            // 支付方式的内部名称
    display_name: string;    // 支付方式的显示名称
    description: string;     // 支付方式的描述
    icon_name: string;       // 用于显示的图标名称
}

// 定义了用户地址的结构
export interface Address {
    id: number;              // 地址的唯一ID
    name: string;            // 收货人姓名
    phone: string;           // 联系电话
    address: string;         // 详细地址
    building?: string;       // 楼栋号（可选）
    floor?: string;          // 楼层（可选）
    is_default: boolean;     // 是否为默认地址
    latitude: string;        // 纬度
    longitude: string;       // 经度
}

// ==========================================================
//  ↓↓↓ 核心修改区域 (已更新) ↓↓↓
// ==========================================================

// 定义了当前订单的结构（用于显示桌位状态信息）
export interface CurrentOrder {
  order_id: number;
  order_number: string;
  table_status: 'pending' | 'completed' | 'cancelled'; // 移除了 'seated' 状态，因为桌位状态会反映这一点
  guests_count: number;
  checkin_time?: string;
  checkout_time?: string;
  dining_date?: string;
  auto_extend_count: number;
  total_extended_minutes: number;
}

// 定义了倒计时信息的结构
export interface Countdown {
  minutes_until_checkin: number;
  checkin_time_formatted: string;
}

// 定义了桌位的结构
export interface Table {
  id: number;
  table_code: string;  // 修正：将 'name' 修改为 'table_code' 以匹配后端API
  description: string;
  capacity: number;
  location: string;
  is_available: boolean;  // 桌位的物理可用性
  status: 'available' | 'pending' | 'seated' | 'maintenance';  // 当前显示状态
  status_text: string;  // 状态的中文描述
  available_for_booking: boolean;  // 是否可以预订
  current_order?: CurrentOrder;  // 当前活跃订单信息（如果有）
  countdown?: Countdown;  // 倒计时信息（pending状态时）
}

// ==========================================================
//  ↑↑↑ 核心修改区域 (已更新) ↑↑↑
// ==========================================================

// 新增：定义了时间段的结构，用于堂食预订
export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_available?: boolean; // 可选字段，由前端基于日期和现有预订动态计算
}