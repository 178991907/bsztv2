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
      {/* 田字格：横线(M0,50 L100,50) + 竖线(M50,0 L50,100) 的单一路径整合 */}
      <path d="M0,50 L100,50 M50,0 L50,100" {...sharedProps} fill="none" />
    </svg>
  );
};

export const MiZiGe = ({ gridColor, ...props }: GridPatternProps) => {
  const sharedProps = createSharedProps(gridColor);
  return (
    <svg viewBox="0 0 100 100" {...props} className="grid-line">
      {/* 米字格：横线 + 竖线 + 对角线(M0,0 L100,100) + 反对角线(M100,0 L0,100) 的单一路径高度整合，
          彻底解决 html2canvas 对斜线 line 元素的色彩和虚线解析退化 Bug */}
      <path d="M0,50 L100,50 M50,0 L50,100 M0,0 L100,100 M100,0 L0,100" {...sharedProps} fill="none" />
    </svg>
  );
};

export const HuiGongGe = ({ gridColor, ...props }: GridPatternProps) => {
  const sharedProps = createSharedProps(gridColor);
  return (
    <svg viewBox="0 0 100 100" {...props} className="grid-line">
      {/* 回宫格：外圈矩形加上内部的田字格交叉路径 */}
      <rect x="15" y="15" width="70" height="70" {...sharedProps} fill="none" />
      <path d="M0,50 L100,50 M50,0 L50,100" {...sharedProps} fill="none" />
    </svg>
  );
};
