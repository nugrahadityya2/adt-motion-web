"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D4CFC4] bg-[#F5F3EE]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center border border-[#141413] bg-[#141413] text-xs font-semibold tracking-tighter text-[#F5F3EE] logo-animated">
            TM
          </span>
          <span className="font-serif text-2xl tracking-tight">TypeMotion</span>
          <span className="border border-[#D4CFC4] bg-[#FAF9F6] px-1.5 py-0.5 text-[10px] font-medium tracking-widest text-[#5C5A54]">
            BETA
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
          <Link
            href="/showcase"
            className={`px-3 py-2 text-xs font-medium tracking-wider uppercase transition-colors ${
              pathname === "/showcase"
                ? "text-[#2563EB] underline underline-offset-4"
                : "text-[#141413] hover:text-[#2563EB]"
            }`}
          >
            Showcase
          </Link>
          <Link
            href="/editor"
            className="border border-[#141413] bg-[#141413] px-4 py-2 text-xs font-medium tracking-wider text-[#F5F3EE] uppercase transition-colors hover:bg-[#2563EB] hover:border-[#2563EB]"
          >
            Try It Free
          </Link>
        </nav>
      </div>
    </header>
  );
}
