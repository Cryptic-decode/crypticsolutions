"use client";

import { Button } from "@/components/ui/button";
import { 
  Library,
  LogOut, 
  Moon, 
  Settings,
  Sun,
  BarChart3,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
      label: "My Library",
      icon: <Library className="h-5 w-5" />
    },
    {
      href: "/progress",
      label: "Progress",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // Animation variants
  const linkVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    hover: { x: 4 },
  };

  return (
    <div className="flex flex-col h-full w-full bg-background/95 backdrop-blur-sm">
      {/* Header with Logo - match app header height */}
      <div className="h-16 border-b border-border/50 px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full flex items-center justify-center"
        >
          <div className="relative flex items-center">
            <Image
              src="/cryptic-assets/fullLogo.png" 
              alt="Cryptic Solutions" 
              width={132} 
              height={32}
              className="h-8 w-auto dark:hidden"
              priority
            />
            <Image
              src="/cryptic-assets/fullLogo2.png" 
              alt="Cryptic Solutions" 
              width={132} 
              height={32}
              className="h-8 w-auto hidden dark:block"
              priority
            />
          </div>
        </motion.div>
        {/* Close button - only show on mobile when drawer is used */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-secondary/50 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link, index) => {
          // Handle active state: exact match or starts with (for nested routes)
          const isActive = currentPath === link.href || 
            (link.href !== "/dashboard" && currentPath?.startsWith(link.href));
          return (
            <motion.div
              key={link.href}
              initial="initial"
              animate="animate"
              variants={linkVariants}
              transition={{ delay: index * 0.05 }}
            >
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
                <Link 
                  href={link.href}
                  onClick={() => {
                    onClose?.();
                  }}
                  className={`relative flex items-center gap-3 text-base font-medium rounded-lg px-4 py-3 transition-all duration-200 group
                    ${
                      isActive
                        ? 'text-primary bg-primary/10 dark:bg-primary/15'
                        : 'text-[#1B2242] dark:text-white hover:text-primary hover:bg-secondary/40 dark:hover:bg-secondary/30'
                    }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.span 
                    className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                    whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                  >
                    {link.icon}
                  </motion.span>
                  <span className="flex-1">{link.label}</span>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto p-4 border-t border-border/50 space-y-3">
        {/* Theme Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-3 bg-secondary/20 dark:bg-secondary/10 rounded-lg hover:bg-secondary/30 dark:hover:bg-secondary/20 transition-colors"
        >
          <span className="text-sm font-medium text-[#1B2242] dark:text-white">Theme</span>
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-secondary/30 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-[#1B2242] dark:text-white" />
            ) : (
              <Moon className="h-5 w-5 text-[#1B2242] dark:text-white" />
            )}
          </motion.button>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-border/50 hover:border-destructive/50 hover:bg-destructive/5 dark:hover:bg-destructive/10 transition-colors"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}