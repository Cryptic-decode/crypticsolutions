export const adminNavigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/partners", label: "Partners", icon: "partners" },
  { href: "/admin/practice", label: "Practice", icon: "practice" },
] as const;

const adminPageTitles: Record<string, string> = {
  "/admin/dashboard": "Admin dashboard",
  "/admin/partners": "Partner Programme",
  "/admin/practice": "Practice content",
};

export function isAdminRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string) {
  return adminPageTitles[pathname] ?? "Administration";
}
