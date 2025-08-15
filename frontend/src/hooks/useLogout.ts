/**
 * =====================================================================================
 * @file        useLogout.ts
 * @brief       一个自定义的 React Hook，用于封装和处理用户的登出逻辑。
 * @details
 *              这个 Hook 整合了多个功能，提供了一个统一、可复用的登出解决方案：
 *              1.  **用户确认**: 在执行登出前，会弹出一个确认对话框，防止用户误操作。
 *              2.  **状态管理**: 它从全局的 `AuthContext` 中获取真正的 `logout` 函数
 *                  和 `isLoggingOut` 加载状态。
 *              3.  **API 调用**: `AuthContext` 中的 `logout` 函数会负责调用后端的
 *                  `/auth/logout` 接口，以销毁服务器上的会话。
 *              4.  **本地清理**: 无论API调用是否成功，都会清理 `localStorage` 中的
 *                  用户数据和令牌。
 * 
 * @purpose     将登出逻辑（包括UI交互、状态管理、API调用）封装起来，使得任何需要
 *              登出功能的组件都可以通过简单地调用此 Hook 来实现，而无需重复编写
 *              相同的代码。
 * 
 * @usage       在项目中，此 Hook 被用于：
 *              - `frontend/src/app/profile/page.tsx`: 在用户个人资料页面提供登出按钮。
 *              - `frontend/src/app/page.tsx` (或其他包含主导航栏的布局文件):
 *                在网站的导航栏中提供登出按钮。
 * =====================================================================================
 */

import { useAuth } from "@/context/AuthContext"; // 导入自定义的认证钩子，用于访问全局的登出函数和状态。
import { useLanguage } from "@/components/LanguageProvider"; // 导入自定义的语言钩子，用于获取多语言翻译。
import Swal from "sweetalert2"; // 导入 SweetAlert2 库，用于创建漂亮的确认对话框。
import withReactContent from "sweetalert2-react-content"; // 导入一个包装器，让 SweetAlert2 可以更好地与 React 组件配合使用。

// 创建一个与 React 兼容的 SweetAlert2 实例。
const MySwal = withReactContent(Swal);

/**
 * @function    useLogout
 * @description 一个自定义 Hook，提供处理用户登出的所有逻辑。
 * @returns     {object} 返回一个对象，包含：
 *              - `handleLogout`: 一个异步函数，调用它会触发完整的登出流程（确认对话框 -> API调用 -> 本地清理）。
 *              - `isLoggingOut`: 一个布尔值，表示当前是否正在执行登出操作，可用于在UI上显示加载状态。
 */
export const useLogout = () => {
  // 1. 从全局的 AuthContext 中获取 `logout` 函数和 `isLoggingOut` 状态。
  //    这是登出逻辑的核心，真正的状态管理和API调用都在 AuthContext 中完成。
  const { logout, isLoggingOut } = useAuth();
  
  // 2. 从语言上下文中获取翻译函数 `t`，用于显示本地化的文本。
  const { t } = useLanguage();

  // 3. 定义处理登出点击事件的函数。
  const handleLogout = async () => {
    // 4. 使用 MySwal.fire 弹出一个确认对话框。
    MySwal.fire({
      title: t("confirmLogout"), // 对话框标题 (从语言文件中获取)
      icon: "warning", // 显示一个警告图标
      showCancelButton: true, // 显示“取消”按钮
      confirmButtonColor: "#3085d6", // “确认”按钮的颜色
      cancelButtonColor: "#d33", // “取消”按钮的颜色
      confirmButtonText: t("confirm"), // “确认”按钮的文本
      cancelButtonText: t("cancel"), // “取消”按钮的文本
    }).then(async (result) => {
      // 5. `.then()` 会在用户与对话框交互后执行。
      //    `result.isConfirmed` 是一个布尔值，如果用户点击了“确认”按钮，则为 true。
      if (result.isConfirmed) {
        // 6. 如果用户确认登出，则调用从 AuthContext 中获取的 `logout` 函数。
        //    `await` 关键字会等待这个异步操作完成。
        await logout();
      }
    });
  };

  // 7. 返回一个对象，包含 `handleLogout` 函数和 `isLoggingOut` 状态。
  //    这样，任何使用此 Hook 的组件都可以轻松地调用登出功能，并根据加载状态更新其UI。
  return { handleLogout, isLoggingOut };
};