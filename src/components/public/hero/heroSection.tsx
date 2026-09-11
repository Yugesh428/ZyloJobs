"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Check, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.2, 0, 0, 1] },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.1, ease: [0.2, 0, 0, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const TRUST_ITEMS = [
  "Active Intermediary",
  "Dual-Party Vetted",
  "End-to-End Audited",
] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=85";

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const container = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : containerVariants;
  const item = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : itemVariants;
  const image = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : imageVariants;

  return (
    <section className="relative isolate overflow-hidden bg-canvas">
      {/* =========================================================
          Background image + overlays
          ========================================================= */}
      <motion.div
        aria-hidden
        variants={image}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />

        {/*
          Legibility overlay — three layers, only as strong as needed:
          1) A vertical wash so the section blends top/bottom with the page.
          2) A left-to-right fade that only protects the copy column
             (solid on the far left, transparent by ~55% width).
          3) A very subtle canvas tint on the extreme left edge.
        */}

        {/* 1. Vertical blend — light, top and bottom only */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/70 via-transparent to-canvas/60" />

        {/* 2. Horizontal readability fade — protects text column */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(248,250,252,0.98) 0%, rgba(248,250,252,0.92) 28%, rgba(248,250,252,0.55) 50%, rgba(248,250,252,0.15) 72%, rgba(248,250,252,0) 100%)",
          }}
        />

        {/* 3. Soft extra glow behind the copy for crisp text */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-canvas/40 to-transparent" />
      </motion.div>

      {/* =========================================================
          Content
          ========================================================= */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.span
            variants={item}
            className={cn(
              "inline-flex items-center gap-2 rounded-full",
              "border border-primary/15 bg-white/70 px-3 py-1",
              "text-overline text-primary backdrop-blur-sm",
            )}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Structured Recruitment &amp; Placement Pipeline
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={item}
            className={cn(
              "mt-6 text-[2.25rem] leading-[1.05] font-extrabold tracking-tight text-ink",
              "sm:text-[3rem] lg:text-[3.75rem]",
            )}
          >
            Connecting the <span className="text-primary">right</span>{" "}
            <br className="hidden sm:inline" />
            people with the <span className="text-accent">right</span>{" "}
            opportunities.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-body-lg text-ink-muted"
          >
            ZYLO BRAINS connects employers with qualified workers through a
            structured recruitment and staffing process. We manage the entire
            recruitment journey between companies and talent.
          </motion.p>

          {/* Search card */}
          <motion.form
            variants={item}
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className={cn(
              "mt-8 flex flex-col gap-2 rounded-card border border-border",
              "bg-surface/95 p-2 shadow-raised backdrop-blur-sm",
              "sm:flex-row sm:items-center sm:gap-1",
            )}
          >
            <label className="relative flex flex-1 items-center">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 size-4 text-ink-faint"
              />
              <input
                type="text"
                name="q"
                placeholder="Job title, role, or skill"
                aria-label="Job title, role, or skill"
                className={cn(
                  "h-11 w-full rounded-control bg-transparent pl-10 pr-3",
                  "text-body-sm text-ink-soft placeholder:text-ink-faint",
                  "focus:outline-none",
                )}
              />
            </label>

            <span
              aria-hidden
              className="hidden h-7 w-px shrink-0 bg-border sm:block"
            />

            <label className="relative flex flex-1 items-center">
              <MapPin
                aria-hidden
                className="pointer-events-none absolute left-3.5 size-4 text-ink-faint"
              />
              <input
                type="text"
                name="location"
                placeholder="Location / Remote"
                aria-label="Location or remote"
                className={cn(
                  "h-11 w-full rounded-control bg-transparent pl-10 pr-3",
                  "text-body-sm text-ink-soft placeholder:text-ink-faint",
                  "focus:outline-none",
                )}
              />
            </label>

            <motion.button
              type="submit"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              className={cn(
                "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-control px-5",
                "bg-primary text-body-sm font-semibold text-white",
                "transition-colors duration-150",
                "hover:bg-primary-hover active:bg-primary-active",
              )}
            >
              Explore Jobs
              <ArrowRight className="size-4" aria-hidden />
            </motion.button>
          </motion.form>

          {/* Trust row */}
          <motion.ul
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {TRUST_ITEMS.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 text-body-sm text-ink-subtle"
              >
                <Check
                  aria-hidden
                  className="size-4 text-success"
                  strokeWidth={2.5}
                />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
