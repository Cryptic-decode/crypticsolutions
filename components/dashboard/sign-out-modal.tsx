"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LogOut } from "lucide-react";

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
    <Modal isOpen={isOpen} onClose={onClose} title="Sign out">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Leave your learning workspace?</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">You will need to sign in again to access your library and protected course materials.</p>
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
          <Button
              variant="destructive"
              onClick={handleConfirm}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
        </div>
      </div>
    </Modal>
  );
}
