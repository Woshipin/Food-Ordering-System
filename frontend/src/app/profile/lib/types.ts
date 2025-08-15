// --- 地址相关的类型定义 ---
export interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  building?: string;
  floor?: string;
  is_default: boolean;
}

// --- 订单相关的类型定义 ---

// 订单中的附加项
export interface OrderAddon {
  id: number;
  addon_name: string;
  addon_price: number;
}

// 订单中的规格
export interface OrderVariant {
  id: number;
  variant_name: string;
  variant_price: number;
}

// 订单中的单个菜单项
export interface OrderMenuItem {
  id: number;
  menu_name: string;
  menu_description: string | null;
  image_url: string | null;
  category_name: string | null;
  quantity: number;
  item_total: number;
  addons: OrderAddon[];
  variants: OrderVariant[];
}

// 订单中套餐内包含的菜单项
export interface OrderPackageItemMenu {
  id: number;
  menu_name: string;
  quantity: number;
  addons: OrderAddon[];
  variants: OrderVariant[];
}

// 订单中的套餐项
export interface OrderPackageItem {
  id: number;
  package_name: string;
  package_description: string | null;
  package_image: string | null;
  category_name: string | null;
  quantity: number;
  item_total: number;
  menus: OrderPackageItemMenu[];
}

// 完整的订单对象
export interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  menu_items: OrderMenuItem[];
  package_items: OrderPackageItem[];
}