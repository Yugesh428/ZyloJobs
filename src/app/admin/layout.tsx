"use client";

import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // SessionProvider is now in root layout, no need to duplicate here
  return <>{children}</>;
}
