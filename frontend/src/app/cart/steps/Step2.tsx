// @/app/cart/steps/Step2.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { ServiceMethod, Address, Table } from '../lib/lib';
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
  tables: Table[];
  selectedTable: number | null;
  setSelectedTable: (value: number | null) => void;
  pax: number;
  setPax: (value: number) => void;
  reservationDate: string;
  setReservationDate: (value: string) => void;
  checkInTime: string;
  setCheckInTime: (value: string) => void;
  checkOutTime: string;
  setCheckOutTime: (value: string) => void;
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
  addresses,
  tables,
  selectedTable,
  setSelectedTable,
  pax,
  setPax,
  reservationDate,
  setReservationDate,
  checkInTime,
  setCheckInTime,
  checkOutTime,
  setCheckOutTime
}) => {
  const dineInMethod = serviceMethods.find(method => method.display_name.toLowerCase().includes('dine in'));

  const filteredTables = useMemo(() => {
    return tables.filter(table => table.capacity >= pax);
  }, [tables, pax]);

  return (
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

    {dineInMethod && serviceType === dineInMethod.name && (
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
          <CardTitle className="flex items-center text-xl">
            <Icon name="Table" className="mr-3 h-6 w-6" />
            Select Your Table
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Enhanced Reservation Details Section */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Icon name="Calendar" className="mr-2 h-5 w-5 text-orange-600" />
              Reservation Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pax" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Icon name="Users" className="mr-1 h-4 w-4 text-orange-600" />
                  Number of People
                </Label>
                <Input
                  id="pax"
                  type="number"
                  min="1"
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value) > 0 ? Number(e.target.value) : 1)}
                  className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reservationDate" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Icon name="Calendar" className="mr-1 h-4 w-4 text-orange-600" />
                  Select Date
                </Label>
                <Input
                  id="reservationDate"
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkInTime" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Icon name="Clock" className="mr-1 h-4 w-4 text-green-600" />
                  Check-in Time
                </Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Icon name="Clock" className="mr-1 h-4 w-4 text-red-600" />
                  Check-out Time
                </Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          {/* Enhanced Table Selection Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <Icon name="Table" className="mr-2 h-5 w-5 text-orange-600" />
              Available Tables ({filteredTables.length})
            </h3>
            <RadioGroup
              value={selectedTable?.toString()}
              onValueChange={(value) => setSelectedTable(Number(value))}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredTables.length > 0 ? (
                filteredTables.map((table) => (
                  <Label
                    key={table.id}
                    htmlFor={`table-${table.id}`}
                    className={`group relative flex items-start space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-xl transform hover:-translate-y-1 ${
                      selectedTable === table.id 
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                    }`}
                  >
                    <RadioGroupItem 
                      value={table.id.toString()} 
                      id={`table-${table.id}`} 
                      className="mt-1.5 flex-shrink-0 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {table.table_code}
                          </h4>
                          {selectedTable === table.id && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${
                            selectedTable === table.id 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-100 text-gray-700 group-hover:bg-orange-100 group-hover:text-orange-700'
                          } transition-all duration-200`}
                        >
                          {table.location}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {table.description}
                      </p>
                      
                      <div className="bg-gray-50 group-hover:bg-white rounded-xl p-3 border transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Capacity:</span>
                          <div className="flex items-center space-x-1">
                            <Icon name="Users" className="h-4 w-4 text-orange-600" />
                            <span className="font-bold text-orange-600">{table.capacity}</span>
                            <span className="text-sm text-gray-600">people</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {selectedTable === table.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Icon name="Check" className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </Label>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Icon name="Table" className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tables Available</h3>
                  <p className="text-gray-500 mb-1">No tables available for {pax} people.</p>
                  <p className="text-sm text-gray-400">Please try adjusting the number of people.</p>
                </div>
              )}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    )}

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
};

export default ServiceSelection;