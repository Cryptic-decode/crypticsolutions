"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, KeyRound, Mail, UserRound, X } from "lucide-react";

import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import { DashboardPageFrame, DashboardPageHeader, DashboardSectionHeader } from "@/components/dashboard/dashboard-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

function SettingsSkeleton() {
  return (
    <DashboardPageFrame aria-busy="true" aria-label="Loading account settings">
      <div className="space-y-3 border-b border-border/70 pb-8"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-96 max-w-full" /></div>
      <div className="mt-12 space-y-8"><Skeleton className="h-44 w-full rounded-2xl" /><Skeleton className="h-36 w-full rounded-2xl" /></div>
    </DashboardPageFrame>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [user, loading, router]);

  if (loading) return <SettingsSkeleton />;
  if (!user) return null;

  const fullName = user.user_metadata?.full_name || "Not set";
  const passwordChanged = Boolean(user.user_metadata?.password_changed);
  const emailVerified = Boolean(user.email_confirmed_at);

  return (
    <DashboardPageFrame>
      <DashboardPageHeader eyebrow="Account" title="Settings" description="Review your account details and keep your sign-in information secure." />

      <section className="mt-12" aria-labelledby="profile-settings-title">
        <DashboardSectionHeader title="Profile information" description="These details identify your Cryptic Solutions account." />
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
          <div className="grid gap-3 border-b border-border/70 px-5 py-5 sm:grid-cols-[12rem_1fr] sm:px-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="h-4 w-4 text-primary" /> Full name</p>
            <p className="break-words text-sm font-medium sm:text-right">{fullName}</p>
          </div>
          <div className="grid gap-3 border-b border-border/70 px-5 py-5 sm:grid-cols-[12rem_1fr] sm:px-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4 text-primary" /> Email address</p>
            <div className="sm:text-right">
              <p className="break-all text-sm font-medium">{user.email}</p>
              <p className={`mt-1 inline-flex items-center gap-1.5 text-xs ${emailVerified ? "text-primary" : "text-destructive"}`}>{emailVerified ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{emailVerified ? "Verified" : "Verification required"}</p>
            </div>
          </div>
          <div className="grid gap-3 px-5 py-5 sm:grid-cols-[12rem_1fr] sm:px-6">
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="text-sm font-medium sm:text-right">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="security-settings-title">
        <DashboardSectionHeader title="Security" description="Use a password that you do not reuse on another service." />
        <div className="flex flex-col gap-5 rounded-xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12"><KeyRound className="h-5 w-5 text-primary" /></div>
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{passwordChanged ? "Your temporary password has been replaced." : "Your account is still using its temporary password."}</p>
            </div>
          </div>
          <Button onClick={() => setShowPasswordModal(true)} variant={passwordChanged ? "outline" : "default"}>Change password</Button>
        </div>
      </section>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </DashboardPageFrame>
  );
}
