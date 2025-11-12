"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LogOut, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out">
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold mb-2 text-[#1B2242] dark:text-white">
              Are you sure you want to sign out?
            </h3>
            <p className="text-sm text-muted-foreground">
              You'll need to sign in again to access your dashboard and course materials.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border/50 hover:border-border transition-colors"
          >
            Cancel
          </Button>
          <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}

