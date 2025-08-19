// @/app/cart/steps/Step2.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { ServiceMethod, Address } from '../lib/lib';
import { Icon } from '../function/cartfunction';

interface Step2Props {
  serviceType: string;
  setServiceType: (value: string) => void;
  serviceMethods: ServiceMethod[];
  deliveryFee: number;
  deliveryDistance: number;
  isCalculatingFee: boolean;
  pickupTime: string;
  setPickupTime: (value: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (value: string) => void;
  deliveryAddress: number | null;
  setDeliveryAddress: (value: number | null) => void;
  addresses: Address[];
}

const ServiceSelection: React.FC<Step2Props> = ({
  serviceType,
  setServiceType,
  serviceMethods,
  deliveryFee,
  deliveryDistance,
  isCalculatingFee,
  pickupTime,
  setPickupTime,
  specialInstructions,
  setSpecialInstructions,
  deliveryAddress,
  setDeliveryAddress,
  addresses
}) => (
  <div className="space-y-8">
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <CardTitle className="flex items-center text-xl">
          <Icon name="Car" className="mr-3 h-6 w-6" />
          Choose Your Service
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <RadioGroup value={serviceType} onValueChange={setServiceType} className="space-y-6">
          {serviceMethods.map((method) => (
            <Label key={method.name} htmlFor={method.name} className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${serviceType === method.name ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <RadioGroupItem value={method.name} id={method.name} />
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Icon name={method.icon_name} className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{method.display_name}</div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                  
                  {serviceType === 'delivery' && method.name === 'delivery' && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {isCalculatingFee
                        ? 'Calculating...'
                        : `Distance: ${deliveryDistance.toFixed(2)} km | Fee: RM ${deliveryFee.toFixed(2)}`
                      }
                    </p>
                  )}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>


        {serviceType === 'pickup' && (
          <div className="mt-8 space-y-4">
            <Label htmlFor="pickupTime" className="text-base font-semibold">Preferred Pickup Time</Label>
            <Input
              id="pickupTime"
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="rounded-xl border-gray-300 focus:border-orange-500"
            />
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Label htmlFor="instructions" className="text-base font-semibold">Special Instructions (Optional)</Label>
          <Textarea
            id="instructions"
            placeholder="Any special requests or instructions..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="min-h-16 rounded-xl border-gray-300 focus:border-orange-500"
          />
        </div>
      </CardContent>
    </Card>

    {serviceType === 'delivery' && (
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
          <CardTitle className="flex items-center text-xl">
            <Icon name="MapPin" className="mr-3 h-6 w-6" />
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <RadioGroup
            value={deliveryAddress?.toString()}
            onValueChange={(value) => setDeliveryAddress(Number(value))}
            className="space-y-4"
          >
            {addresses.map((addr) => (
              <Label
                key={addr.id}
                htmlFor={`address-${addr.id}`}
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-white shadow-sm ${
                  deliveryAddress === addr.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value={addr.id.toString()} id={`address-${addr.id}`} className="mt-1" />
                <div className="flex-1">
                  <div className="font-semibold flex items-center">
                    {addr.name}
                    {addr.is_default && (
                      <Badge className="ml-2 bg-green-100 text-green-800">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.phone}</p>
                  <p className="text-sm text-gray-600">
                    {addr.address}, {addr.building}, {addr.floor}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    )}
  </div>
);

export default ServiceSelection;