"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Clock, Star, MessageCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../components/ui/collapsible"
import { useLanguage } from "../../../components/LanguageProvider"
import { LanguageSwitcher } from "../../../components/LanguageSwitcher"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const [isOrderItemsOpen, setIsOrderItemsOpen] = useState(true)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isAddressOpen, setIsAddressOpen] = useState(false)

  const [order] = useState({
    id: params.id || "20241201001",
    date: "2024-12-01 12:30",
    status: "已完成",
    items: [
      {
        name: "招牌牛肉面",
        quantity: 2,
        price: 28.0,
        image: "/placeholder.svg?height=60&width=60",
        type: "food",
        description: "精选优质牛肉，手工拉面，浓郁汤底",
      },
      {
        name: "家庭套餐A",
        quantity: 1,
        price: 88.0,
        image: "/placeholder.svg?height=60&width=60",
        type: "package",
        description: "适合3-4人享用，包含主食、小菜、汤品和饮料",
        packageItems: ["招牌牛肉面 x2", "蒸饺套餐 x1", "酸辣汤 x1", "鲜榨橙汁 x2"],
      },
      {
        name: "鲜榨橙汁",
        quantity: 2,
        price: 12.0,
        image: "/placeholder.svg?height=60&width=60",
        type: "food",
        description: "新鲜橙子现榨，维C丰富",
      },
    ],
    subtotal: 140.0,
    deliveryFee: 0,
    discount: 8.0,
    total: 132.0,
    deliveryAddress: {
      name: "张三",
      phone: "138****8888",
      address: "北京市朝阳区三里屯街道工体北路8号",
      building: "A栋1201",
    },
    paymentMethod: "微信支付",
    deliveryTime: "30-45分钟",
    rating: 5,
    review: "味道很好，配送也很快！",
    timeline: [
      { time: "12:30", status: "订单已确认", description: "餐厅已接单，开始制作" },
      { time: "12:45", status: "制作完成", description: "您的订单已制作完成" },
      { time: "12:50", status: "配送中", description: "配送员已取餐，正在配送" },
      { time: "13:15", status: "已送达", description: "订单已送达，感谢您的订购" },
    ],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "已完成":
        return "bg-green-100 text-green-800"
      case "配送中":
        return "bg-blue-100 text-blue-800"
      case "制作中":
        return "bg-yellow-100 text-yellow-800"
      case "已取消":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const foodItems = order.items.filter((item) => item.type === "food")
  const packageItems = order.items.filter((item) => item.type === "package")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{t("orderDetails")}</h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Order Status */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">订单 #{order.id}</h2>
                <p className="text-gray-600">{order.date}</p>
              </div>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>

            {order.status === "配送中" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">您的订单正在配送中</p>
                    <p className="text-sm text-blue-700">预计还有15分钟送达</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    联系配送员
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items - Collapsible */}
            <Card>
              <Collapsible open={isOrderItemsOpen} onOpenChange={setIsOrderItemsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">订单商品 ({order.items.length})</CardTitle>
                      {isOrderItemsOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Food Items Section */}
                    {foodItems.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          🍜 单品菜品 ({foodItems.length})
                        </h4>
                        <div className="space-y-3">
                          {foodItems.map((item, index) => (
                            <div key={`food-${index}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.name}</h5>
                                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm text-gray-500">¥{item.price}/份</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Package Items Section */}
                    {packageItems.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          🍱 套餐组合 ({packageItems.length})
                        </h4>
                        <div className="space-y-3">
                          {packageItems.map((item, index) => (
                            <div
                              key={`package-${index}`}
                              className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                            >
                              <div className="flex items-start gap-4">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{item.name}</h5>
                                    <div className="text-right">
                                      <p className="font-medium">¥{(item.price * item.quantity).toFixed(2)}</p>
                                      <p className="text-sm text-gray-500">¥{item.price}/套</p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                  <p className="text-sm text-gray-500 mb-2">x{item.quantity}</p>

                                  {/* Package Contents */}
                                  {item.packageItems && (
                                    <div className="mt-3 p-3 bg-white rounded border">
                                      <p className="text-xs font-medium text-gray-700 mb-2">套餐包含：</p>
                                      <div className="grid grid-cols-2 gap-1">
                                        {item.packageItems.map((packageItem, idx) => (
                                          <div key={idx} className="text-xs text-gray-600 flex items-center">
                                            <div className="w-1 h-1 bg-orange-500 rounded-full mr-2"></div>
                                            {packageItem}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Delivery Address - Collapsible */}
            <Card>
              <Collapsible open={isAddressOpen} onOpenChange={setIsAddressOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <MapPin className="mr-2 h-5 w-5" />
                        配送地址
                      </CardTitle>
                      {isAddressOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.deliveryAddress.name}</span>
                        <span className="text-gray-600">{order.deliveryAddress.phone}</span>
                      </div>
                      <p className="text-gray-700">{order.deliveryAddress.address}</p>
                      <p className="text-sm text-gray-500">{order.deliveryAddress.building}</p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Order Timeline - Collapsible */}
            <Card>
              <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        订单进度
                      </CardTitle>
                      {isTimelineOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      {order.timeline.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            {index < order.timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{step.status}</h4>
                              <span className="text-sm text-gray-500">{step.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Review Section */}
            {order.status === "已完成" && order.rating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    我的评价
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < order.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600">({order.rating}/5)</span>
                  </div>
                  <p className="text-gray-700">{order.review}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>小计</span>
                  <span>¥{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>配送费</span>
                  <span>{order.deliveryFee === 0 ? "免费" : `¥${order.deliveryFee.toFixed(2)}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>优惠折扣</span>
                    <span>-¥{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>总计</span>
                  <span className="text-orange-500">¥{order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle>支付信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>支付方式</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>支付状态</span>
                    <Badge className="bg-green-100 text-green-800">已支付</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === "已完成" && (
                <>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    再次购买
                  </Button>
                  {!order.rating && (
                    <Button variant="outline" className="w-full bg-transparent">
                      <Star className="mr-2 h-4 w-4" />
                      评价订单
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                <MessageCircle className="mr-2 h-4 w-4" />
                联系客服
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
