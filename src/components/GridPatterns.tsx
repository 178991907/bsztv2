import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  gridColor?: string;
}

/**
 * 转换 Hex 颜色为 rgba 格式，以便 html2canvas 完美支持透明度渲染
 */
const hexToRgba = (hex: string, alpha: number): string => {
  let c = hex.trim();
  if (c.startsWith("#")) {
    c = c.substring(1);
  }
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length === 6) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex; // 兜底
};

/**
 * 渲染水平中线虚线（使用一系列连续的小线段模拟，100% 兼容 html2canvas 导出 PDF）
 */
const renderHorizontalDashedLine = (y: number, color: string, strokeWidth: number) => {
  const segments = [];
  const dashLength = 4;
  const gapLength = 4;
  for (let x = 0; x < 100; x += dashLength + gapLength) {
    const x2 = Math.min(x + dashLength, 100);
    segments.push(
      <line
        key={`h-dash-${y}-${x}`}
        x1={x}
        y1={y}
        x2={x2}
        y2={y}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  return segments;
};

/**
 * 渲染垂直中线虚线（使用一系列连续的小线段模拟，100% 兼容 html2canvas 导出 PDF）
 */
const renderVerticalDashedLine = (x: number, color: string, strokeWidth: number) => {
  const segments = [];
  const dashLength = 4;
  const gapLength = 4;
  for (let y = 0; y < 100; y += dashLength + gapLength) {
    const y2 = Math.min(y + dashLength, 100);
    segments.push(
      <line
        key={`v-dash-${x}-${y}`}
        x1={x}
        y1={y}
        x2={x}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  return segments;
};

/**
 * 渲染主对角线虚线 (从 0,0 到 100,100)
 */
const renderMainDiagonalDashedLine = (color: string, strokeWidth: number) => {
  const segments = [];
  const dashLength = 4;
  const gapLength = 4;
  const step = (dashLength + gapLength) / Math.sqrt(2);
  const dashStep = dashLength / Math.sqrt(2);
  for (let x = 0; x < 100; x += step) {
    const x2 = Math.min(x + dashStep, 100);
    const y1 = x;
    const y2 = x2;
    segments.push(
      <line
        key={`d1-dash-${x}`}
        x1={x}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  return segments;
};

/**
 * 渲染副对角线虚线 (从 100,0 到 0,100)
 */
const renderAntiDiagonalDashedLine = (color: string, strokeWidth: number) => {
  const segments = [];
  const dashLength = 4;
  const gapLength = 4;
  const step = (dashLength + gapLength) / Math.sqrt(2);
  const dashStep = dashLength / Math.sqrt(2);
  for (let x = 0; x < 100; x += step) {
    const x2 = Math.min(x + dashStep, 100);
    const y1 = 100 - x;
    const y2 = 100 - x2;
    segments.push(
      <line
        key={`d2-dash-${x}`}
        x1={x}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  return segments;
};

/**
 * 渲染回宫格内矩形虚线
 */
const renderDashedRect = (x: number, y: number, width: number, height: number, color: string, strokeWidth: number) => {
  const segments = [];
  const dashLength = 4;
  const gapLength = 4;
  
  // 顶边：y
  for (let px = x; px < x + width; px += dashLength + gapLength) {
    const px2 = Math.min(px + dashLength, x + width);
    segments.push(<line key={`rect-t-${px}`} x1={px} y1={y} x2={px2} y2={y} stroke={color} strokeWidth={strokeWidth} />);
  }
  // 底边：y + height
  for (let px = x; px < x + width; px += dashLength + gapLength) {
    const px2 = Math.min(px + dashLength, x + width);
    segments.push(<line key={`rect-b-${px}`} x1={px} y1={y + height} x2={px2} y2={y + height} stroke={color} strokeWidth={strokeWidth} />);
  }
  // 左边：x
  for (let py = y; py < y + height; py += dashLength + gapLength) {
    const py2 = Math.min(py + dashLength, y + height);
    segments.push(<line key={`rect-l-${py}`} x1={x} y1={py} x2={x} y2={py2} stroke={color} strokeWidth={strokeWidth} />);
  }
  // 右边：x + width
  for (let py = y; py < y + height; py += dashLength + gapLength) {
    const py2 = Math.min(py + dashLength, y + height);
    segments.push(<line key={`rect-r-${py}`} x1={x + width} y1={py} x2={x + width} y2={py2} stroke={color} strokeWidth={strokeWidth} />);
  }
  return segments;
};

export const TianZiGe = ({ gridColor, className, ...props }: GridPatternProps) => {
  const color = gridColor || "#d1d5db";
  // 屏幕上使用 0.85 的不透明度，确保小尺寸下对角线和矩形虚线清晰可见，且完美支持用户自定义色彩展现
  const lineColor = hexToRgba(color, 0.85);
  const strokeWidth = 0.5;

  return (
    <svg viewBox="0 0 100 100" {...props} className={cn(className, "grid-line")}>
      {renderHorizontalDashedLine(50, lineColor, strokeWidth)}
      {renderVerticalDashedLine(50, lineColor, strokeWidth)}
    </svg>
  );
};

export const MiZiGe = ({ gridColor, className, ...props }: GridPatternProps) => {
  const color = gridColor || "#d1d5db";
  // 屏幕上使用 0.85 的不透明度，确保小尺寸下对角线和矩形虚线清晰可见，且完美支持用户自定义色彩展现
  const lineColor = hexToRgba(color, 0.85);
  const strokeWidth = 0.5;
  const diagStrokeWidth = 0.4; // 微调对角线粗度为 0.4，确保次像素抗锯齿下屏幕完美可见

  return (
    <svg viewBox="0 0 100 100" {...props} className={cn(className, "grid-line")}>
      {renderHorizontalDashedLine(50, lineColor, strokeWidth)}
      {renderVerticalDashedLine(50, lineColor, strokeWidth)}
      {renderMainDiagonalDashedLine(lineColor, diagStrokeWidth)}
      {renderAntiDiagonalDashedLine(lineColor, diagStrokeWidth)}
    </svg>
  );
};

export const HuiGongGe = ({ gridColor, className, ...props }: GridPatternProps) => {
  const color = gridColor || "#d1d5db";
  // 屏幕上使用 0.85 的不透明度，确保小尺寸下对角线和矩形虚线清晰可见，且完美支持用户自定义色彩展现
  const lineColor = hexToRgba(color, 0.85);
  const strokeWidth = 0.5;

  return (
    <svg viewBox="0 0 100 100" {...props} className={cn(className, "grid-line")}>
      {renderDashedRect(15, 15, 70, 70, lineColor, strokeWidth)}
      {renderHorizontalDashedLine(50, lineColor, strokeWidth)}
      {renderVerticalDashedLine(50, lineColor, strokeWidth)}
    </svg>
  );
};
