import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  PackageIcon,
  TagsIcon,
  DiscountTag01Icon,
  ShoppingCart01Icon,
  UserGroupIcon,
  StarIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: IconSvgElement;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardSquare01Icon },
  { label: "Products", href: "/admin/products", icon: PackageIcon },
  { label: "Categories & brands", href: "/admin/categories", icon: TagsIcon },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart01Icon },
  { label: "Coupons", href: "/admin/coupons", icon: DiscountTag01Icon },
  { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
  { label: "Customers", href: "/admin/customers", icon: UserGroupIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings01Icon },
];