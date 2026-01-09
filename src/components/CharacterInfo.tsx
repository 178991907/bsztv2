
import type { CharacterDetails } from "@/lib/types";
import { Badge } from "./ui/badge";

interface CharacterInfoProps {
  details: CharacterDetails;
  strokeCount: number;
}

export function CharacterInfo({ details, strokeCount }: CharacterInfoProps) {
  return (
    <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-base">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">拼音:</span>
        <span className="font-semibold">{details.pinyin.join(" ").toLowerCase()}</span>
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
