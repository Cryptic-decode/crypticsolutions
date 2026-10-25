"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { showError, showSuccess } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn: signInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInUser(formData.email, formData.password.trim());
      
      // Wait a bit for session to be established
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      showSuccess("Signed in successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      showError(error, "auth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to access your products and learning progress."
      footer={
        <>
          Need help?{" "}
          <a href="mailto:info@crypticsolutionsltd.com" className="font-medium text-primary hover:underline">
            Contact support
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <fieldset disabled={loading} className="space-y-5 border-0 p-0 disabled:cursor-wait disabled:opacity-70">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="you@example.com"
              className="mt-2 h-12"
              autoComplete="email"
              required
            />
          </div>

          <PasswordField
            id="password"
            value={formData.password}
            onChange={(password) => setFormData({ ...formData, password })}
          />

          <div className="flex items-center justify-end">
            <Link href="/reset-password" className="text-xs font-medium text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" className="h-12 w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </fieldset>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-muted/15 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
