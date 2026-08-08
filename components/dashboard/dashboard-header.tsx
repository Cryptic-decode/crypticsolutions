"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun, User } from "lucide-react";

interface DashboardHeaderProps {
  pageTitle: string;
  userName?: string;
  userEmail?: string;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export function DashboardHeader({ pageTitle, userName, userEmail, darkMode, onToggleTheme }: DashboardHeaderProps) {
  return (
    <div className="flex h-full items-center px-6">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-semibold tracking-tight">{pageTitle}</p>
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-[#1B2242] dark:text-white">
                {userName || "User"}
              </p>
              {userEmail && (
                <p className="text-xs text-muted-foreground">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="hover:bg-muted"
            aria-label={darkMode ? "Use light theme" : "Use dark theme"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
