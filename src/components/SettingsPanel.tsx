"use client";

import type { Settings } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const colorThemes = [
  {
    name: "寒梅映雪",
    gridColor: "#d1d5db",      // 浅灰色 - 表格线条
    innerGridColor: "#d1d5db", // 浅灰色 - 格子类型
    characterColor: "#000000", // 纯黑色 - 主汉字
    tracingColor: "#d1d5db",   // 浅灰色 - 描字底色
    strokeColor: "#ffa39e",   // 淡粉红 - 当前高亮笔顺 (图2极其省墨好看的配色)
    completedStrokeColor: "#000000" // 纯黑色 - 完成笔顺
  },
  {
    name: "经典朱红",
    gridColor: "#ef4444",      // 红色 - 表格线条
    innerGridColor: "#fca5a5", // 浅红 - 格子类型
    characterColor: "#000000", // 黑色 - 主汉字
    tracingColor: "#fca5a5",   // 浅红色 - 描字
    strokeColor: "#ef4444",   // 红色 - 当前笔顺
    completedStrokeColor: "#000000" // 黑色 - 完成笔顺
  },
  {
    name: "护眼竹绿",
    gridColor: "#15803d",      // 绿色 - 表格线条
    innerGridColor: "#86efac", // 浅绿 - 格子类型
    characterColor: "#0f172a", // 深黛 - 汉字颜色
    tracingColor: "#22c55e",   // 描字绿
    strokeColor: "#16a34a",   // 高亮绿
    completedStrokeColor: "#0f172a"
  },
  {
    name: "清新夏蓝",
    gridColor: "#0284c7",      // 蓝色
    innerGridColor: "#7dd3fc", // 浅蓝
    characterColor: "#0f172a",
    tracingColor: "#38bdf8",
    strokeColor: "#f43f5e",   // 浅红
    completedStrokeColor: "#1e293b"
  },
  {
    name: "浪漫绯樱",
    gridColor: "#db2777",      // 绯红
    innerGridColor: "#fbcfe8", // 浅粉
    characterColor: "#27272a",
    tracingColor: "#f472b6",
    strokeColor: "#be185d",
    completedStrokeColor: "#18181b"
  },
  {
    name: "秋日暖枫",
    gridColor: "#c2410c",      // 橙红
    innerGridColor: "#fed7aa", // 浅橙
    characterColor: "#27272a",
    tracingColor: "#fb923c",
    strokeColor: "#ea580c",
    completedStrokeColor: "#09090b"
  },
  {
    name: "极简星空",
    gridColor: "#4b5563",      // 中灰
    innerGridColor: "#d1d5db", // 浅灰
    characterColor: "#030712",
    tracingColor: "#9ca3af",
    strokeColor: "#3b82f6",
    completedStrokeColor: "#111827"
  },
  {
    name: "水墨徽州",
    gridColor: "#4b5563",      // 灰黑
    innerGridColor: "#e5e7eb", // 浅灰
    characterColor: "#111827", // 徽黑
    tracingColor: "#d1d5db",
    strokeColor: "#1e3a8a",   // 黛蓝
    completedStrokeColor: "#111827"
  },
  {
    name: "薄荷微风",
    gridColor: "#0f766e",      // 深薄荷绿
    innerGridColor: "#99f6e4", // 浅薄荷绿
    characterColor: "#111827",
    tracingColor: "#ccfbf1",
    strokeColor: "#0d9488",   // 薄荷蓝绿
    completedStrokeColor: "#111827"
  },
  {
    name: "暖阳琥珀",
    gridColor: "#b45309",      // 琥珀棕
    innerGridColor: "#fde68a", // 暖黄
    characterColor: "#1f2937",
    tracingColor: "#fef3c7",
    strokeColor: "#d97706",   // 琥珀橙
    completedStrokeColor: "#1f2937"
  }
];

