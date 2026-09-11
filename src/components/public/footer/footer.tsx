import Link from "next/link";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Link data                                                                 */
/* -------------------------------------------------------------------------- */

const LINK_GROUPS = [
  {
    id: "candidates",
    heading: "For Candidates",
    links: [
      { label: "Explore All Jobs", href: "/jobs" },
      { label: "Career Pathways", href: "/careers" },
      { label: "Direct Screening", href: "/screening" },
      { label: "Candidate FAQ", href: "/faq" },
    ],
  },
  {
    id: "employers",
    heading: "For Employers",
    links: [
      { label: "Staffing Solutions", href: "/staffing" },
      { label: "Post Requisition", href: "/post-job" },
      { label: "Placement Guarantee", href: "/guarantee" },
      { label: "Enterprise Portal", href: "/portal" },
    ],
  },
  {
    id: "company",
    heading: "Company",
    links: [
      { label: "About ZYLO BRAINS", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Security", href: "/security" },
  { label: "Equal Opportunity Employer", href: "/eeo" },
] as const;

const BADGES = ["SOC2 Compliant", "Verified Pipeline"] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-footer text-footer-text">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        {/* ================== Top: brand + link columns ================== */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ---------- Brand block ---------- */}
          <div className="lg:col-span-5 lg:pr-8">
            <Link
              href="/"
              aria-label="ZYLO BRAINS — Home"
              className="inline-flex items-center text-xl font-extrabold tracking-tight"
            >
              <span className="text-primary">ZYLO</span>
              <span className="ml-1.5 text-accent">BRAINS</span>
            </Link>

            <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-footer-text">
              ZYLO BRAINS connects employers with qualified workers through a
              structured recruitment and staffing process. We manage the entire
              recruitment journey between companies and talent.
            </p>

            {/* Compliance badges */}
            <ul className="mt-6 flex flex-wrap items-center gap-2">
              {BADGES.map((badge) => (
                <li key={badge}>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border border-white/10",
                      "bg-white/5 px-2.5 py-1",
                      "text-label font-medium text-footer-link",
                    )}
                  >
                    {badge}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Link columns ---------- */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {LINK_GROUPS.map((group) => (
              <nav
                key={group.id}
                aria-labelledby={`footer-${group.id}`}
                className="min-w-0"
              >
                <h3
                  id={`footer-${group.id}`}
                  className="text-overline !text-footer-text"
                >
                  {group.heading}
                </h3>

                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-body-sm text-footer-link",
                          "transition-colors duration-150",
                          "hover:text-white hover:underline",
                          "underline-offset-4",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ================== Bottom bar ================== */}
        <div
          className={cn(
            "mt-12 flex flex-col items-start gap-4 border-t border-white/10 pt-6",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p className="text-caption text-footer-text">
            © {year} ZYLO BRAINS Talent Solutions. All rights reserved.
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-caption text-footer-text",
                    "transition-colors duration-150 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
