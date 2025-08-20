"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface LoadingOverlayProps {
  // 允许自定义标题和描述，如果未提供则使用默认值
  title?: string;
  description?: string;
  // 控制组件是否作为覆盖整个页面的模态框显示
  isFullScreen?: boolean;
}

export const LoadingOverlay = ({
  title,
  description,
  isFullScreen = false,
}: LoadingOverlayProps) => {
  const { t } = useLanguage();

  const loadingContent = (
    <div className="text-center bg-white px-16 py-8 md:px-20 md:py-10 rounded-3xl shadow-2xl border border-orange-200 w-full max-w-md md:max-w-lg mx-4">
      <div className="relative inline-block">
        <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
        <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full mx-auto animate-pulse"></div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-800">
        {title || t("Loading") || "Loading"}
      </h3>
      <p className="mt-2 text-gray-600">
        {description ||
          t("loadingMenuMessage") ||
          "Please wait while we load the content..."}
      </p>
      <div className="mt-4 flex justify-center space-x-1">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-orange-50/80 backdrop-blur-sm">
        {loadingContent}
      </div>
    );
  }

  // 如果不是全屏，则在当前布局流中居中显示
  return (
    <div className="flex items-center justify-center min-h-[300px] py-10">
      {loadingContent}
    </div>
  );
};