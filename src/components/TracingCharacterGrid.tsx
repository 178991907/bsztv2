"use client";

import React, { memo } from "react";

import type { GridType } from "@/lib/types";
import { TianZiGe, MiZiGe, HuiGongGe } from "./GridPatterns";
import { cn } from "@/lib/utils";
import { PinyinGrid } from "./PinyinGrid";

interface TracingCharacterGridProps {
  strokes: string[];
  gridType: GridType;
  highlightStroke?: number;
  isTracing?: boolean;
  isExample?: boolean;
  showPinyin?: boolean;
  pinyin?: string;
  gridColor?: string;
  innerGridColor?: string; // Explicit color for inner grid lines
  characterColor?: string;
  tracingColor?: string;  // 仅用于描红练习
  strokeColor?: string;  // 当前笔顺演示颜色
  completedStrokeColor?: string;  // 完成笔顺颜色
  gridCount?: number; // 每行格子数量，用于动态调整样式
}

const GridComponents = {
  "tian-zi-ge": TianZiGe,
  "mi-zi-ge": MiZiGe,
  "hui-gong-ge": HuiGongGe,
};

// 根据每行格子数量确定拼音样式（字体大小和高度）
// 根据每行格子数量确定拼音样式（字体大小和高度）
// 参考比例：字体大小约为行高的 0.6 倍，以确保 x-height 填满中间格
const getPinyinStyle = (gridCount?: number) => {
  if (!gridCount) return { heightClass: "h-8", fontSize: "text-lg", scale: 1 }; // 32px -> 18px

  // 随着每行格子数增加（格子变小），调整高度和字体
  if (gridCount >= 12) return { heightClass: "h-5", fontSize: "text-xs", scale: 0.9 }; // 20px -> ~11px
  if (gridCount >= 10) return { heightClass: "h-6", fontSize: "text-sm", scale: 1 }; // 24px -> 14px
  if (gridCount >= 8) return { heightClass: "h-7", fontSize: "text-base", scale: 1 }; // 28px -> 16px
  if (gridCount <= 5) return { heightClass: "h-10", fontSize: "text-2xl", scale: 1 }; // 40px -> 24px

  return { heightClass: "h-8", fontSize: "text-lg", scale: 1 };
};

function TracingCharacterGridComponent({
  strokes,
  gridType,
  highlightStroke = -1,
  isTracing = false,
  isExample = false,
  showPinyin = false,
  pinyin = "",
  gridColor,
  innerGridColor,
  characterColor = "#000000",
  tracingColor = "#fca5a5",  // 仅用于描红练习
  strokeColor = "#f97316",  // 当前笔顺演示默认颜色
  completedStrokeColor = "#10b981",  // 完成笔顺默认颜色
  gridCount,
}: TracingCharacterGridProps) {
  const GridPattern = GridComponents[gridType];
  const viewBoxSize = 1024;
  const yOffset = -900;

  const { heightClass, fontSize: pinyinFontSize, scale } = getPinyinStyle(gridCount);

  return (
    <div className={cn(
      "flex flex-col items-center",
      isExample ? 'w-24 h-24 flex-shrink-0' : 'w-full'
    )}>
      {!isExample && (
        <div className={cn("w-full relative mb-0.5 transition-all", heightClass)}>
          <PinyinGrid
            pinyin={pinyin}
            show={showPinyin}
            gridColor={gridColor}
            fontSize={pinyinFontSize}
            heightClass={heightClass}
            scale={scale}
          />
        </div>
      )}
      <div
        className={cn("relative w-full aspect-square border bg-background")}
        style={{ borderColor: innerGridColor || gridColor }}
      >
        <GridPattern className="absolute inset-0 w-full h-full" gridColor={innerGridColor || gridColor} />
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          <g transform={`scale(1, -1) translate(0, ${yOffset})`}>
            {isTracing ? (
              // Mode 1: Render the full character for tracing (仅使用描字颜色)
              <path
                d={strokes.join(' ')}
                fill={tracingColor}          // 使用描字颜色
                fillOpacity={0.25}           // 使用原生的 fillOpacity 透明度声明，解决 html2canvas 无法解析 8 位 hex 的兼容性大坑
                className="tracing-char"
              />
            ) : isExample ? (
              // Mode 3: Render the full character for example
              <path
                d={strokes.join(' ')}
                fill={characterColor}  // 使用汉字颜色
              />
            ) : (
              // Mode 2: Render stroke-by-stroke animation
              <>
                {/* 笔顺分解的垫底汉字（Base character）：
                    此处彻底弃用带透明度的描红颜色拼接，改用标准的纯实心轻柔淡灰色 #e2e8f0 渲染（完全不含透明度 fillOpacity）。
                    这能彻底且根本地避免当用户在系统直接打印弹窗中未勾选“背景图形”时，由于打印机强制抹去透明度而将底字误渲染成 100% 纯黑色块的顽疾，
                    同时在视觉上能产出学术级字帖最严谨的淡淡垫底双钩灰字，极其高雅精美！ */}
                {strokes.map((stroke, i) => (
                  <path
                    key={`base-${i}`}
                    d={stroke}
                    fill="#e2e8f0"           // 统一使用纯实心轻柔灰色，打印机高保真友好
                  />
                ))}
                {/* Completed strokes - 使用完成笔顺颜色 */}
                {strokes.slice(0, highlightStroke).map((stroke, i) => (
                  <path
                    key={`done-${i}`}
                    d={stroke}
                    fill={completedStrokeColor}  // 使用独立的完成笔顺颜色
                  />
                ))}
                {/* Current highlighted stroke - 使用当前笔顺颜色 */}
                {strokes[highlightStroke] && (
                  <path
                    d={strokes[highlightStroke]}
                    fill={strokeColor}  // 使用当前笔顺演示颜色
                  />
                )}
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

export const TracingCharacterGrid = memo(TracingCharacterGridComponent);