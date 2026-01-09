import type { SVGProps } from "react";

interface GridPatternProps extends SVGProps<SVGSVGElement> {
  gridColor?: string;
}

const createSharedProps = (gridColor?: string) => ({
  stroke: gridColor || "currentColor",
  strokeWidth: 1,
  strokeDasharray: "2 2",
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
