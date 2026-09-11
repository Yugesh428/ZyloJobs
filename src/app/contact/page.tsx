"use client";

import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Company info data                                                         */
/* -------------------------------------------------------------------------- */

const INFO_ITEMS = [
  {
    icon: MapPin,
    label: "Office Address",
    value: "Durbarmarg, Kathmandu 44600, Nepal",
    sub: "Zylo Brains Recruitment Hub",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+977 1-4XXXXXX",
    sub: "Mon – Fri, 9:00 AM – 6:00 PM NPT",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@zylobrains.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Sunday – Friday",
    sub: "9:00 AM – 6:00 PM NPT",
  },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ContactPage() {
  return (
    <main className="flex-1 bg-canvas">
      {/* ── Page header ── */}
      <div className="bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="overline !text-primary">Get in touch</p>
          <h1 className="mt-2 text-h1 text-ink">Contact Us</h1>
          <p className="mt-3 max-w-xl text-body text-ink-muted">
            Whether you&apos;re an employer looking to hire or a candidate
            exploring opportunities — our team is ready to help.
          </p>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* ════════════════════════════════
              LEFT — Contact form
              ════════════════════════════════ */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-h4 text-ink">Send us a message</h2>
            <p className="mt-1 text-body-sm text-ink-muted">
              Fill in the form and we&apos;ll get back to you within one
              business day.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6 space-y-4"
            >
              {/* Name row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="firstName"
                    className="text-label font-medium text-ink-muted"
                  >
                    First name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="Aarav"
                    className={cn(
                      "h-11 rounded-control border border-border bg-surface px-3",
                      "text-body-sm text-ink placeholder:text-ink-faint",
                      "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="lastName"
                    className="text-label font-medium text-ink-muted"
                  >
                    Last name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Sharma"
                    className={cn(
                      "h-11 rounded-control border border-border bg-surface px-3",
                      "text-body-sm text-ink placeholder:text-ink-faint",
                      "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                    )}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-label font-medium text-ink-muted"
                >
                  Email address <span className="text-danger">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={cn(
                    "h-11 rounded-control border border-border bg-surface px-3",
                    "text-body-sm text-ink placeholder:text-ink-faint",
                    "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                  )}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-label font-medium text-ink-muted"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  className={cn(
                    "h-11 rounded-control border border-border bg-surface px-3",
                    "text-body-sm text-ink placeholder:text-ink-faint",
                    "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                  )}
                />
              </div>

              {/* Enquiry type */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="type"
                  className="text-label font-medium text-ink-muted"
                >
                  Enquiry type <span className="text-danger">*</span>
                </label>
                <select
                  id="type"
                  required
                  defaultValue=""
                  className={cn(
                    "h-11 rounded-control border border-border bg-surface px-3",
                    "text-body-sm text-ink",
                    "transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                  )}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option>I am an Employer</option>
                  <option>I am a Job Seeker</option>
                  <option>Partnership / Collaboration</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-label font-medium text-ink-muted"
                >
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  className={cn(
                    "rounded-control border border-border bg-surface px-3 py-2.5",
                    "text-body-sm text-ink placeholder:text-ink-faint",
                    "resize-none transition-colors",
                    "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15",
                  )}
                />
              </div>

              <button
                type="submit"
                className={cn(
                  "inline-flex w-full h-11 items-center justify-center gap-2 rounded-control",
                  "bg-primary text-body-sm font-semibold text-white",
                  "transition-colors hover:bg-primary-hover active:bg-primary-active",
                )}
              >
                Send Message
                <Send className="size-4" aria-hidden />
              </button>
            </form>
          </div>

          {/* ════════════════════════════════
              RIGHT — Company info
              ════════════════════════════════ */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
            <h2 className="text-h4 text-ink">Our Office</h2>
            <p className="mt-1 text-body-sm text-ink-muted">
              Visit us or reach out through any of the channels below.
            </p>

            <ul className="mt-6 space-y-5">
              {INFO_ITEMS.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl",
                      "bg-primary-soft text-primary",
                    )}
                  >
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-label font-semibold text-ink-subtle uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-body-sm font-semibold text-ink">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-caption text-ink-faint">
                      {item.sub}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ════════════════════════════════
            FULL-WIDTH MAP — below both columns
            ════════════════════════════════ */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3">
            <MapPin className="size-4 text-primary" aria-hidden />
            <span className="text-body-sm font-semibold text-ink">
              Durbarmarg, Kathmandu
            </span>
            <span className="ml-2 text-caption text-ink-faint">
              Zylo Brains Recruitment Hub
            </span>
          </div>
          <iframe
            title="ZYLO BRAINS Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4692!2d85.3119!3d27.7172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a74e9c41d%3A0x1b0b0b0b0b0b0b0b!2sDurbar%20Marg%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1620000000000!5m2!1sen!2snp"
            width="100%"
            height="420"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </main>
  );
}
