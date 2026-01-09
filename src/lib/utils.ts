import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Settings, CharacterData } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type PageLayoutResult = {
  canFitInOnePage: boolean;
  pages: string[][];
};

/**
 * Calculates how the characters should be distributed across pages.
 */
export const calculatePageLayout = (
  uniqueChars: string[],
  settings: Settings,
  characterDataMap: Map<string, CharacterData>
): PageLayoutResult => {
  if (uniqueChars.length === 0) return { canFitInOnePage: false, pages: [] };

  const tracingRows = Math.max(1, settings.tracingRows);
  const charCount = uniqueChars.length;

  // Based on testing rules
  let canFitInOnePage = false;

  if (charCount === 3) {
    canFitInOnePage = tracingRows <= 2;
  } else if (charCount === 2) {
    canFitInOnePage = tracingRows <= 4;
  } else if (charCount === 1) {
    canFitInOnePage = tracingRows <= 8;
  } else if (charCount >= 4) {
    canFitInOnePage = false;
  }

  // Extra check for complex characters
  if (canFitInOnePage) {
    let hasComplexCharacter = false;
    uniqueChars.forEach((char) => {
      const data = characterDataMap.get(char);
      if (data) {
        const { strokesData } = data;
        const strokes = strokesData?.strokes || [];
        const strokeCount = strokes.length;
        const gridsPerRow = settings.gridCount;

        if (strokeCount > gridsPerRow) {
          hasComplexCharacter = true;
        }
      }
    });

    if (hasComplexCharacter) {
      if (charCount === 3 && tracingRows > 1) {
        canFitInOnePage = false;
      } else if (charCount === 2 && tracingRows > 3) {
        canFitInOnePage = false;
      } else if (charCount === 1 && tracingRows > 6) {
        canFitInOnePage = false;
      }
    }
  }

  if (canFitInOnePage) {
    return {
      canFitInOnePage: true,
      pages: [uniqueChars]
    };
  } else {
    return {
      canFitInOnePage: false,
      pages: uniqueChars.map(char => [char])
    };
  }
};
