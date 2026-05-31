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
 * 估算单个汉字练习块在 A4 页面上所占用的实际物理高度（单位：毫米 mm）。
 */
const estimateCharacterHeight = (
  char: string,
  settings: Settings,
  characterDataMap: Map<string, CharacterData>
): number => {
  // 1. 汉字头部高度：包含示例字、部首、结构、笔画以及间距边框等全部高保真物理占位
  const HEADER_HEIGHT = 32;

  // 2. 获取当前汉字的笔画数，若数据尚未载入完成，则默认兜底为 10 画
  let strokeCount = 10;
  const data = characterDataMap.get(char);
  if (data && data.strokesData && data.strokesData.strokes) {
    strokeCount = data.strokesData.strokes.length;
  }

  // 3. 计算描红练习格子的单行物理高度
  // 可用总宽度约为 190mm（A4 宽度 210mm 减去左右边距）
  const AVAIL_WIDTH = 190;
  const gridCount = settings.gridCount;
  const gridHeight = AVAIL_WIDTH / gridCount;

  // 拼音格子高度估算：根据每行格子数动态变化，与 getPinyinStyle 保持同步比例
  let pinyinHeight = 0;
  if (settings.showPinyin) {
    if (gridCount >= 12) {
      pinyinHeight = 5.3;
    } else if (gridCount >= 10) {
      pinyinHeight = 6.3;
    } else if (gridCount >= 8) {
      pinyinHeight = 7.4;
    } else if (gridCount <= 5) {
      pinyinHeight = 10.6;
    } else {
      pinyinHeight = 8.5;
    }
  }

  // 单个练习行的物理高度（包含格子高度、拼音高度、微调内边距和格线空间，以及 Tailwind 的 gap-1/space-y-1 物理间距开销）
  const rowHeight = gridHeight + pinyinHeight + 2.0;

  // 4. 计算该字总共需要的练习行数
  // 如果笔画数 <= 每行格子数，单次演示占 1 行，总行数等于“描字行数”
  // 如果笔画数 > 每行格子数，单次演示需要折行，占 ceil(strokeCount / gridCount) 行
  const gridsPerRow = settings.gridCount;
  const rowsPerBlock = strokeCount <= gridsPerRow ? 1 : Math.ceil(strokeCount / gridsPerRow);
  const tracingRows = Math.max(1, settings.tracingRows);
  const rowsCount = rowsPerBlock * tracingRows;

  // 返回当前汉字练习块的总高度
  return HEADER_HEIGHT + (rowsCount * rowHeight);
};

/**
 * 根据输入的汉字字数和排版设置，实时计算出在 A4 页面上合理的自动分页排版。
 */
export const calculatePageLayout = (
  uniqueChars: string[],
  settings: Settings,
  characterDataMap: Map<string, CharacterData>
): PageLayoutResult => {
  if (uniqueChars.length === 0) return { canFitInOnePage: false, pages: [] };

  // 限制 A4 纸张页面最大可用高度为 250mm，在页面底端留出极其稳健安全的防火墙，杜绝任何内容被迫溢出
  const MAX_PAGE_HEIGHT = 250;
  // 相邻汉字块之间的 CSS 垂直间隙物理高度（如 space-y-6 约为 6mm）
  const SPACE_GAP = 6;

  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentPageHeight = 0;

  for (const char of uniqueChars) {
    const charHeight = estimateCharacterHeight(char, settings, characterDataMap);

    if (currentPage.length === 0) {
      // 当前页的第一个汉字，直接放入
      currentPage.push(char);
      currentPageHeight = charHeight;
    } else if (currentPageHeight + SPACE_GAP + charHeight <= MAX_PAGE_HEIGHT) {
      // 若当前页能容纳下该汉字，则合并在当前页
      currentPage.push(char);
      currentPageHeight += SPACE_GAP + charHeight;
    } else {
      // 容纳不下时，保存当前页并另起新的一页
      pages.push(currentPage);
      currentPage = [char];
      currentPageHeight = charHeight;
    }
  }

  // 将最后一页放入结果
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  // 只要最终排版结果只有 1 页，则 canFitInOnePage 为 true
  const canFitInOnePage = pages.length === 1;

  return {
    canFitInOnePage,
    pages
  };
};
