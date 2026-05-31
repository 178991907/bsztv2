"use client";

import { useState, useEffect } from "react";
import { SettingsPanel } from "@/components/SettingsPanel";
import { WorksheetPreview } from "@/components/WorksheetPreview";
import type { Settings } from "@/lib/types";
import { Card } from "@/components/ui/card";

// 默认设置配置
const defaultSettings: Settings = {
  name: "王小明",
  gridCount: 8,
  tracingRows: 2,
  gridType: "tian-zi-ge",
  showPinyin: false,
  gridColor: "#d1d5db",  // 默认灰色
  innerGridColor: "#d1d5db", // 默认灰色
  characterColor: "#000000",  // 默认黑色
  tracingColor: "#d1d5db",  // 调整为浅灰色（描字）
  strokeColor: "#fca5a5",  // 调整为浅红色（当前笔顺）
  completedStrokeColor: "#000000",  // 调整为黑色（完成笔顺）
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('worksheet-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    }
  }, []);

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('worksheet-settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="min-h-screen bg-secondary/50 dark:bg-background text-foreground font-body flex flex-col">
      {/* 固定页眉 */}
      <header className="py-6 px-6 border-b bg-background shadow-sm sticky top-0 z-10 no-print">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* 左侧 LOGO */}
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo.png"
              alt="字帖生成器 Logo"
              className="h-24 w-72 rounded-lg object-contain shadow-sm border border-border"
              onError={(e) => {
                // 图片加载失败时的备用方案（书本图标）
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9Ijk2IiB2aWV3Qm94PSIwIDAgMjg4IDk2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjg4IiBoZWlnaHQ9Ijk2IiByeD0iMTYiIGZpbGw9IiMzNDgzZmEiLz4KPHBhdGggZD0iTTI0IDI0aDI0MHY0OEgyNFYyNHoiIGZpbGw9IndoaXRlIi8+CjxwPjx0ZXh0IHg9IjE0NCIgeT0iNTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMzNDgzZmEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWtl+W4lzwvdGV4dD48L3A+Cjwvc3ZnPgo=';
              }}
            />
          </div>

          {/* 中间标题 */}
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold font-headline">笔顺字帖</h1>
            <p className="text-muted-foreground text-sm">Chinese Stroke Order Copybook Generator</p>
          </div>

          {/* 右侧留空，保持平衡 */}
          <div className="w-72"></div>
        </div>
      </header>
      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8 selection:bg-primary/10">
        <div className="w-full lg:w-[380px] lg:flex-shrink-0 lg:sticky lg:top-[160px] lg:h-[calc(100vh-180px)] lg:overflow-y-auto no-print scrollbar-hide">
          <SettingsPanel settings={settings} setSettings={setSettings} />
        </div>
        <div className="flex-1 flex justify-center items-start">
          <WorksheetPreview settings={settings} />
        </div>
      </main>

      {/* 固定页脚 */}
      <footer className="bg-background border-t py-4 px-6 no-print">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            英语全科启蒙网站导航:
            <a
              href="https://web.terry.dpdns.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline ml-1"
            >
              https://web.terry.dpdns.org/
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
