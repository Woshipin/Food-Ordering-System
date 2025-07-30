<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use App\Models\ServiceMethod;
use Illuminate\Http\JsonResponse;

class CheckoutOptionController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // 查询所有启用的服务方式，并只选择前端需要的字段
            $serviceMethods = ServiceMethod::active()
                ->get([
                    'name',
                    'display_name',
                    'description',
                    'details',
                    'fee',
                    'icon_name'
                ]);

            // 查询所有启用的支付方式，并只选择前端需要的字段
            $paymentMethods = PaymentMethod::active()
                ->get([
                    'name',
                    'display_name',
                    'description',
                    'icon_name'
                ]);

            // 返回一个结构化的 JSON 响应
            return response()->json([
                'success' => true,
                'data' => [
                    'service_methods' => $serviceMethods,
                    'payment_methods' => $paymentMethods,
                ]
            ]);

        } catch (\Exception $e) {
            // 如果在查询过程中发生任何错误，返回一个标准的 500 错误响应
            // 在生产环境中，你可能想要记录这个错误
            // Log::error('Failed to fetch checkout options: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching checkout options.'
            ], 500);
        }
    }
}
