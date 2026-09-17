"use client";

import { usePathname } from "next/navigation";
import { CompanySidebar } from "@/components/company/CompanySidebar";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/company/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <CompanySidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
