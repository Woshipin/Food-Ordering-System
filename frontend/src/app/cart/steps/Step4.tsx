// @/app/cart/steps/Step4.tsx
// 这个文件代表结账流程的第四步也是最后一步：确认订单信息。

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Package } from 'lucide-react';
import Image from 'next/image';
import { CartData, CartMenuItem, CartPackageItem, ServiceMethod, PaymentMethod, Address } from '../lib/lib';
import { Icon, getFullImageUrl, calculateItemTotal, calculatePackageTotal } from '../function/cartfunction';

// 定义Step4组件需要接收的props类型
interface Step4Props {
  cartData: CartData | null;
  serviceType: string;
  serviceMethods: ServiceMethod[];
  deliveryAddress: number | null;
  addresses: Address[];
  pickupTime: string;
  specialInstructions: string;
  paymentMethod: string;
  paymentMethods: PaymentMethod[];
}

// 显示商品规格和附加项的详细信息组件 (只读版本)
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

// 商品卡片组件 (只读版本)
const ItemCard = ({ item, type }: { item: CartMenuItem | CartPackageItem; type: 'menu' | 'package' }) => {
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
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
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
                        <div className="text-base text-gray-700 font-medium">
                            Qty: <span className="font-bold">{item.quantity}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// 订单确认组件
const OrderConfirmation: React.FC<Step4Props> = ({
  cartData,
  serviceType,
  serviceMethods,
  deliveryAddress,
  addresses,
  pickupTime,
  specialInstructions,
  paymentMethod,
  paymentMethods,
}) => {
    const selectedService = serviceMethods.find(s => s.name === serviceType);
    const selectedPayment = paymentMethods.find(p => p.name === paymentMethod);

    return (
    <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
             <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Icon name="Car" className="mr-3 h-6 w-6" />
                        Service Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-sm space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-medium capitalize">{selectedService?.display_name || serviceType}</span>
                    </div>
                    {serviceType === 'delivery' && deliveryAddress && (
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-600 flex-shrink-0">Address:</span>
                            <span className="font-medium text-right">
                                {addresses.find(a => a.id === deliveryAddress)?.address}
                            </span>
                        </div>
                    )}
                    {serviceType === 'pickup' && pickupTime && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pickup Time:</span>
                            <span className="font-medium">{new Date(pickupTime).toLocaleString()}</span>
                        </div>
                    )}
                    {specialInstructions && (
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-gray-600 flex-shrink-0">Instructions:</span>
                            <span className="font-medium text-right">{specialInstructions}</span>
                        </div>
                    )}
                </CardContent>
             </Card>
             <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Icon name="CreditCard" className="mr-3 h-6 w-6" />
                        Payment Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-sm space-y-3">
                     <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">
                            {selectedPayment?.display_name || paymentMethod}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {cartData?.menu_items && cartData.menu_items.length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Icon name="UtensilsCrossed" className="mr-3 h-6 w-6" />
                        Individual Dishes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.menu_items.map((item) => (
                        <ItemCard key={`confirm-menu-${item.id}`} item={item} type="menu" />
                    ))}
                </CardContent>
            </Card>
        )}
        
        {cartData?.package_items && cartData.package_items.length > 0 && (
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <CardTitle className="flex items-center text-xl">
                        <Package className="mr-3 h-6 w-6" />
                        Package Combos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8 space-y-4">
                    {cartData.package_items.map((pkg) => (
                        <ItemCard key={`confirm-pkg-${pkg.id}`} item={pkg} type="package" />
                    ))}
                </CardContent>
            </Card>
        )}
    </div>
  )};

export default OrderConfirmation;