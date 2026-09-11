/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*  Nav data                                                                  */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/job" },
  { label: "Contact", href: "/contact" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Logo                                                                      */
/* -------------------------------------------------------------------------- */

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="ZYLO BRAINS — Home"
      className={cn(
        "flex items-center text-xl font-extrabold tracking-tight",
        "transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span className="text-primary">ZYLO</span>
      <span className="ml-1.5 text-accent">BRAINS</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search                                                                    */
/* -------------------------------------------------------------------------- */

function SearchBar({ className }: { className?: string }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={cn("relative w-full max-w-xl", className)}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint"
      />
      <input
        type="search"
        name="q"
        placeholder="Search jobs, skills, companies..."
        aria-label="Search jobs, skills, companies"
        className={cn(
          "h-11 w-full rounded-full border border-border bg-surface",
          "pl-11 pr-4 text-body-sm text-ink-soft",
          "placeholder:text-ink-faint",
          "transition-colors duration-150",
          "hover:border-border-muted",
          "focus:border-primary focus:outline-none",
          "focus:ring-2 focus:ring-primary/15",
        )}
      />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav links                                                                 */
/* -------------------------------------------------------------------------- */

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-11 items-center px-1 text-body-sm font-medium",
        "transition-colors duration-150",
        active ? "text-primary" : "text-ink-subtle hover:text-ink",
      )}
    >
      {label}
      {/* Active underline */}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-primary",
          "origin-left transition-transform duration-200 ease-[var(--ease-standard)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                    */
/* -------------------------------------------------------------------------- */

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isLoading = status === "loading";

  // Close the mobile drawer on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">        {/* -------- Left: Logo + primary nav -------- */}
        <div className="flex items-center gap-8">
          <Logo />

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                }
              />
            ))}
          </nav>
        </div>

        {/* -------- Center: Search -------- */}
        <div className="hidden flex-1 justify-center lg:flex">
          <SearchBar />
        </div>

        {/* -------- Right: Auth + actions -------- */}
        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-control bg-surface-subtle" />
          ) : isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-control px-4",
                  "bg-primary text-body-sm font-semibold text-white",
                  "transition-colors duration-150",
                  "hover:bg-primary-hover active:bg-primary-active"
                )}
              >
                <LayoutDashboard className="size-4" aria-hidden />
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-body-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Login
              </Link>

              <span aria-hidden className="h-6 w-px bg-border" />

              <Link
                href="/post-job"
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-control px-4",
                  "bg-primary text-body-sm font-semibold text-white",
                  "transition-colors duration-150",
                  "hover:bg-primary-hover active:bg-primary-active"
                )}
              >
                <Plus className="size-4" aria-hidden />
                Post a Job
              </Link>

              <Link
                href="/signup"
                className={cn(
                  "inline-flex h-10 items-center rounded-control px-4",
                  "bg-accent text-body-sm font-semibold text-white",
                  "transition-colors duration-150",
                  "hover:bg-accent-hover"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* -------- Mobile toggle -------- */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "ml-auto grid size-10 place-items-center rounded-control lg:hidden",
            "text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink",
          )}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* -------- Mobile drawer -------- */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-border bg-surface lg:hidden"
        >
          <div className="space-y-5 px-4 py-6 sm:px-6">
            <SearchBar />

            <nav aria-label="Mobile" className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center border-b border-border text-body-sm font-medium",
                      active ? "text-primary" : "text-ink-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between">
              {isLoading ? (
                <div className="h-10 w-32 animate-pulse rounded-control bg-surface-subtle" />
              ) : isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-control px-4",
                    "bg-primary text-body-sm font-semibold text-white"
                  )}
                >
                  <LayoutDashboard className="size-4" aria-hidden />
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-body-sm font-semibold text-primary"
                  >
                    Login
                  </Link>

                  <div className="flex gap-2">
                    <Link
                      href="/post-job"
                      className="inline-flex h-10 items-center gap-1.5 rounded-control bg-primary px-4 text-body-sm font-semibold text-white"
                    >
                      <Plus className="size-4" aria-hidden />
                      Post a Job
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex h-10 items-center rounded-control bg-accent px-4 text-body-sm font-semibold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
