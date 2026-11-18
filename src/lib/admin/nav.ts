import type { Permission } from "@/lib/admin/auth";

export interface AdminNavItem {
  label: string;
  href: string;
  /** shown only to staff with this permission */
  permission?: Permission;
  /** false = planned for a later phase; shown greyed out with "Soon" */
  ready: boolean;
}

export const ADMIN_NAV: { group: string; items: AdminNavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", ready: true },
      { label: "Reports", href: "/admin/reports", permission: "orders.view", ready: true },
    ],
  },
  {
    group: "Shop",
    items: [
      { label: "Products", href: "/admin/products", permission: "products.manage", ready: true },
      { label: "Categories & brands", href: "/admin/categories", permission: "catalog.manage", ready: true },
      { label: "Solar kits", href: "/admin/kits", permission: "catalog.manage", ready: true },
      { label: "Collections", href: "/admin/collections", permission: "catalog.manage", ready: true },
      { label: "Orders", href: "/admin/orders", permission: "orders.view", ready: true },
      { label: "Quote requests", href: "/admin/quotes", permission: "quotes.manage", ready: true },
      { label: "Customers", href: "/admin/customers", permission: "customers.view", ready: true },
    ],
  },
  {
    group: "Website",
    items: [
      { label: "Site settings", href: "/admin/settings", permission: "settings.manage", ready: true },
      { label: "Banners & slides", href: "/admin/banners", permission: "content.manage", ready: true },
      { label: "Emails", href: "/admin/emails", permission: "settings.manage", ready: true },
      { label: "Pages", href: "/admin/pages", permission: "content.manage", ready: true },
      { label: "Media library", href: "/admin/media", permission: "media.manage", ready: true },
      { label: "Calculator settings", href: "/admin/calculator", permission: "calculator.manage", ready: true },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Team & roles", href: "/admin/team", permission: "team.manage", ready: true },
      { label: "Activity log", href: "/admin/activity", permission: "activity.view", ready: true },
      { label: "Backup & export", href: "/admin/backup", permission: "team.manage", ready: true },
    ],
  },
];
