"use client";

import { Button } from "@/components/ui/button";
import { 
  Library,
  LogOut, 
  Settings,
  BarChart3,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { dashboardNavigation, isDashboardRouteActive } from "@/lib/dashboard-navigation";

interface DashboardDrawerProps {
  onClose?: () => void;
  currentPath: string;
  onSignOutClick: () => void;
}

export function DashboardDrawer({
  onClose,
  currentPath,
  onSignOutClick
}: DashboardDrawerProps) {
  const icons = {
    library: Library,
    progress: BarChart3,
    settings: Settings,
  };

  const linkVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex flex-col h-full w-full bg-background/95 backdrop-blur-sm">
      <div className="relative h-16 border-b border-border/50 px-5">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-full items-center"
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

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {dashboardNavigation.map((link, index) => {
          const isActive = isDashboardRouteActive(currentPath, link.href);
          const Icon = icons[link.icon];
          return (
            <motion.div
              key={link.href}
              initial="initial"
              animate="animate"
              variants={linkVariants}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    onClose?.();
                  }}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/15'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">{link.label}</span>
                </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/50 p-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive dark:hover:bg-destructive/10"
            onClick={onSignOutClick}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
