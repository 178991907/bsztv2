"use client";

import type { Settings } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>颜色设置</Label>
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
              className="text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
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
