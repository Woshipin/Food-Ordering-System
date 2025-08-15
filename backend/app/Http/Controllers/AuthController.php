<?php
/**
 * =====================================================================================
 * @file        AuthController.php
 * @brief       处理所有与用户认证相关的HTTP请求的控制器。
 * @details
 *              这个控制器负责用户的注册、登录、登出、刷新令牌、获取用户信息以及
 *              更新个人资料等核心认证功能。它与 `tymon/jwt-auth` 包紧密集成，
 *              用于处理 JSON Web Tokens (JWT)。
 *
 * @purpose     1.  **封装认证逻辑**: 将所有认证相关的业务逻辑集中在一个地方。
 *              2.  **处理API请求**: 作为 `routes/api.php` 中定义的认证路由的目标，
 *                  处理来自前端的HTTP请求。
 *              3.  **返回JSON响应**: 与前端进行数据交互，所有方法都返回标准化的
 *                  JSON格式响应。
 *
 * @usage       当 `routes/api.php` 文件中的 `/api/auth/*` 路由被触发时，
 *              Laravel 会实例化这个控制器并调用相应的方法。例如，`POST /api/auth/login`
 *              请求会调用此文件中的 `login` 方法。
 * =====================================================================================
 */

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * @brief  创建一个新的 AuthController 实例。
     * @details
     *         构造函数是设置控制器级别中间件的理想位置。
     *         `$this->middleware('auth:api', ...)` 的作用是：保护此控制器内的所有方法，要求请求必须携带有效的JWT令牌。
     *         `['except' => ['login', 'register']]` 表示将 `login` 和 `register` 这两个方法排除在保护之外，
     *         因为用户在登录和注册时还没有令牌。
     *
     * @note   **为什么在这里设置中间件，而不是在 `routes/api.php` 中？**
     *         这是一种更安全、更符合“职责单一”原则的最佳实践。
     *         1.  **默认安全**: 任何在此控制器中新增的方法都会被自动保护，避免了因忘记在路由文件中添加中间件而导致的安全漏洞。
     *         2.  **职责清晰**: 控制器自我管理其访问权限，路由文件只负责定义URL和分发请求。
     *         `routes/api.php` 中的 `'middleware' => 'api'` 是一个基础中间件组（如请求限流），而这里的 `'auth:api'` 是具体的认证检查，两者各司其职，并不冲突。
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * @brief  处理用户登录请求。
     * @details
     *         验证用户凭证，如果成功，则返回一个JWT。
     * @param  \Illuminate\Http\Request  $request 包含 'email' 和 'password' 的请求。
     * @return \Illuminate\Http\JsonResponse 包含JWT或错误信息的JSON响应。
     */
    public function login(Request $request)
    {
        // 使用 $request->validate() 来验证输入数据。
        // 如果验证失败，Laravel会自动抛出异常并返回一个422 Unprocessable Entity响应，其中包含错误详情。
        // 这种方式比 Validator::make() 更简洁。
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 只从请求中获取 'email' 和 'password'。
        $credentials = $request->only('email', 'password');

        // 使用 'api' guard 尝试进行认证。
        // `auth('api')->attempt()` 会验证凭证，如果成功，则返回JWT；如果失败，则返回false。
        if (! $token = auth('api')->attempt($credentials)) {
            // 如果认证失败，返回 401 Unauthorized 错误。
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // 如果认证成功，调用辅助方法来构建并返回一个标准的JWT响应。
        return $this->respondWithToken($token);
    }

    /**
     * @brief  处理新用户注册请求。
     * @param  \Illuminate\Http\Request  $request 包含用户注册信息的请求。
     * @return \Illuminate\Http\JsonResponse 包含新用户的JWT。
     */
    public function register(Request $request)
    {
        // 验证传入的注册数据。
        // 'confirmed' 规则要求请求中必须有一个匹配的 'password_confirmation' 字段。
        // 'unique:users' 规则确保邮箱地址在 'users' 表中是唯一的。
        $validatedData = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:6|confirmed',
            'user_image'   => 'nullable|string', // 'nullable' 表示这个字段是可选的。
            'phone_number' => 'nullable|string',
        ]);

        // 创建新用户。
        $user = User::create([
            'name'         => $validatedData['name'],
            'email'        => $validatedData['email'],
            'password'     => Hash::make($validatedData['password']), // 使用 Hash::make() 对密码进行安全的哈希处理。
            'user_image'   => $validatedData['user_image'] ?? null,   // 使用空合并运算符提供默认值。
            'phone_number' => $validatedData['phone_number'] ?? null,
        ]);

        // 为新注册的用户直接登录并生成JWT。
        $token = auth('api')->login($user);

        // 返回JWT响应。
        return $this->respondWithToken($token);
    }

    /**
     * @brief  获取当前已认证用户的信息。
     * @details
     *         这是一个受保护的方法，只有提供了有效JWT的请求才能访问。
     * @return \Illuminate\Http\JsonResponse 包含用户对象的JSON响应。
     */
    public function me()
    {
        // `auth('api')->user()` 返回当前通过JWT认证的用户模型实例。
        return response()->json(auth('api')->user());
    }

    /**
     * @brief  注销当前用户。
     * @details
     *         这将使当前请求中使用的JWT失效，将其加入黑名单。
     * @return \Illuminate\Http\JsonResponse 包含成功消息的JSON响应。
     */
    public function logout()
    {
        // `auth('api')->logout()` 会使当前令牌失效。
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * @brief  刷新一个已存在的JWT。
     * @details
     *         客户端可以在旧令牌即将过期时调用此接口，以获取一个新令牌，从而保持登录状态。
     * @return \Illuminate\Http\JsonResponse 包含新JWT的JSON响应。
     */
    public function refresh()
    {
        // `auth('api')->refresh()` 会使旧令牌失效并返回一个新令牌。
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * @brief  更新已认证用户的个人资料。
     * @param  \Illuminate\Http\Request  $request 包含要更新的数据。
     * @return \Illuminate\Http\JsonResponse 包含成功消息和更新后的用户信息。
     */
    public function updateProfile(Request $request)
    {
        // 获取当前认证的用户实例。
        $user = auth('api')->user();

        // 1. 【优化】使用更健壮和清晰的验证规则。
        $validatedData = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id), // 使用Rule类，更清晰安全。
            ],
            'phone_number' => 'nullable|string|max:20',
            'user_image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 验证图片类型和大小。
            'password'     => 'nullable|string|min:6|confirmed', // 密码是可选的，但如果提供，则必须满足规则。
        ]);

        // 2. 【优化】创建一个只包含安全字段的新数组，防止批量赋值漏洞。
        $updateData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'phone_number' => $validatedData['phone_number'] ?? null,
        ];

        // 3. 【优化】如果请求中包含并通过了验证的新密码，则哈希并添加到更新数据中。
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validatedData['password']);
        }

        // 4. 【优化】处理图片上传的逻辑。
        if ($request->hasFile('user_image')) {
            // 如果旧头像存在，先删除它。
            if ($user->user_image) {
                Storage::disk('public')->delete($user->user_image);
            }
            // 存储新上传的图片并获取其路径。
            $path = $request->file('user_image')->store('user_image', 'public');
            $updateData['user_image'] = $path;
        }

        // 5. 使用过滤后的安全数据更新用户信息。
        $user->update($updateData);

        // 返回成功响应，并附上更新后的用户信息（刷新以确保数据最新）。
        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * @brief  一个辅助方法，用于构建标准的JWT响应格式。
     * @param  string $token 生成的JWT。
     * @return \Illuminate\Http\JsonResponse 标准化的JWT JSON响应。
     */
    protected function respondWithToken($token)
    {
        // 返回一个包含令牌本身、令牌类型和过期时间的JSON对象。
        // `auth('api')->factory()->getTTL()` 获取JWT的生命周期（以分钟为单位），乘以60得到秒。
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
        ]);
    }
}
