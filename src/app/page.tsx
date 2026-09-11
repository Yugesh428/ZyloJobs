import { Categories } from "@/components/public/categories/categories";
import { FeaturedJobs } from "@/components/public/featuredJobs/featuredJobs";
import { Hero } from "@/components/public/hero/heroSection";
import { TopJobs } from "@/components/public/ourTopJobs/ourTopJob";
import { Testimonials } from "@/components/public/testimonials/testimonials";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Keep the hero first and unchanged. */}
      <Hero />
      <TopJobs />
      <Categories />
      <FeaturedJobs />
      <Testimonials />
    </main>
  );
}
