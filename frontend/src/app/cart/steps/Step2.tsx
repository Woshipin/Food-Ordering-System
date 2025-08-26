// @/app/cart/steps/Step2.tsx
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
// --- 新增：导入 TimeSlot 类型 ---
import { ServiceMethod, Address, Table, TimeSlot } from "../lib/lib";
import { Icon } from "../function/cartfunction";

// --- 修改：更新 props 接口 ---
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
  // 新增 props
  timeSlots: TimeSlot[];
  selectedTimeSlotId: number | null;
  setSelectedTimeSlotId: (value: number | null) => void;
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
  // --- 接收新的 props ---
  timeSlots,
  selectedTimeSlotId,
  setSelectedTimeSlotId,
}) => {
  const dineInMethod = serviceMethods.find((method) =>
    method.display_name.toLowerCase().includes("dine in")
  );

  // --- 新增：时间格式化辅助函数 ---
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredTables = useMemo(() => {
    return tables.filter((table) => table.capacity >= pax);
  }, [tables, pax]);

  const getTableStatusInfo = (table: Table) => {
    // 如果桌位数据包含 is_available 字段（来自可用性检查），使用该字段
    if (typeof table.is_available === "boolean") {
      return {
        color: table.is_available
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-red-100 text-red-800 border-red-200",
        icon: table.is_available ? "Check" : "X",
        text: table.is_available ? "可用" : "已预订",
        available: table.is_available,
      };
    }

    // 否则使用原有逻辑
    switch (table.status) {
      case "pending":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "Users",
          text: table.status_text || "用餐中",
          available: false,
        };
      case "maintenance":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "Tool",
          text: table.status_text || "维护中",
          available: false,
        };
      case "available":
      default:
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "Check",
          text: table.status_text || "可用",
          available: true,
        };
    }
  };

  const allTablesForDisplay = useMemo(() => {
    return tables.filter((table) => table.capacity >= pax);
  }, [tables, pax]);

  // 新增：提示用户需要选择日期和时间段才能显示桌位可用性
  const shouldShowAvailabilityMessage = !reservationDate || !selectedTimeSlotId;

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
          <RadioGroup
            value={serviceType}
            onValueChange={setServiceType}
            className="space-y-6"
          >
            {serviceMethods.map((method) => (
              <Label
                key={method.name}
                htmlFor={method.name}
                className={`flex items-center space-x-4 p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  serviceType === method.name
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value={method.name} id={method.name} />
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Icon
                      name={method.icon_name}
                      className="h-6 w-6 text-orange-600"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {method.display_name}
                    </div>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>

                    {serviceType === "delivery" &&
                      method.name === "delivery" && (
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {isCalculatingFee
                            ? "Calculating..."
                            : `Distance: ${deliveryDistance.toFixed(
                                2
                              )} km | Fee: RM ${deliveryFee.toFixed(2)}`}
                        </p>
                      )}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>

          {serviceType === "pickup" && (
            <div className="mt-8 space-y-4">
              <Label htmlFor="pickupTime" className="text-base font-semibold">
                Preferred Pickup Time
              </Label>
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
            <Label htmlFor="instructions" className="text-base font-semibold">
              Special Instructions (Optional)
            </Label>
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
              Select Your Table & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* --- 修改：Reservation Details Section --- */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Icon
                  name="Calendar"
                  className="mr-2 h-5 w-5 text-orange-600"
                />
                Reservation Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="pax"
                    className="text-sm font-semibold text-gray-700 flex items-center"
                  >
                    <Icon
                      name="Users"
                      className="mr-1 h-4 w-4 text-orange-600"
                    />
                    Number of People
                  </Label>
                  <Input
                    id="pax"
                    type="number"
                    min="1"
                    max="20"
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="rounded-xl border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    placeholder="Enter number of people"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="reservationDate"
                    className="text-sm font-semibold text-gray-700 flex items-center"
                  >
                    <Icon
                      name="CalendarDays"
                      className="mr-1 h-4 w-4 text-orange-600"
                    />
                    Select Date
                  </Label>
                  <Input
                    id="reservationDate"
                    type="date"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="rounded-xl border-orange-200 focus:border-orange-500 focus:ring-orange-200"
                    min={new Date().toISOString().split("T")[0]} // 不能选择过去的日期
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            {/* --- 时间段选择部分 --- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Icon name="Clock" className="mr-2 h-5 w-5 text-orange-600" />
                Select a Time Slot
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.isArray(timeSlots) &&
                  timeSlots.map((slot) => {
                    // 检查时间段是否可用
                    const isAvailable = slot.is_available !== false; // 默认可用，除非明确标记为不可用
                    const isSelected = selectedTimeSlotId === slot.id;
                    const isDisabled = !isAvailable;

                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedTimeSlotId(slot.id);
                          }
                        }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center ${
                          isDisabled
                            ? "cursor-not-allowed opacity-50 bg-gray-100 border-gray-300"
                            : "cursor-pointer bg-white shadow-sm hover:shadow-lg transform hover:-translate-y-1"
                        } ${
                          isSelected && !isDisabled
                            ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                            : !isDisabled
                            ? "border-gray-200 hover:border-orange-300"
                            : ""
                        }`}
                      >
                        {/* 状态指示器 */}
                        <div className="absolute top-2 right-2">
                          {isSelected && !isDisabled && (
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                              <Icon
                                name="Check"
                                className="h-3 w-3 text-white"
                              />
                            </div>
                          )}
                          {isDisabled && (
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                              <Icon name="X" className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {!isDisabled && !isSelected && (
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                          )}
                        </div>

                        <Icon
                          name="Clock"
                          className={`h-6 w-6 mb-2 ${
                            isDisabled
                              ? "text-gray-400"
                              : isSelected
                              ? "text-orange-600"
                              : "text-gray-500"
                          }`}
                        />
                        <div
                          className={`font-bold text-base ${
                            isDisabled
                              ? "text-gray-400"
                              : isSelected
                              ? "text-orange-700"
                              : "text-gray-800"
                          }`}
                        >
                          {formatTime(slot.start_time)}
                        </div>
                        <div className="text-xs text-gray-500">to</div>
                        <div
                          className={`font-bold text-base ${
                            isDisabled
                              ? "text-gray-400"
                              : isSelected
                              ? "text-orange-700"
                              : "text-gray-800"
                          }`}
                        >
                          {formatTime(slot.end_time)}
                        </div>

                        {/* 可用性状态文字 */}
                        <div
                          className={`text-xs mt-2 font-medium ${
                            isDisabled ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isDisabled ? "已满" : "可用"}
                        </div>
                      </div>
                    );
                  })}
                {(!Array.isArray(timeSlots) || timeSlots.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {reservationDate ? "正在加载时间段..." : "请先选择日期。"}
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Table Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Icon name="Table" className="mr-2 h-5 w-5 text-orange-600" />
                  Table Selection
                  {shouldShowAvailabilityMessage && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (请先选择日期和时间段)
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">可用</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">已预订</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600">维护中</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allTablesForDisplay.length > 0 ? (
                  allTablesForDisplay.map((table) => {
                    const statusInfo = getTableStatusInfo(table);
                    const isSelectable = statusInfo.available;

                    return (
                      <div
                        key={table.id}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          isSelectable
                            ? `cursor-pointer bg-white shadow-sm hover:shadow-xl transform hover:-translate-y-1 ${
                                selectedTable === table.id
                                  ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg ring-2 ring-orange-200"
                                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                              }`
                            : "cursor-not-allowed bg-gray-50 border-gray-200 opacity-75"
                        }`}
                        onClick={() =>
                          isSelectable && setSelectedTable(table.id)
                        }
                      >
                        <div className="absolute top-4 right-4">
                          {isSelectable && selectedTable === table.id ? (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Icon
                                name="Check"
                                className="h-4 w-4 text-white"
                              />
                            </div>
                          ) : (
                            <Badge className={`${statusInfo.color} border`}>
                              <Icon
                                name={statusInfo.icon}
                                className="h-3 w-3 mr-1"
                              />
                              {statusInfo.text}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-start space-x-4">
                          {isSelectable && (
                            <RadioGroup
                              value={selectedTable?.toString()}
                              onValueChange={(value) =>
                                setSelectedTable(Number(value))
                              }
                            >
                              <RadioGroupItem
                                value={table.id.toString()}
                                id={`table-${table.id}`}
                                className="mt-1.5 flex-shrink-0 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                              />
                            </RadioGroup>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <h4
                                  className={`text-xl font-bold transition-colors ${
                                    isSelectable
                                      ? `text-gray-900 ${
                                          selectedTable === table.id
                                            ? "text-orange-600"
                                            : "group-hover:text-orange-600"
                                        }`
                                      : "text-gray-500"
                                  }`}
                                >
                                  {table.table_code}
                                </h4>
                                {selectedTable === table.id && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>

                            <p
                              className={`text-sm mb-4 line-clamp-2 ${
                                isSelectable ? "text-gray-600" : "text-gray-400"
                              }`}
                            >
                              {table.description}
                            </p>

                            <div
                              className={`rounded-xl p-3 border transition-all duration-200 ${
                                isSelectable
                                  ? "bg-gray-50 group-hover:bg-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Capacity:
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Icon
                                    name="Users"
                                    className="h-4 w-4 text-orange-600"
                                  />
                                  <span className="font-bold text-orange-600">
                                    {table.capacity}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    people
                                  </span>
                                </div>
                              </div>

                              {table.location && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">
                                    Location:
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {table.location}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Icon name="Table" className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Tables Available
                    </h3>
                    <p className="text-gray-500 mb-1">
                      No tables available for {pax} people.
                    </p>
                    <p className="text-sm text-gray-400">
                      Please try adjusting the number of people.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-800">
                    桌位状态统计:
                  </span>
                  <div className="flex items-center space-x-4 text-blue-600">
                    <span>
                      可选择:{" "}
                      {
                        filteredTables.filter(
                          (table) => getTableStatusInfo(table).available
                        ).length
                      }
                    </span>
                    <span>总计: {allTablesForDisplay.length}</span>
                    {shouldShowAvailabilityMessage && (
                      <span className="text-orange-600 font-medium">
                        请选择日期和时间段查看实时可用性
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {serviceType === "delivery" && (
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
                    deliveryAddress === addr.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value={addr.id.toString()}
                    id={`address-${addr.id}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center">
                      {addr.name}
                      {addr.is_default && (
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          Default
                        </Badge>
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
