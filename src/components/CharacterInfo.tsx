import type { CharacterDetails } from "@/lib/types";

interface CharacterInfoProps {
  details: CharacterDetails;
  strokeCount: number;
  selectedPinyin?: string; // 当前选中的拼音
  onPinyinSelect?: (pinyin: string) => void; // 切换拼音的回调
}

export function CharacterInfo({ details, strokeCount, selectedPinyin, onPinyinSelect }: CharacterInfoProps) {
  // 如果没有传入选中的拼音，默认采用第一个
  const activePinyin = (selectedPinyin || details.pinyin[0] || "N/A").toLowerCase();

  // 提取全部拼音并去重、转小写
  const allPinyins = Array.from(
    new Set((details.pinyin || ["N/A"]).map((p) => p.toLowerCase()))
  );
  const isPolyphonic = allPinyins.length > 1; // 是否为多音字

  return (
    <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-base">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">拼音:</span>
        <div className="flex flex-wrap items-center gap-2.5">
          {allPinyins.map((py) => {
            const isActive = py === activePinyin;

            if (isActive) {
              return (
                <span
                  key={py}
                  className="font-bold text-foreground select-none"
                  style={{ fontSize: "1.05rem" }} // 轻微放大以突出
                >
                  {py}
                </span>
              );
            }

            // 未选中的候选拼音只在屏幕交互时显示，打印时自动隐藏
            return (
              <span
                key={py}
                onClick={() => {
                  if (onPinyinSelect) {
                    onPinyinSelect(py);
                  }
                }}
                className="cursor-pointer select-none text-muted-foreground hover:text-primary underline decoration-dashed underline-offset-4 decoration-muted-foreground/50 hover:decoration-primary transition-all text-sm no-print"
              >
                {py}
              </span>
            );
          })}

          {/* 多音字提示 Badge 只在屏幕显示，打印时隐藏 */}
          {isPolyphonic && (
            <span className="text-[10px] text-primary/80 font-bold ml-1 animate-pulse bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 no-print select-none">
              💡 多音字，点击切换
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">部首:</span>
        <span className="font-semibold">{details.radical}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">结构:</span>
        <span className="font-semibold">{details.structure}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">笔画:</span>
        <span className="font-semibold">{strokeCount}</span>
      </div>
    </div>
  );
}

