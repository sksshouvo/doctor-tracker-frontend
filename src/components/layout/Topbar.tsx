"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur md:px-4">
      <SidebarTrigger aria-label="Toggle sidebar" />
      <div className="bg-border mx-1 h-5 w-px" aria-hidden />
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
