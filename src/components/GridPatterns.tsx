import type { SVGProps } from "react";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  gridColor?: string;
}

/**
 * 创建网格线条的共享属性。
 *
 * 关键设计决策：
 * - 不使用 strokeDasharray（html2canvas 完全无法渲染虚线，会退化为实线）
 * - 不使用 vectorEffect（html2canvas 不支持，会导致线条在缩放时变粗）
 * - 改用 strokeWidth=0.5（相对于 100x100 viewBox，非常细）+ opacity=0.5（半透明）
 * - 这样无论在屏幕预览还是 PDF 导出中，格线都呈现为干净淡雅的细导线
 */
const createSharedProps = (gridColor?: string) => {
  const color = gridColor || "#d1d5db";
  return {
    stroke: color,
    strokeWidth: 0.5,
    opacity: 0.5,
    style: {
      stroke: color,
      strokeWidth: 0.5,
      opacity: 0.5,
    },
  };
};

export const TianZiGe = ({ gridColor, ...props }: GridPatternProps) => {
  const sharedProps = createSharedProps(gridColor);
  return (
    <svg viewBox="0 0 100 100" {...props} className="grid-line">
      <line x1="0" y1="50" x2="100" y2="50" {...sharedProps} />
      <line x1="50" y1="0" x2="50" y2="100" {...sharedProps} />
    </svg>
  );
};

export const MiZiGe = ({ gridColor, ...props }: GridPatternProps) => {
  const sharedProps = createSharedProps(gridColor);
  return (
    <svg viewBox="0 0 100 100" {...props} className="grid-line">
      <line x1="0" y1="50" x2="100" y2="50" {...sharedProps} />
      <line x1="50" y1="0" x2="50" y2="100" {...sharedProps} />
      <line x1="0" y1="0" x2="100" y2="100" {...sharedProps} />
      <line x1="100" y1="0" x2="0" y2="100" {...sharedProps} />
    </svg>
  );
};

export const HuiGongGe = ({ gridColor, ...props }: GridPatternProps) => {
  const sharedProps = createSharedProps(gridColor);
  return (
    <svg viewBox="0 0 100 100" {...props} className="grid-line">
      <rect x="15" y="15" width="70" height="70" {...sharedProps} fill="none" />
      <line x1="0" y1="50" x2="100" y2="50" {...sharedProps} />
      <line x1="50" y1="0" x2="50" y2="100" {...sharedProps} />
    </svg>
  );
};
