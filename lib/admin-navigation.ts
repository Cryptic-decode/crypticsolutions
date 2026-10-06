export const adminNavigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/partners", label: "Partners", icon: "partners" },
] as const;

const adminPageTitles: Record<string, string> = {
  "/admin/dashboard": "Admin dashboard",
  "/admin/partners": "Partner Programme",
};

export function isAdminRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string) {
  return adminPageTitles[pathname] ?? "Administration";
}
