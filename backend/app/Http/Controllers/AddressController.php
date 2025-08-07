<?php // PHP 代码的开始标记

/**
 * 文件: AddressController.php
 * -------------------------------------------------------------------------
 * 描述: 地址控制器
 *
 * 这个文件负责处理与用户地址相关的所有 HTTP 请求。
 * 它包含了对地址的增、删、改、查 (CRUD) 操作，
 * 以及一些辅助功能，如：通过地址获取经纬度、设置默认地址、计算配送费用等。
 * 所有需要用户身份认证的操作都通过 JWT (JSON Web Token) 来进行。
 * -------------------------------------------------------------------------
 */

namespace App\Http\Controllers; // 定义该文件所属的命名空间

// 引入项目所需的类和门面 (Facades)
use App\Models\Address;                 // 引入地址模型，用于与 addresses 数据表交互
use Illuminate\Http\Request;            // 引入 Request 类，用于处理 HTTP 请求数据
use Illuminate\Support\Facades\DB;      // 引入 DB 门面，用于数据库事务处理
use Tymon\JWTAuth\Facades\JWTAuth;      // 引入 JWTAuth 门面，用于 JWT 认证
use Tymon\JWTAuth\Exceptions\JWTException; // 引入 JWT 相关的异常类
use GuzzleHttp\Client;                  // 引入 Guzzle HTTP 客户端，用于发送 HTTP 请求到外部 API
use Illuminate\Support\Facades\Log;     // 引入 Log 门面，用于记录日志

class AddressController extends Controller // 定义地址控制器类，继承自基础控制器
{
    /**
     * 根据地址字符串获取地理坐标 (经纬度)。
     * 使用 OpenStreetMap 的 Nominatim API。
     *
     * @param string $address 要查询的地址。
     * @return array|null 如果成功，返回包含 'latitude' 和 'longitude' 的数组，否则返回 null。
     */
    private function getCoordinatesForAddress($address) // 定义一个私有方法，用于通过地址获取经纬度
    {
        $client = new Client(); // 创建一个新的 Guzzle HTTP 客户端实例
        try { // 使用 try-catch 块来捕获可能发生的请求异常
            // 发送 GET 请求到 Nominatim API 以进行地理编码
            $response = $client->get('https://nominatim.openstreetmap.org/search', [
                'query' => [ // 定义请求的查询参数
                    'q' => $address, // 'q' 参数是要搜索的地址字符串
                    'format' => 'json', // 'format' 参数指定返回的数据格式为 JSON
                    'limit' => 1 // 'limit' 参数限制只返回最匹配的一个结果
                ],
                'headers' => [ // 定义请求头
                    // 设置 User-Agent 是 Nominatim API 的使用要求，防止被屏蔽
                    'User-Agent' => 'FoodOrderingSystem/1.0 (https://your-app-url.com)',
                ],
                'timeout' => 10, // 设置请求超时时间为 10 秒，防止长时间等待
            ]);

            // 获取响应体内容并将其从 JSON 格式解码为 PHP 关联数组
            $data = json_decode($response->getBody(), true);

            // 检查返回的数据是否不为空，并且第一个结果中包含了 'lat' 和 'lon' 键
            if (!empty($data) && isset($data[0]['lat'], $data[0]['lon'])) {
                return [ // 如果成功获取，返回一个包含经度和纬度的数组
                    'latitude' => $data[0]['lat'],  // 纬度
                    'longitude' => $data[0]['lon'], // 经度
                ];
            }
        } catch (\GuzzleHttp\Exception\ServerException $e) { // 捕获 Nominatim API 服务器错误
            Log::error('Nominatim API server error: ' . $e->getMessage()); // 将服务器错误信息记录到日志
        } catch (\Exception $e) { // 捕获其他所有类型的异常 (如网络问题、超时等)
            Log::error('Nominatim API request failed: ' . $e->getMessage()); // 将通用错误信息记录到日志
        }

        return null; // 如果在任何步骤中失败，则返回 null
    }

