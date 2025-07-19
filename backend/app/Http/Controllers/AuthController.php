<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * 创建一个新的 AuthController 实例。
     *
     * @return void
     */
    public function __construct()
    {
        // 除了 'login' 和 'register' 方法外，所有方法都受 'auth:api' 中间件保护
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * 通过邮箱和密码让用户登录，并返回 JWT
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // 验证请求数据
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 如果验证失败，返回错误信息
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 获取验证后的凭证
        $credentials = $request->only('email', 'password');

        // 尝试使用凭证进行登录，如果失败则返回错误
        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // 如果成功，返回带有 token 的响应
        return $this->respondWithToken($token);
    }

    /**
     * 注册一个新用户
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        // 使用 validate 方法进行验证，如果失败会自动返回 422 响应
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // 创建新用户
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        // 为新注册的用户生成 token
        $token = auth('api')->login($user);

        // 返回带有 token 的响应
        return $this->respondWithToken($token);
    }

    /**
     * 获取已认证用户的信息
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        // 返回当前认证的用户信息
        return response()->json(auth('api')->user());
    }

    /**
     * 注销用户 (使 token 失效)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        // 注销当前用户
        auth('api')->logout();

        // 返回成功注销的消息
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * 刷新 token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        // 刷新当前 token 并返回新的 token
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * 构建 token 的响应结构
     *
     * @param  string $token
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        // 返回包含 token 信息的 JSON 响应
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60
        ]);
    }
}
