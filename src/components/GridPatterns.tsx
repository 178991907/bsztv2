import type { SVGProps } from "react";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  gridColor?: string;
}

const createSharedProps = (gridColor?: string) => ({
  // 彻底抛弃使用 "currentColor"，避免在 PDF 离屏导出渲染时因为默认文本色而误解析为黑色。
  // 若未指定颜色，兜底使用轻盈的灰色 #e2e8f0，使色调优雅、柔和。
  stroke: gridColor || "#e2e8f0",
  // 稍微提升线宽（由 1 增至 1.5），虚线尺寸拓宽为 "4 4"。
  // 在 100x100 的视口中，这能在 html2canvas 高清缩放采样下保持完美的高保真虚线质感，不粘连不失真。
  strokeWidth: 1.5,
  strokeDasharray: "4 4",
  vectorEffect: "non-scaling-stroke" as const,
});

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
