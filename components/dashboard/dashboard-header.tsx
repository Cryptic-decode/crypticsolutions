"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "My Library",
  "/dashboard/progress": "Study Progress",
  "/dashboard/settings": "Settings",
  "/dashboard/support": "Support",
  "/dashboard/updates": "Updates",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" disabled>
              <Sun className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-muted"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
