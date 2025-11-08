"use client";

import { Button } from "@/components/ui/button";
import { 
  BookOpen,
  Home,
  Library,
  LogOut, 
  Moon, 
  Settings,
  Sun, 
  User 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DashboardDrawerProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  onSignOut: () => void;
  onClose?: () => void;
  currentPath: string;
}

export function DashboardDrawer({
  darkMode,
  toggleDarkMode,
  onSignOut,
  onClose,
  currentPath
}: DashboardDrawerProps) {
  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />
    },
    {
      href: "/dashboard/library",
      label: "My Library",
      icon: <Library className="h-5 w-5" />
    },
    {
      href: "/dashboard/manuals",
      label: "IELTS Manual",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with User Info */}
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/cryptic-assets/fullLogo.png" 
            alt="Cryptic Solutions" 
            width={140} 
            height={35}
            className="h-[35px] w-auto dark:hidden"
          />
          <Image
            src="/cryptic-assets/fullLogo2.png" 
            alt="Cryptic Solutions" 
            width={140} 
            height={35}
            className="h-[35px] w-auto hidden dark:block"
          />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              onClick={() => {
                onClose?.();
              }}
              className={`flex items-center gap-3 text-lg md:text-base font-semibold text-[#1B2242] dark:text-white 
                       hover:text-primary hover:bg-secondary/50 rounded-lg p-4 md:p-3 transition-all
                       ${currentPath === link.href ? 'bg-secondary/50 text-primary' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto p-6 pt-0">
        <div className="border-t pt-6 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
            <span className="text-base font-semibold text-[#1B2242] dark:text-white">Theme</span>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Sign Out Button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}