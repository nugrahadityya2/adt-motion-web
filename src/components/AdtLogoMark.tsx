import React from "react";

interface AdtLogoMarkProps {
  className?: string;
}

export function AdtLogoMark({ className = "h-9 w-9" }: AdtLogoMarkProps) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/adt-logo.png"
      alt=""
      width={36}
      height={36}
      className={`rounded-full object-cover ${className}`}
    />
  );
}
