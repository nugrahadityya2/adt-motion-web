"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-10">
      <nav
        aria-label="Primary"
        className="glass-surface mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full px-4 sm:px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          <span className="logo-animated inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#C2410C] font-display text-[11px] font-extrabold tracking-tight text-white ring-1 ring-black/10 dark:bg-[#FF6D29] dark:text-[#161316] dark:ring-white/20">
            ADT
          </span>
          <span className="font-display text-sm font-bold tracking-tight sm:text-base">
            ADT Motion
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/showcase"
            className={`px-3 py-2 text-xs font-semibold transition-colors ${
              pathname === "/showcase"
                ? "text-[#C2410C] dark:text-[#FF6D29]"
                : "text-[var(--text-muted)] hover:text-[#C2410C] dark:hover:text-[#FF6D29]"
            }`}
          >
            Recipes
          </Link>
          <ThemeToggle />
          <Link
            href="/editor"
            className="btn-tactile rounded-full bg-[#C2410C] px-4 py-2 font-display text-xs font-bold text-white shadow-sm hover:opacity-90 sm:px-5 dark:bg-[#FF6D29] dark:text-[#161316]"
          >
            Open Studio
          </Link>
        </div>
      </nav>
    </header>
  );
}
