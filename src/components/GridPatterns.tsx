import type { SVGProps } from "react";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  gridColor?: string;
}

/**
 * 创建网格线条的共享属性。
 * 同时通过内联 style 属性保证 html2canvas 在离屏渲染（PDF 导出）时
 * 能正确捕获虚线和颜色，而不是回退为默认的黑色实线。
 */
const createSharedProps = (gridColor?: string) => {
  const color = gridColor || "#d1d5db";
  return {
    stroke: color,
    strokeWidth: 1,
    strokeDasharray: "2 2",
    vectorEffect: "non-scaling-stroke" as const,
    // 内联 style 确保 html2canvas 正确解析颜色和虚线
    style: {
      stroke: color,
      strokeWidth: 1,
      strokeDasharray: "2 2",
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

