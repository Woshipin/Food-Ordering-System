// @/app/cart/steps/Step1.tsx
// 这个文件代表结账流程的第一步：查看和管理购物车中的商品。

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import Image from 'next/image';
import { CartData, CartMenuItem, CartPackageItem } from '../lib/lib';
import { Icon, getFullImageUrl, calculateItemTotal, calculatePackageTotal, handleUpdateMenuQuantity, handleUpdatePackageQuantity } from '../function/cartfunction';

// 定义Step1组件需要接收的props类型
interface Step1Props {
  cartData: CartData | null;
  setCartData: React.Dispatch<React.SetStateAction<CartData | null>>;
}

// 显示商品规格和附加项的详细信息组件
const ItemDetails = ({ item, type }: { item: CartMenuItem | CartPackageItem; type: 'menu' | 'package' }) => (
    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-3 space-y-2">
      {type === 'menu' ? (
        <>
          {(item as CartMenuItem).variants.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong className="text-orange-700">规格:</strong>
              {(item as CartMenuItem).variants.map((v, i) => ( <div key={i} className="ml-2">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</div> ))}
            </div>
          )}
          {(item as CartMenuItem).addons.length > 0 && (
            <div className="text-xs text-gray-600">
              <strong className="text-orange-700">附加项:</strong>
              {(item as CartMenuItem).addons.map((a, i) => ( <div key={i} className="ml-2">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</div> ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-medium text-orange-700 mb-2">套餐包含:</p>
          {(item as CartPackageItem).menus.map(menu => (
            <div key={menu.id} className="text-xs text-gray-600">
              <strong>{menu.menu_name}</strong>
              {menu.variants.map((v, i) => ( <div key={i} className="ml-2 text-gray-500">- {v.variant_name} (+RM{Number(v.variant_price).toFixed(2)})</div> ))}
              {menu.addons.map((a, i) => ( <div key={i} className="ml-2 text-gray-500">- {a.addon_name} (+RM{Number(a.addon_price).toFixed(2)})</div> ))}
            </div>
          ))}
        </>
      )}
    </div>
);

// 商品卡片组件，用于显示单个菜单项或套餐
const ItemCard = ({ item, type, isReadOnly = false, cartData, setCartData }: { item: CartMenuItem | CartPackageItem; type: 'menu' | 'package', isReadOnly?: boolean, cartData: CartData | null, setCartData: React.Dispatch<React.SetStateAction<CartData | null>> }) => {
    // 处理数量变化的函数
    const handleQuantityChange = (newQuantity: number) => {
      if (isReadOnly) return; // 如果是只读模式（如在确认页面），则不执行任何操作
      const id = type === 'menu' ? (item as CartMenuItem).id : (item as CartPackageItem).id;
      
      // 调用从 cartfunction.tsx 导入的函数来更新状态
      const updatedCart = type === 'menu'
          ? handleUpdateMenuQuantity(id, newQuantity, cartData)
          : handleUpdatePackageQuantity(id, newQuantity, cartData);
      
      setCartData(updatedCart); // 设置新的购物车状态
  };

  const hasDetails = type === 'menu' ? 
    ((item as CartMenuItem).variants.length > 0 || (item as CartMenuItem).addons.length > 0) : 
    ((item as CartPackageItem).menus.some(m => m.variants.length > 0 || m.addons.length > 0));

  return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
              <div className="relative md:w-48 w-full h-48 md:h-auto flex-shrink-0 bg-gray-100">
                  <Image
                      src={getFullImageUrl(type === 'menu' ? (item as CartMenuItem).image_url : (item as CartPackageItem).package_image)}
                      alt={type === 'menu' ? (item as CartMenuItem).menu_name : (item as CartPackageItem).package_name}
                      fill
                      className="object-contain p-2"
                  />
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                      <div className="flex items-baseline gap-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">
                              {type === 'menu' ? (item as CartMenuItem).menu_name : (item as CartPackageItem).package_name}
                          </h4>
                          {item.category_name && (
                              <Badge variant="outline" className="border-orange-300 text-orange-600 bg-orange-50 text-xs">
                                  {item.category_name}
                              </Badge>
                          )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {type === 'menu' ? (item as CartMenuItem).menu_description : (item as CartPackageItem).package_description}
                      </p>
                      
                      {(hasDetails || type === 'package') && <ItemDetails item={item} type={type} />}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                      <div className="text-xl font-bold text-orange-500">
                          RM{(type === 'menu' ? calculateItemTotal(item as CartMenuItem) : calculatePackageTotal(item as CartPackageItem)).toFixed(2)}
                      </div>
                      
                      {!isReadOnly && (
                          <div className="flex items-center gap-3">
                              <div className="flex items-center bg-gray-100 rounded-full">
                                  <button onClick={() => handleQuantityChange(item.quantity - 1)} className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={item.quantity <= 1}>
                                      <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="font-semibold min-w-[40px] text-center text-gray-800">
                                      {item.quantity}
                                  </span>
                                  <button onClick={() => handleQuantityChange(item.quantity + 1)} className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all">
                                      <Plus className="h-4 w-4" />
                                  </button>
                              </div>
                              
                              <button onClick={() => handleQuantityChange(0)} className="w-10 h-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors group">
                                  <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              </button>
                          </div>
                      )}
                       {isReadOnly && (
                          <div className="text-base text-gray-700 font-medium">
                              Qty: <span className="font-bold">{item.quantity}</span>
                          </div>
                       )}
                  </div>
              </div>
          </div>
      </div>
  );
};

// 购物车商品列表的主组件
const CartItems: React.FC<Step1Props> = ({ cartData, setCartData }) => (
  <div className="space-y-8">
      {cartData?.menu_items && cartData.menu_items.length > 0 && (
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                  <CardTitle className="flex items-center text-xl">
                      <Icon name="UtensilsCrossed" className="mr-3 h-6 w-6" />
                      Menu Items
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4">
                  {cartData.menu_items.map((item) => (
                      <ItemCard key={`menu-${item.id}`} item={item} type="menu" cartData={cartData} setCartData={setCartData} />
                  ))}
              </CardContent>
          </Card>
      )}

      {cartData?.package_items && cartData.package_items.length > 0 && (
           <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                  <CardTitle className="flex items-center text-xl">
                      <Package className="mr-3 h-6 w-6" />
                      Package Items
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4">
                  {cartData.package_items.map((pkg) => (
                      <ItemCard key={`pkg-${pkg.id}`} item={pkg} type="package" cartData={cartData} setCartData={setCartData} />
                  ))}
              </CardContent>
          </Card>
      )}
  </div>
);

export default CartItems;