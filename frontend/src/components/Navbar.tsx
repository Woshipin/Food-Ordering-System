// 文件路径: components/Navbar.tsx (或者您项目中的路径)

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher'; // 确保此组件的图标是白色的
import { Button } from './ui/button';
import { ChefHat, ShoppingCart, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/menu', label: '菜单' },
  { href: '/packages', label: '套餐' }, // 根据您的图片，我将 "sets" 改为 "packages"
  { href: '/gallery', label: '画廊' },
  { href: '/about-us', label: '关于我们' }, // 根据您的图片，我将 "about" 改为 "about-us"
  { href: '/contact', label: '联系我们' },
];

const Navbar = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 华文标记：这是一个基于深色背景的全新设计，确保白色图标清晰可见
  return (
    // 华文标记：1. 背景更换为漂亮的橙色渐变，让白色图标和文字能凸显出来
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* --- Logo --- */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              {/* 华文标记：2. Logo 图标和文字颜色改为白色 */}
              <ChefHat className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Delicious Food</span>
            </Link>
          </div>

          {/* --- 桌面端导航链接 --- */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // 华文标记：3. 导航链接颜色改为适用于深色背景的样式
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-black/20 text-white' // 激活状态
                    : 'text-orange-100 hover:bg-black/10 hover:text-white' // 默认及悬停状态
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* --- 桌面端右侧操作区 --- */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher /> {/* 您的白色图标语言切换器 */}
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-black/10">
              <ShoppingCart className="h-5 w-5" />
              {/* 华文标记：4. 购物车标记颜色反转，使其在白色图标上可见 */}
              <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">3</span>
            </Button>
            
            {loading ? <div className="w-20 h-9 bg-white/20 rounded animate-pulse" /> : !user ? (
              <>
                {/* 华文标记：5. 按钮样式重新设计，以适应深色背景 */}
                <Button asChild variant="ghost" className="border-orange-200 border text-white hover:bg-white hover:text-orange-600">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-white text-orange-600 hover:bg-orange-100">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            ) : null}
          </div>
          
          {/* --- 移动端汉堡菜单按钮 --- */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon" className="text-white hover:bg-black/10">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* --- 移动端展开的菜单 --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-orange-500 to-red-500 border-t border-orange-400">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-black/20 text-white'
                    : 'text-orange-100 hover:bg-black/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-orange-400 flex items-center gap-3 px-3">
              {!user && !loading && (
                 <>
                  <Button asChild variant="ghost" className="w-full border-orange-200 border text-white hover:bg-white hover:text-orange-600">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-white text-orange-600 hover:bg-orange-100">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;