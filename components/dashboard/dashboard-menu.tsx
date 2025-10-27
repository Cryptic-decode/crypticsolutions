"use client";

import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Home,
  Settings,
  LogOut,
  Moon,
  Sun,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface DashboardMenuProps {
  onClose: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignOut: () => void;
}

export function DashboardMenu({
  onClose,
  darkMode,
  toggleDarkMode,
  onSignOut
}: DashboardMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home
    },
    {
      name: "My Library",
      href: "/dashboard/library",
      icon: BookOpen
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings
    }
  ];

  return (
    <div className="p-6 flex flex-col h-full">
      {/* Navigation Links */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 text-base font-semibold rounded-lg p-3 transition-all
                ${isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/50"
                }`}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all">
          <span className="text-base font-semibold text-[#1B2242] dark:text-white">Theme</span>
          <button
            onClick={() => {
              toggleDarkMode();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto pt-6 border-t">
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              onSignOut();
              onClose();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
