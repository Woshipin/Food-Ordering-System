// @/app/cart/steps/Step3.tsx
// 这个文件代表结账流程的第三步：选择支付方式和输入优惠码。

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { PaymentMethod } from '../lib/lib';
import { Icon } from '../function/cartfunction';
import { toast } from "sonner";

// 定义Step3组件需要接收的props类型
interface Step3Props {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentMethods: PaymentMethod[];
  promoCode: string;
  setPromoCode: (value: string) => void;
}

// 支付选择组件
const PaymentSelection: React.FC<Step3Props> = ({
  paymentMethod,
  setPaymentMethod,
  paymentMethods,
  promoCode,
  setPromoCode,
}) => (
  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
    <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
      <CardTitle className="flex items-center text-xl">
        <Icon name="CreditCard" className="mr-3 h-6 w-6" />
        Payment Method
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-8">
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">
        {paymentMethods.map((method) => (
          <Label key={method.name} htmlFor={method.name} className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method.name ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <RadioGroupItem value={method.name} id={method.name} />
              <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name={method.icon_name} className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                  <div className="text-lg font-semibold">{method.display_name}</div>
                  <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              </div>
          </Label>
        ))}
      </RadioGroup>

      <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
        <h4 className="font-semibold text-gray-900 mb-4">Promo Code</h4>
        <div className="flex gap-3">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 rounded-xl border-gray-300 focus:border-orange-500"
          />
          <Button 
            className="bg-orange-500 hover:bg-orange-600 px-6 rounded-xl"
            onClick={() => toast.success("Promo code applied!")}
          >
            Apply
          </Button>
        </div>
        {promoCode === "SAVE10" && (
          <p className="text-green-600 text-sm mt-2">✓ 10% discount applied!</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default PaymentSelection;