
import type { CharacterDetails, GridType } from "@/lib/types";
import { TianZiGe, MiZiGe, HuiGongGe } from "./GridPatterns";
import { cn } from "@/lib/utils";

interface CharacterGridProps {
  char: string;
  details: CharacterDetails | null;
  gridType: GridType;
  showPinyin: boolean;
  isTracing: boolean;
  isExample?: boolean;
}

const GridComponents = {
  "tian-zi-ge": TianZiGe,
  "mi-zi-ge": MiZiGe,
  "hui-gong-ge": HuiGongGe,
};

// This component is no longer used for rendering characters.
// It's kept for potential future use or can be safely removed.
export function CharacterGrid({ char, details, gridType, showPinyin, isTracing, isExample = false }: CharacterGridProps) {
  return null;
}
