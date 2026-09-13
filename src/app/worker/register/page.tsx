"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Loader2, CheckCircle2,
  User, Mail, Phone, Lock, MapPin, Briefcase, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Field({
  label, id, error, icon: Icon, children,
}: {
  label: string;
  id: string;
  error?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        {children}
      </div>
      {error && <p className="text-label text-danger">{error}</p>}
    </div>
  );
}

const INPUT = cn(
  "h-11 w-full rounded-control border border-border bg-surface pl-10 pr-4",
  "text-body-sm text-ink placeholder:text-ink-faint",
  "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function WorkerRegisterPage() {
  const router = useRouter();

  const [form, setForm] = React.useState({
    fullName: "", email: "", phone: "",
    location: "", jobCategory: "", password: "", confirmPassword: "",
  });
  const [showPw, setShowPw]         = React.useState(false);
  const [showCpw, setShowCpw]       = React.useState(false);
  const [loading, setLoading]       = React.useState(false);
  const [errors, setErrors]         = React.useState<Record<string, string>>({});
  const [success, setSuccess]       = React.useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())       e.fullName    = "Full name is required.";
    if (!form.email.trim())          e.email       = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim())          e.phone       = "Phone number is required.";
    if (!form.location.trim())       e.location    = "Location is required.";
    if (!form.jobCategory.trim())    e.jobCategory = "Job category is required.";
    if (form.password.length < 8)    e.password    = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/workers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          jobCategory: form.jobCategory.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem("worker_token", data.token);
      }

      setSuccess(true);
      setTimeout(() => router.push("/worker/login"), 2500);
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-success-soft">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h2 className="text-h3 text-ink">Registration Successful!</h2>
          <p className="max-w-sm text-body-sm text-ink-muted">
            Your account has been created. Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div className="flex min-h-screen">

      {/* ── Left: Image panel ── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[56%]">
        <Image
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=85&fit=crop"
          alt="Staffing professionals collaborating"
          fill
          priority
          className="object-cover object-center"
          sizes="56vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-transparent" />

        {/* Content on top of image */}
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
            <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-sm">
              Find Your Next<br />
              <span className="text-orange-300">Career Opportunity</span>
            </h1>
            <p className="mt-4 max-w-sm text-base text-white/80 leading-relaxed">
              Join thousands of professionals who found their dream job through
              ZYLO BRAINS. Register today and get matched with top employers.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: "10K+", label: "Active Jobs" },
                { value: "5K+",  label: "Companies" },
                { value: "98%",  label: "Placement Rate" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="mt-0.5 text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm italic text-white/90 leading-relaxed">
              "ZYLO BRAINS connected me with my current employer within 2 weeks.
              The process was seamless and professional."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-orange-400 text-sm font-bold text-white">
                SR
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sunita Rai</p>
                <p className="text-xs text-white/60">Software Engineer, Kathmandu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-canvas px-6 py-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-lg">

          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <p className="text-xl font-extrabold">
              <span className="text-primary">ZYLO</span>
              <span className="ml-1 text-accent">BRAINS</span>
            </p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-h2 text-ink">Create your account</h2>
            <p className="mt-1.5 text-body-sm text-ink-muted">
              Already registered?{" "}
              <Link href="/worker/login" className="font-semibold text-primary hover:text-primary-hover">
                Sign in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Row: Full Name */}
            <Field label="Full Name *" id="fullName" error={errors.fullName} icon={User}>
              <input
                id="fullName" type="text" autoComplete="name"
                placeholder="Sunita Rai"
                value={form.fullName} onChange={set("fullName")}
                className={cn(INPUT, errors.fullName && "border-danger focus:ring-danger/15")}
              />
            </Field>

            {/* Row: Email */}
            <Field label="Email Address *" id="email" error={errors.email} icon={Mail}>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={set("email")}
                className={cn(INPUT, errors.email && "border-danger focus:ring-danger/15")}
              />
            </Field>

            {/* Row: Phone */}
            <Field label="Phone Number *" id="phone" error={errors.phone} icon={Phone}>
              <input
                id="phone" type="tel" autoComplete="tel"
                placeholder="+977 98XXXXXXXX"
                value={form.phone} onChange={set("phone")}
                className={cn(INPUT, errors.phone && "border-danger focus:ring-danger/15")}
              />
            </Field>

            {/* Row: Location */}
            <Field label="Current Location *" id="location" error={errors.location} icon={MapPin}>
              <input
                id="location" type="text"
                placeholder="Kathmandu, Nepal"
                value={form.location} onChange={set("location")}
                className={cn(INPUT, errors.location && "border-danger focus:ring-danger/15")}
              />
            </Field>

            {/* Row: Job Category */}
            <Field label="Job Category *" id="jobCategory" error={errors.jobCategory} icon={Briefcase}>
              <select
                id="jobCategory"
                value={form.jobCategory} onChange={set("jobCategory")}
                className={cn(
                  INPUT, "appearance-none cursor-pointer",
                  !form.jobCategory && "text-ink-faint",
                  errors.jobCategory && "border-danger focus:ring-danger/15",
                )}
              >
                <option value="" disabled>Select your field…</option>
                {["IT & Software","Construction","Hospitality","Security","Healthcare",
                  "Finance","Education","Retail","Manufacturing","Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            {/* Row: Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-label font-medium text-ink-muted">
                Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={set("password")}
                  className={cn(INPUT, "pr-10", errors.password && "border-danger focus:ring-danger/15")}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-label text-danger">{errors.password}</p>}
            </div>

            {/* Row: Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-label font-medium text-ink-muted">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
                <input
                  id="confirmPassword"
                  type={showCpw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={set("confirmPassword")}
                  className={cn(INPUT, "pr-10", errors.confirmPassword && "border-danger focus:ring-danger/15")}
                />
                <button type="button" onClick={() => setShowCpw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  aria-label={showCpw ? "Hide password" : "Show password"}>
                  {showCpw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-label text-danger">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            {errors.submit && (
              <div className="rounded-control border border-danger/20 bg-danger-soft px-3 py-2.5 text-body-sm text-danger">
                {errors.submit}
              </div>
            )}
            <p className="text-label text-ink-faint">
              By registering you agree to our{" "}
              <Link href="/terms" className="text-primary underline underline-offset-2">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>.
            </p>

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
                <><Loader2 className="size-4 animate-spin" />Creating account…</>
              ) : (
                <><span>Create Account</span><ChevronRight className="size-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <span className="flex-1 border-t border-border" />
            <span className="text-label text-ink-faint">or continue with</span>
            <span className="flex-1 border-t border-border" />
          </div>

          {/* Social placeholder */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Google", "LinkedIn"].map(s => (
              <button key={s} type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-control border border-border bg-surface text-body-sm font-medium text-ink-soft transition-colors hover:bg-surface-subtle">
                {s}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