    /**
     * 从 JWT 令牌中获取已认证的用户。
     * 这是一个辅助函数，用于简化用户认证流程。
     * @return \App\Models\User|\Illuminate\Http\JsonResponse
     */
    private function getAuthenticatedUser() // 定义一个私有方法，用于获取当前登录的用户
    {
        try { // 使用 try-catch 块来处理 JWT 相关的异常
            // 尝试从请求中解析 Token 并验证用户身份
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                // 如果 Token 有效但找不到对应的用户，返回 404 Not Found 错误
                return response()->json(['user_not_found'], 404);
            }
        } catch (JWTException $e) { // 捕获 JWT 验证过程中可能抛出的异常 (如 token 过期、无效等)
            // 如果 Token 无效或解析失败，返回 500 Internal Server Error 错误
            return response()->json(['token_error' => $e->getMessage()], 500);
        }
        // 如果用户成功通过验证，返回用户模型实例
        return $user;
    }

    /**
     * 显示当前认证用户的所有地址资源列表。
     */
    public function index() // 定义 index 方法，用于获取用户的所有地址
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        if (!$user instanceof \App\Models\User) { // 检查 getAuthenticatedUser 是否返回了用户对象
            return $user; // 如果不是，说明发生了错误，直接返回错误响应 (JsonResponse)
        }

        // 获取该用户的所有地址，并按照 'is_default' 字段降序排列（默认地址会排在最前面）
        $addresses = $user->addresses()->orderBy('is_default', 'desc')->get();
        // 以 JSON 格式返回地址列表
        return response()->json($addresses);
    }

    /**
     * 在数据库中存储一个新的地址资源。
     */
    public function store(Request $request) // 定义 store 方法，用于创建新地址
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        if (!$user instanceof \App\Models\User) { // 检查用户是否成功获取
            return $user; // 如果失败，返回错误响应
        }

        // 验证传入的请求数据
        $validated = $request->validate([
            'name' => 'required|string|max:255',         // 姓名：必填，字符串，最大长度255
            'phone' => 'required|string|max:20',          // 电话：必填，字符串，最大长度20
            'address' => 'required|string|max:255',       // 地址：必填，字符串，最大长度255
            'building' => 'nullable|string|max:255',      // 楼栋/门牌号：可为空，字符串，最大长度255
            'floor' => 'nullable|string|max:255',         // 楼层：可为空，字符串，最大长度255
            'is_default' => 'sometimes|boolean',          // 是否为默认地址：可选，布尔值
            'latitude' => 'nullable|numeric',             // 纬度：可为空，数字
            'longitude' => 'nullable|numeric',            // 经度：可为空，数字
        ]);

        // 如果请求将此新地址设为默认地址
        if ($request->input('is_default', false)) {
            // 先将该用户的所有其他地址都设置为非默认
            $user->addresses()->update(['is_default' => false]);
        }

        // 如果请求中没有提供经纬度
        if (empty($validated['latitude']) || empty($validated['longitude'])) {
            // 尝试通过地址字符串获取经纬度
            $coordinates = $this->getCoordinatesForAddress($validated['address']);
            if ($coordinates) { // 如果成功获取到坐标
                $validated['latitude'] = $coordinates['latitude']; // 将获取到的纬度添加到验证数据中
                $validated['longitude'] = $coordinates['longitude']; // 将获取到的经度添加到验证数据中
            }
        }

        // 使用验证后的数据为该用户创建一个新的地址记录
        $address = $user->addresses()->create($validated);

        // 返回新创建的地址信息，并设置 HTTP 状态码为 201 (Created)
        return response()->json($address, 201);
    }

    /**
     * 显示指定的地址资源。
     */
    public function show(Address $address) // 定义 show 方法，使用路由模型绑定自动查找地址
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        // 授权检查：确保返回的不是错误响应，并且当前用户是该地址的所有者
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            // 如果用户无权查看此地址，返回 403 Forbidden 错误
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 以 JSON 格式返回指定的地址信息
        return response()->json($address);
    }

    /**
     * 更新数据库中指定的地址资源。
     */
    public function update(Request $request, Address $address) // 定义 update 方法，用于更新现有地址
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        // 授权检查：确保当前用户是该地址的所有者
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            // 如果无权操作，返回 403 Forbidden 错误
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 验证传入的请求数据 ('sometimes' 表示只有当字段存在时才进行验证)
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'building' => 'nullable|string|max:255',
            'floor' => 'nullable|string|max:255',
            'is_default' => 'sometimes|boolean',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // 如果请求将此地址设为默认
        if ($request->input('is_default', false)) {
            // 将该用户除当前地址外的所有地址都设置为非默认
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        // 如果请求中更新了地址，但没有提供新的经纬度
        if (isset($validated['address']) && (empty($validated['latitude']) || empty($validated['longitude']))) {
            // 尝试根据新地址获取坐标
            $coordinates = $this->getCoordinatesForAddress($validated['address']);
            if ($coordinates) { // 如果成功获取
                $validated['latitude'] = $coordinates['latitude']; // 更新纬度
                $validated['longitude'] = $coordinates['longitude']; // 更新经度
            }
        }

        // 使用验证后的数据更新地址记录
        $address->update($validated);

        // 以 JSON 格式返回更新后的地址信息
        return response()->json($address);
    }

    /**
     * 从数据库中移除指定的地址资源。
     */
    public function destroy(Address $address) // 定义 destroy 方法，用于删除地址
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        // 授权检查：确保当前用户是该地址的所有者
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            // 如果无权操作，返回 403 Forbidden 错误
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 如果被删除的地址是默认地址
        if ($address->is_default) {
            // 查找该用户的另一个地址，作为新的默认地址
            $newDefault = $user->addresses()->where('id', '!=', $address->id)->first();
            if ($newDefault) { // 如果找到了其他地址
                // 将这个地址更新为新的默认地址
                $newDefault->update(['is_default' => true]);
            }
        }

        $address->delete(); // 删除指定的地址记录

        // 返回一个空的响应，并设置 HTTP 状态码为 204 (No Content)
        return response()->json(null, 204);
    }

    /**
     * 将指定的地址设置为默认地址。
     */
    public function setDefault(Address $address) // 定义 setDefault 方法
    {
        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        // 授权检查：确保当前用户是该地址的所有者
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            // 如果无权操作，返回 403 Forbidden 错误
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 使用数据库事务来确保数据一致性
        DB::transaction(function () use ($user, $address) {
            // 第一步：将该用户的所有地址都设置为非默认
            $user->addresses()->update(['is_default' => false]);
            // 第二步：将指定的地址设置为默认
            $address->update(['is_default' => true]);
        }); // 如果事务中任何一步失败，所有操作都会回滚

        // 返回成功的消息
        return response()->json(['message' => 'Address set as default successfully.']);
    }

    /**
     * 根据地址ID计算到餐厅的配送费用。
     */
    public function calculateDeliveryFee(Request $request) // 定义 calculateDeliveryFee 方法
    {
        // 验证请求中必须包含一个有效的地址ID
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id', // 必须提供，且ID必须在 addresses 表中存在
        ]);

        $user = $this->getAuthenticatedUser(); // 获取当前认证的用户
        $address = Address::find($validated['address_id']); // 查找对应的地址模型

        // 授权检查：确保当前用户是该地址的所有者
        if (!$user instanceof \App\Models\User || $user->id !== $address->user_id) {
            // 如果无权操作，返回 403 Forbidden 错误
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 检查地址是否包含经纬度信息
        if (!$address->latitude || !$address->longitude) {
            // 如果没有坐标，无法计算距离，返回 400 Bad Request 错误
            return response()->json(['error' => 'Address does not have coordinates.'], 400);
        }

        // 餐厅的固定坐标 (这里使用示例坐标，实际应用中应从配置或数据库中读取)
        $restaurantLat = 3.1390;  // 示例：吉隆坡纬度
        $restaurantLng = 101.6869; // 示例：吉隆坡经度

        // 调用 Haversine 公式计算餐厅和用户地址之间的直线距离（公里）
        $distance = $this->haversineGreatCircleDistance(
            $restaurantLat, $restaurantLng,
            $address->latitude, $address->longitude
        );

        $feePerKm = 1; // 每公里的费用，例如 RM 1
        $deliveryFee = round($distance * $feePerKm, 2); // 计算总配送费，并四舍五入到两位小数

        // 以 JSON 格式返回计算结果
        return response()->json([
            'distance_km' => round($distance, 2), // 距离（公里），保留两位小数
            'delivery_fee' => $deliveryFee,      // 最终的配送费
        ]);
    }

    /**
     * 使用 Haversine (半正矢) 公式计算两个地理坐标点之间的球面距离。
     *
     * @param float $latitudeFrom  起点的纬度 (十进制度)
     * @param float $longitudeFrom 起点的经度 (十进制度)
     * @param float $latitudeTo    终点的纬度 (十进制度)
     * @param float $longitudeTo   终点的经度 (十进制度)
     * @param float $earthRadius   地球平均半径 (单位：公里)
     * @return float 两点之间的距离 (单位：公里)
     */
    private function haversineGreatCircleDistance(
        $latitudeFrom, $longitudeFrom, $latitudeTo, $longitudeTo, $earthRadius = 6371)
    {
        // 将起点的经纬度从角度转换为弧度
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        // 将终点的经纬度从角度转换为弧度
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        // 计算纬度和经度的差值
        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        // Haversine 公式的核心计算部分
        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        // 用计算出的角度乘以地球半径，得到最终的距离
        return $angle * $earthRadius;
    }

}
