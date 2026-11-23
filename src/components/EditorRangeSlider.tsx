"use client";

import React, { useEffect, useId, useRef } from "react";

interface EditorRangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function EditorRangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: EditorRangeSliderProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    el.style.setProperty("--slider-progress", `${pct}%`);
  }, [value, min, max]);

  const formattedValue = `${value}${unit}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <label
          htmlFor={id}
          className="font-medium tracking-wider text-[#5C5A54] uppercase"
        >
          {label}
        </label>
        <span className="font-medium text-[#141413] tabular-nums">
          {formattedValue}
        </span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={formattedValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tm-slider"
      />
    </div>
  );
}
