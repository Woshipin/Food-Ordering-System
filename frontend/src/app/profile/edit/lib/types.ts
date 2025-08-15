// 定义了编辑个人资料表单所需的数据结构。
export interface EditProfileFormData {
  name: string;
  email: string;
  phone_number: string;
  password?: string; // 密码是可选的，因此用 '?' 标记
  password_confirmation?: string; // 确认密码也是可选的
}