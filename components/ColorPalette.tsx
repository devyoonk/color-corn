"use client";

import { useState } from "react";

interface Color {
  rgb: [number, number, number];
  hex: string;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function ColorPalette({ colors }: { colors: Color[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyHex = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
        추출된 색상 ({colors.length}개)
      </h2>

      {/* Wide swatches */}
      <div className="flex h-16 rounded-xl overflow-hidden shadow-sm">
        {colors.map((color) => (
          <div
            key={color.hex}
            className="flex-1 transition-transform hover:scale-y-110 origin-bottom"
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>

      {/* Color cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {colors.map((color) => {
          const isDark = luminance(...color.rgb) < 128;
          const textClass = isDark ? "text-white/90" : "text-black/70";

          return (
            <button
              key={color.hex}
              onClick={() => copyHex(color.hex)}
              className="group relative flex flex-col items-start gap-1 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ backgroundColor: color.hex }}
            >
              <span className={`text-lg font-bold font-mono ${textClass}`}>
                {color.hex}
              </span>
              <span className={`text-xs ${textClass} opacity-80`}>
                rgb({color.rgb.join(", ")})
              </span>

              <span
                className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full transition-opacity
                  ${isDark ? "bg-white/20 text-white" : "bg-black/10 text-black/60"}
                  ${copied === color.hex ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              >
                {copied === color.hex ? "복사됨!" : "복사"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
