"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "left" | "right";
  showCloseButton?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = "right",
  showCloseButton = true,
}: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: position === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: position === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${position}-0 h-screen w-full md:w-[400px]
                     bg-background md:border-${position === "right" ? "l" : "r"} 
                     shadow-2xl z-50 overflow-y-auto`}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`absolute ${position === "right" ? "left-4" : "right-4"} top-4 
                         p-2 rounded-lg hover:bg-secondary/50 transition-colors`}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}