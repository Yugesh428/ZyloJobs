"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/footer/footer";
import type { ReactNode } from "react";

export function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <SessionProvider>
      {!isAdmin && <Navbar />}
      <div className="flex flex-1 flex-col">{children}</div>
      {!isAdmin && <Footer />}
    </SessionProvider>
  );
}
