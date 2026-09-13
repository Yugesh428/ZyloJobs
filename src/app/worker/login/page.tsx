"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Loader2, Mail, Lock, ChevronRight,
  ShieldCheck, Briefcase, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function WorkerLoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw,   setShowPw]   = React.useState(false);
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/workers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem("worker_token", data.token);
      }

      // Redirect to worker dashboard (create later)
      router.push("/worker/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const INPUT = cn(
    "h-11 w-full rounded-control border border-border bg-surface pl-10 pr-4",
    "text-body-sm text-ink placeholder:text-ink-faint",
    "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
  );

  return (
    <div className="flex min-h-screen">

      {/* ── Left: Image panel ── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[56%]">
        <Image
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=85&fit=crop"
          alt="Professional team at work"
          fill
          priority
          className="object-cover object-center"
          sizes="56vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b192c]/90 via-primary/70 to-primary/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Brand */}
          <div>
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-white">ZYLO</span>
              <span className="ml-1 text-orange-300">BRAINS</span>
            </p>
            <p className="mt-1 text-sm text-white/70">Staffing &amp; Workforce Solutions</p>
          </div>

          {/* Hero copy */}
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              Welcome Back,<br />
              <span className="text-orange-300">Professional.</span>
            </h1>
            <p className="mt-4 max-w-sm text-base text-white/80 leading-relaxed">
              Log in to access your job matches, track your applications,
              and connect with top employers across Nepal.
            </p>

            {/* Feature bullets */}
            <div className="mt-8 space-y-3">
              {[
                { icon: Briefcase, text: "Access thousands of verified job openings" },
                { icon: ShieldCheck, text: "Pre-screened by ZYLO BRAINS recruiters" },
                { icon: Users, text: "Direct connections to top companies" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15">
                    <Icon className="size-4 text-white" />
                  </div>
                  <span className="text-sm text-white/85">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom card */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-400 text-sm font-bold text-white">
                AM
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Aakash Magar</p>
                <p className="text-xs text-white/60 mb-2">Civil Engineer · Pokhara</p>
                <p className="text-sm italic text-white/85">
                  "Got placed within 3 weeks. The platform made the entire process easy and transparent."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-canvas px-6 py-12 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <p className="text-xl font-extrabold">
              <span className="text-primary">ZYLO</span>
              <span className="ml-1 text-accent">BRAINS</span>
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-h2 text-ink">Sign in to your account</h2>
            <p className="mt-1.5 text-body-sm text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link href="/worker/register" className="font-semibold text-primary hover:text-primary-hover">
                Register for free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-label font-medium text-ink-muted">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                <input
                  id="email" type="email" autoComplete="email"
                  required placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-label font-medium text-ink-muted">
                  Password
                </label>
                <Link href="/worker/forgot-password"
                  className="text-label font-medium text-primary hover:text-primary-hover">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className={cn(INPUT, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5">
              <input type="checkbox" className="size-4 rounded accent-primary" />
              <span className="text-body-sm text-ink-muted">Keep me signed in</span>
            </label>

            {/* Error */}
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
                "inline-flex w-full h-12 items-center justify-center gap-2 rounded-control",
                "bg-primary text-body-sm font-semibold text-white",
                "transition-colors hover:bg-primary-hover active:bg-primary-active",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin" />Signing in…</>
              ) : (
                <><span>Sign In</span><ChevronRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 border-t border-border" />
            <span className="text-label text-ink-faint">or continue with</span>
            <span className="flex-1 border-t border-border" />
          </div>

          {/* Social placeholders */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Google", "LinkedIn"].map(s => (
              <button key={s} type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control border border-border bg-surface text-body-sm font-medium text-ink-soft transition-colors hover:bg-surface-subtle">
                {s}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-caption text-ink-faint">
            Are you a company?{" "}
            <Link href="/company/register" className="text-primary underline underline-offset-2">
              Register your company
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
