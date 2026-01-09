import { z } from "zod";

export type GridType = "tian-zi-ge" | "mi-zi-ge" | "hui-gong-ge";

export interface Settings {
  name: string;
  gridCount: number;
  tracingRows: number;
  gridType: GridType;
  showPinyin: boolean;
  gridColor: string;  // 表格线条颜色
  innerGridColor?: string; // 格子类型颜色（内格）
  characterColor: string;  // 汉字颜色
  tracingColor: string;  // 描字颜色（仅用于描红练习）
  strokeColor: string;  // 当前笔顺演示颜色
  completedStrokeColor: string;  // 完成笔顺颜色
}

export const CharacterDetailsSchema = z.object({
  character: z.string().describe('The character itself.'),
  pinyin: z.array(z.string()).describe('The pinyin pronunciation(s).'),
  radical: z.string().describe('The radical of the character.'),
  structure: z.string().describe('The character structure (e.g., 上下, 左右).'),
});
export type CharacterDetails = z.infer<typeof CharacterDetailsSchema>;

export interface StrokeSistine {
  strokes: string[];
  medians: number[][][];
}

export interface CharacterData {
  details: CharacterDetails;
  strokesData: StrokeSistine;
}
