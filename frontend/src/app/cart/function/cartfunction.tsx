// @/app/cart/function/cartfunction.tsx
import React from "react";
import * as LucideIcons from "lucide-react";
import { CartMenuItem, CartPackageItem, CartData } from "../lib/lib";

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const Icon = ({
  name,
  ...props
}: { name: string } & LucideIcons.LucideProps) => {
  const LucideIcon = LucideIcons[
    name as keyof typeof LucideIcons
  ] as React.ComponentType<LucideIcons.LucideProps>;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  return <LucideIcon {...props} />;
};

export const getFullImageUrl = (
  imagePath: string | null | undefined
): string => {
  if (!imagePath) {
    return "/images/No-Image-Available.jpg";
  }
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  if (imagePath.startsWith("/storage/")) {
    return `http://127.0.0.1:8000${imagePath}`;
  }
  return `http://127.0.0.1:8000/storage/${imagePath}`;
};

export const calculateItemTotal = (item: CartMenuItem) => {
  const basePrice = item.promotion_price ?? item.base_price;
  const addonsPrice = item.addons.reduce(
    (sum, addon) => sum + Number(addon.addon_price),
    0
  );
  const variantsPrice = item.variants.reduce(
    (sum, variant) => sum + Number(variant.variant_price),
    0
  );
  return (Number(basePrice) + addonsPrice + variantsPrice) * item.quantity;
};

export const calculatePackageTotal = (pkg: CartPackageItem) => {
  const basePrice = pkg.promotion_price ?? pkg.package_price;
  let packageExtras = 0;
  pkg.menus.forEach((menu) => {
    packageExtras += menu.addons.reduce(
      (sum, addon) => sum + Number(addon.addon_price),
      0
    );
    packageExtras += menu.variants.reduce(
      (sum, variant) => sum + Number(variant.variant_price),
      0
    );
  });
  return (Number(basePrice) + packageExtras) * pkg.quantity;
};

export const handleUpdateMenuQuantity = (
  menuId: number,
  newQuantity: number,
  prevCart: CartData | null
): CartData | null => {
  if (!prevCart) return null;
  const updatedCart = JSON.parse(JSON.stringify(prevCart));

  if (newQuantity > 0) {
    const item = updatedCart.menu_items.find(
      (item: CartMenuItem) => item.id === menuId
    );
    if (item) item.quantity = newQuantity;
  } else {
    updatedCart.menu_items = updatedCart.menu_items.filter(
      (item: CartMenuItem) => item.id !== menuId
    );
  }

  return updatedCart;
};

export const handleUpdatePackageQuantity = (
  packageId: number,
  newQuantity: number,
  prevCart: CartData | null
): CartData | null => {
  if (!prevCart) return null;
  const updatedCart = JSON.parse(JSON.stringify(prevCart));

  if (newQuantity > 0) {
    const pkg = updatedCart.package_items.find(
      (pkg: CartPackageItem) => pkg.id === packageId
    );
    if (pkg) pkg.quantity = newQuantity;
  } else {
    updatedCart.package_items = updatedCart.package_items.filter(
      (pkg: CartPackageItem) => pkg.id !== packageId
    );
  }

  return updatedCart;
};