interface SettingsPanelProps {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  return (
    <Card className="w-full no-print">
      <CardHeader>
        <CardTitle>字帖设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">汉字输入</Label>
          <Input
            id="name"
            placeholder="输入汉字"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value.trim() })}
          />
        </div>

        <div className="space-y-2">
          <Label>每行格子数 ({settings.gridCount})</Label>
          <Slider
            min={4}
            max={16}
            step={1}
            value={[settings.gridCount]}
            onValueChange={([value]) => setSettings({ ...settings, gridCount: value })}
          />
        </div>

        <div className="space-y-2">
          <Label>描字行数 ({settings.tracingRows})</Label>
          <Slider
            min={0}
            max={12}
            step={1}
            value={[settings.tracingRows]}
            onValueChange={([value]) => setSettings({ ...settings, tracingRows: value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold">格子类型</Label>
          <div className="flex items-center space-x-6 py-1 select-none">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="gridType"
                value="tian-zi-ge"
                checked={settings.gridType === "tian-zi-ge"}
                onChange={() => setSettings({ ...settings, gridType: "tian-zi-ge" })}
                className="w-4 h-4 text-primary border-primary focus:ring-primary cursor-pointer accent-primary transition-all scale-105"
              />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                田字格
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="gridType"
                value="mi-zi-ge"
                checked={settings.gridType === "mi-zi-ge"}
                onChange={() => setSettings({ ...settings, gridType: "mi-zi-ge" })}
                className="w-4 h-4 text-primary border-primary focus:ring-primary cursor-pointer accent-primary transition-all scale-105"
              />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                米字格
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="gridType"
                value="hui-gong-ge"
                checked={settings.gridType === "hui-gong-ge"}
                onChange={() => setSettings({ ...settings, gridType: "hui-gong-ge" })}
                className="w-4 h-4 text-primary border-primary focus:ring-primary cursor-pointer accent-primary transition-all scale-105"
              />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                回宫格
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-pinyin">显示拼音</Label>
          <Switch
            id="show-pinyin"
            checked={settings.showPinyin}
            onCheckedChange={(checked) => setSettings({ ...settings, showPinyin: checked })}
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed">
          <Label className="text-sm font-bold">预设美学主题</Label>
          <div className="grid grid-cols-2 gap-2">
            {colorThemes.map((theme) => {
              const isSelected =
                settings.gridColor === theme.gridColor &&
                (settings.innerGridColor || settings.gridColor) === theme.innerGridColor &&
                settings.characterColor === theme.characterColor &&
                settings.tracingColor === theme.tracingColor &&
                settings.strokeColor === theme.strokeColor &&
                settings.completedStrokeColor === theme.completedStrokeColor;

              return (
                <button
                  key={theme.name}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      gridColor: theme.gridColor,
                      innerGridColor: theme.innerGridColor,
                      characterColor: theme.characterColor,
                      tracingColor: theme.tracingColor,
                      strokeColor: theme.strokeColor,
                      completedStrokeColor: theme.completedStrokeColor,
                    })
                  }
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition-all hover:bg-muted active:scale-95 ${
                    isSelected
                      ? "border-primary bg-primary/5 font-bold shadow-sm text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  <span>{theme.name}</span>
                  <div className="flex -space-x-1.5 ml-2 shrink-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-gray-800"
                      style={{ backgroundColor: theme.gridColor }}
                      title="表格线条"
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-gray-800"
                      style={{ backgroundColor: theme.strokeColor }}
                      title="当前笔顺"
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white dark:border-gray-800"
                      style={{ backgroundColor: theme.characterColor }}
                      title="汉字颜色"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-dashed">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-bold">自定义颜色</Label>
            <button
              onClick={() => setSettings({
                ...settings,
                gridColor: "#d1d5db",  // 灰色 - 表格线条
                innerGridColor: "#d1d5db", // 灰色 - 格子类型
                characterColor: "#000000",  // 黑色 - 汉字
                tracingColor: "#d1d5db",  // 浅灰色 - 描字
                strokeColor: "#fca5a5",  // 浅红色 - 当前笔顺
                completedStrokeColor: "#000000"  // 黑色 - 完成笔顺
              })}
              className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors active:scale-95"
            >
              重置颜色
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid-color" className="text-sm">表格线条颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.gridColor }}
                  title={`表格线条颜色: ${settings.gridColor}`}
                />
                <Input
                  id="grid-color"
                  type="color"
                  value={settings.gridColor}
                  onChange={(e) => setSettings({ ...settings, gridColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="inner-grid-color" className="text-sm">格子类型颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.innerGridColor || settings.gridColor }}
                  title={`格子类型颜色: ${settings.innerGridColor || settings.gridColor}`}
                />
                <Input
                  id="inner-grid-color"
                  type="color"
                  value={settings.innerGridColor || settings.gridColor}
                  onChange={(e) => setSettings({ ...settings, innerGridColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="character-color" className="text-sm">汉字颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.characterColor }}
                  title={`汉字颜色: ${settings.characterColor}`}
                />
                <Input
                  id="character-color"
                  type="color"
                  value={settings.characterColor}
                  onChange={(e) => setSettings({ ...settings, characterColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tracing-color" className="text-sm">描字颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.tracingColor }}
                  title={`描字颜色: ${settings.tracingColor}`}
                />
                <Input
                  id="tracing-color"
                  type="color"
                  value={settings.tracingColor}
                  onChange={(e) => setSettings({ ...settings, tracingColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="stroke-color" className="text-sm">当前笔顺颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.strokeColor }}
                  title={`当前笔顺颜色: ${settings.strokeColor}`}
                />
                <Input
                  id="stroke-color"
                  type="color"
                  value={settings.strokeColor}
                  onChange={(e) => setSettings({ ...settings, strokeColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="completed-stroke-color" className="text-sm">完成笔顺颜色</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="color-preview"
                  style={{ backgroundColor: settings.completedStrokeColor }}
                  title={`完成笔顺颜色: ${settings.completedStrokeColor}`}
                />
                <Input
                  id="completed-stroke-color"
                  type="color"
                  value={settings.completedStrokeColor}
                  onChange={(e) => setSettings({ ...settings, completedStrokeColor: e.target.value })}
                  className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
