"use client";

import { cn } from "@/lib/utils";

interface PinyinGridProps {
  pinyin: string;
  show?: boolean;
  gridColor?: string;
  fontSize?: string; // e.g. "text-xs", "text-sm" or custom style
  heightClass?: string; // e.g. "h-8", "h-6"
  scale?: number; // Used for optional manual scaling if needed
}

export function PinyinGrid({
  pinyin,
  show = false,
  gridColor,
  fontSize = "text-sm",
  heightClass = "h-8",
  scale = 1
}: PinyinGridProps) {
  if (!show) {
    return <div className={heightClass} />;
  }

  const lineColor = gridColor || "hsl(var(--muted-foreground) / 0.4)";
  const middleLineColor = gridColor ? gridColor : "hsl(var(--muted-foreground) / 0.6)";

  return (
    <div className={cn("w-full relative", heightClass)}>
      <svg className="w-full h-full absolute inset-0 pointer-events-none" width="100%" height="100%">
        {/* Standard 4-line grid */}
        <line x1="0" y1="0" x2="100%" y2="0" stroke={lineColor} strokeWidth="1" />
        <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke={middleLineColor} strokeWidth="1" strokeDasharray="none" />
        <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke={middleLineColor} strokeWidth="1" strokeDasharray="none" />
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke={lineColor} strokeWidth="1" />

        {/* Text centered horizontally, baseline at 3rd line (66.66%) */}
        <text
          x="50%"
          y="67%" // Set baseline exactly at the 3rd line (with tiny optical adjustment)
          textAnchor="middle"
          dominantBaseline="alphabetic"
          className={cn("fill-muted-foreground", fontSize)}
          style={{
            fontFamily: "'Quicksand', sans-serif",
            fontWeight: 500,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: "center 67%"
          }}
        >
          {pinyin.toLowerCase()}
        </text>
      </svg>
    </div>
  );
}
