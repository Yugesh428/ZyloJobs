"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const callbackUrl  = params.get("callbackUrl") ?? "/admin/dashboard";

  const [email,    setEmail]    = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw,   setShowPw]   = React.useState(false);
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary shadow-raised">
            <ShieldCheck className="size-7 text-white" aria-hidden />
          </div>
          <h1 className="text-h3 text-ink">Admin Portal</h1>
          <p className="mt-1 text-body-sm text-ink-muted">
            Sign in to the ZYLO BRAINS admin dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-label font-medium text-ink-muted">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zylobrains.com"
                className={cn(
                  "h-11 rounded-control border border-border bg-surface px-3",
                  "text-body-sm text-ink placeholder:text-ink-faint",
                  "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                )}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-label font-medium text-ink-muted">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "h-11 w-full rounded-control border border-border bg-surface px-3 pr-10",
                    "text-body-sm text-ink placeholder:text-ink-faint",
                    "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  {showPw ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-control border border-danger/20 bg-danger-soft px-3 py-2.5 text-body-sm text-danger">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "inline-flex w-full h-11 items-center justify-center gap-2 rounded-control",
                "bg-primary text-body-sm font-semibold text-white",
                "transition-colors hover:bg-primary-hover active:bg-primary-active",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-caption text-ink-faint">
          This portal is restricted to authorised ZYLO BRAINS staff only.
        </p>
      </div>
    </div>
  );
}
