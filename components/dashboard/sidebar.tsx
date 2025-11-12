"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Settings,
  BarChart,
  HelpCircle,
  Bell,
  LogOut,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onSignOut: () => void;
}

export function Sidebar({ className, onSignOut, ...props }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "My Library",
      icon: BookOpen,
    },
    {
      href: "/dashboard/progress",
      label: "Study Progress",
      icon: BarChart,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
    {
      href: "/dashboard/support",
      label: "Support",
      icon: HelpCircle,
    },
    {
      href: "/dashboard/updates",
      label: "Updates",
      icon: Bell,
    },
  ];

  return (
    <div className={cn("pb-12 min-h-screen", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <Link href="/">
            <div className="mb-8">
              <img
                src="/cryptic-assets/fullLogo.png"
                alt="Cryptic Solutions"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/cryptic-assets/fullLogo2.png"
                alt="Cryptic Solutions"
                className="h-8 w-auto hidden dark:block"
              />
            </div>
          </Link>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3")} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground font-medium"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
