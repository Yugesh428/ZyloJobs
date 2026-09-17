"use client";

import { usePathname } from "next/navigation";
import { WorkerSidebar } from "@/components/worker/WorkerSidebar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show sidebar on login and register pages
  const isAuthPage = pathname === "/worker/login" || pathname === "/worker/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <WorkerSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
