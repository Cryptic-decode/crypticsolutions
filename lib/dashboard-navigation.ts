export const dashboardNavigation = [
  { href: "/dashboard", label: "My Library", icon: "library" },
  { href: "/progress", label: "Progress", icon: "progress" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

const dashboardPageTitles: Record<string, string> = {
  "/dashboard": "My Library",
  "/progress": "Study progress",
  "/settings": "Settings",
};

const courseNames: Record<string, string> = {
  "ielts-manual": "IELTS Manual",
};

export function isDashboardRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href || pathname.startsWith("/course/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDashboardPageTitle(pathname: string) {
  if (pathname.startsWith("/course/")) {
    const productId = pathname.split("/course/")[1]?.split("/")[0];
    return courseNames[productId] ?? "Course";
  }

  return dashboardPageTitles[pathname] ?? "Dashboard";
}
