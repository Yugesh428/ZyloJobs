"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/footer/footer";
import type { ReactNode } from "react";

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCompany = pathname.startsWith("/company");
  const isWorker = pathname.startsWith("/worker");
  
  const hideNavFooter = isAdmin || isCompany || isWorker;

  return (
    <>
      {!hideNavFooter && <Navbar />}
      <div className="flex flex-1 flex-col">{children}</div>
      {!hideNavFooter && <Footer />}
    </>
  );
}
