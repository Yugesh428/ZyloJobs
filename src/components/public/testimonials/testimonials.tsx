import { Star } from "lucide-react";
import { Reveal } from "@/components/public/reveak/reveal";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Avatar tones                                                              */
/* -------------------------------------------------------------------------- */

type AvatarTone = "primary" | "accent" | "info";

const AVATAR_TONES: Record<AvatarTone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-hover",
  info: "bg-info-soft text-info",
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const TESTIMONIALS = [
  {
    quote:
      "ZYLO BRAINS transformed our technical recruitment bottlenecks. Their structured intermediary model ensured candidates arrived thoroughly evaluated, aligned on salary, and ready for immediate deployment.",
    name: "Marcus Kendrick",
    role: "VP of Human Resources",
    company: "CloudScale Systems",
    initials: "MK",
    avatarTone: "primary" as AvatarTone,
  },
  {
    quote:
      "Navigating the job market usually feels disconnected, but ZYLO BRAINS was an attentive partner at each stage. They matched my credentials directly to an executive position that matched my exact career aspirations.",
    name: "Elena Rostova",
    role: "Placed Operations Director",
    company: "Apex Group",
    initials: "AL",
    avatarTone: "accent" as AvatarTone,
  },
  {
    quote:
      "Staffing clinical teams across five regional locations required precision. ZYLO BRAINS exceeded all compliance expectations and shortened our time-to-hire by over 40%. Highly recommended staffing partners.",
    name: "Dr. Aris Thorne",
    role: "Chief Medical Officer",
    company: "MetroCare Alliance",
    initials: "DR",
    avatarTone: "info" as AvatarTone,
  },
] as const;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function Testimonials() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---------- Header ---------- */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="overline !text-accent">Proven partnerships</p>

            <h2 className="mt-3 text-h2 text-ink">
              What Our Clients &amp; Candidates Say
            </h2>

            <p className="mt-4 text-body text-ink-muted">
              Transparent feedback from enterprise leaders hiring talent and
              professionals building careers through ZYLO BRAINS.
            </p>
          </div>
        </Reveal>

        {/* ---------- Grid ---------- */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure
                className={cn(
                  "flex h-full flex-col gap-5 rounded-card border border-border",
                  "bg-surface p-6 shadow-card",
                  "transition-all duration-200 ease-[var(--ease-standard)]",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-raised",
                )}
              >
                {/* ---------- Stars ---------- */}
                <div
                  aria-label="5 out of 5 stars"
                  className="flex items-center gap-0.5"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      aria-hidden
                      className="size-4 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* ---------- Quote ---------- */}
                <blockquote className="text-body-sm italic leading-relaxed text-ink-muted">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* ---------- Author ---------- */}
                <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-5">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      "text-caption font-bold tracking-wide",
                      AVATAR_TONES[t.avatarTone],
                    )}
                  >
                    {t.initials}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-h6 leading-tight text-ink">
                      {t.name}
                    </p>
                    <p className="mt-0.5 truncate text-caption text-ink-subtle">
                      {t.role}
                      <span aria-hidden className="mx-1.5">
                        ·
                      </span>
                      {t.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
