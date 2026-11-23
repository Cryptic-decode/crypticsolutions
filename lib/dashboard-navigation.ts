export const dashboardNavigation = [
  { href: "/dashboard", label: "My Library", icon: "library" },
  { href: "/practice", label: "Practice", icon: "practice" },
  { href: "/progress", label: "Progress", icon: "progress" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

const dashboardPageTitles: Record<string, string> = {
  "/dashboard": "My Library",
  "/practice": "IELTS Practice",
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

  if (pathname.startsWith("/practice/reading")) return "Reading Practice";
  if (pathname.startsWith("/practice/listening")) return "Listening Practice";
  if (pathname.startsWith("/practice")) return "IELTS Practice";

  return dashboardPageTitles[pathname] ?? "Dashboard";
}
