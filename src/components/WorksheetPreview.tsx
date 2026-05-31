"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Settings } from "@/lib/types";
import { Printer, Loader2, Download, X, Eye } from "lucide-react";
import { TracingCharacterGrid } from "./TracingCharacterGrid";
import { CharacterInfo } from "./CharacterInfo";
import { useCharacterData } from "@/hooks/useCharacterData";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { calculatePageLayout } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function WorksheetPreview({ settings }: { settings: Settings }) {
  const { characterDataMap, isLoading: isDataLoading, loadingProgress, uniqueChars, allCharsLoaded } = useCharacterData(settings.name);
  const { isDownloading, progress: pdfProgress, startPDF, capturePage, finishPDF, previewPDF, cancelGeneration } = usePDFGenerator();

  const [renderingPageIndex, setRenderingPageIndex] = useState<number>(-1);
  const [showAllInPreview, setShowAllInPreview] = useState(false);
  const captureBufferRef = useRef<HTMLDivElement>(null);

  const pageLayout = useMemo(() => {
    if (uniqueChars.length === 0 || !allCharsLoaded) return { canFitInOnePage: false, pages: [] };
    return calculatePageLayout(uniqueChars, settings, characterDataMap);
  }, [uniqueChars, allCharsLoaded, settings, characterDataMap]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (pageLayout.pages.length === 0) return;

    const totalPages = pageLayout.pages.length;
    startPDF(totalPages);

    for (let i = 0; i < totalPages; i++) {
      // Update state to render the specific page in the buffer
      setRenderingPageIndex(i);

      // Wait for React to render the new page content and for fonts/SVGs to settle
      // We use a multi-stage wait to be safe
      await new Promise(resolve => setTimeout(resolve, 150));

      if (captureBufferRef.current) {
        const success = await capturePage(captureBufferRef.current, i, totalPages);
        if (!success) break;
      } else {
        console.error("Capture buffer ref not found");
        break;
      }
    }

    setRenderingPageIndex(-1);

    // Generate dynamic filename: [姓名]-笔顺字帖.pdf (sanitization handled in usePDFGenerator)
    const displayName = (settings.name || "").trim() || "练习";
    const filename = `${displayName}-笔顺字帖.pdf`;

    console.log(`[UI] Triggering PDF download with filename: ${filename}`);
    finishPDF(filename);
  };

  const renderPracticeSheet = (char: string) => {
    const data = characterDataMap.get(char);
    if (!data) return null;

    const { details, strokesData } = data;
    const strokes = strokesData?.strokes || [];
    const strokeCount = strokes.length;
    const gridsPerRow = settings.gridCount;
    const tracingRows = Math.max(1, settings.tracingRows); // 至少重复一次

    // 创建一个完整的笔顺练习序列（笔顺描红 + 灰色描摸字填充）
    const createStrokePracticeSequence = () => {
      const sequence = [];

      // 添加笔顺描红部分
      for (let i = 0; i < strokeCount; i++) {
        sequence.push(
          <TracingCharacterGrid
            key={`stroke-${i}`}
            strokes={strokes}
            gridType={settings.gridType}
            highlightStroke={i}
            showPinyin={settings.showPinyin}
            pinyin={details.pinyin[0]}
            gridColor={settings.gridColor}
            innerGridColor={settings.innerGridColor}
            characterColor={settings.characterColor}
            tracingColor={settings.tracingColor}
            strokeColor={settings.strokeColor}
            completedStrokeColor={settings.completedStrokeColor}
            gridCount={settings.gridCount}
          />
        );
      }

      return sequence;
    };

    const allRows = [];

    if (strokeCount <= gridsPerRow) {
      // 情况 1: 笔画数 ≤ 每行格子数
      // 创建一个单行的练习序列
      const singleRowSequence = createStrokePracticeSequence();

      // 用灰色描摸字填充剩余位置
      const fillerCount = gridsPerRow - strokeCount;
      for (let i = 0; i < fillerCount; i++) {
        singleRowSequence.push(
          <TracingCharacterGrid
            key={`filler-${i}`}
            strokes={strokes}
            gridType={settings.gridType}
            isTracing={true}
            showPinyin={settings.showPinyin}
            pinyin={details.pinyin[0]}
            gridColor={settings.gridColor}
            innerGridColor={settings.innerGridColor}
            characterColor={settings.characterColor}
            tracingColor={settings.tracingColor}
            strokeColor={settings.strokeColor}
            completedStrokeColor={settings.completedStrokeColor}
            gridCount={settings.gridCount}
          />
        );
      }

      // 重复这个单行序列 N 次
      for (let row = 0; row < tracingRows; row++) {
        allRows.push(
          <div
            key={`practice-row-${row}`}
            className="grid w-full gap-1"
            style={{ gridTemplateColumns: `repeat(${gridsPerRow}, 1fr)` }}
          >
            {singleRowSequence.map((grid, index) =>
              React.cloneElement(grid as React.ReactElement, {
                key: `row-${row}-grid-${index}`
              })
            )}
          </div>
        );
      }
    } else {
      // 情况 2: 笔画数 > 每行格子数
      // 创建一个需要跨行的完整笔顺练习序列
      const fullSequence = createStrokePracticeSequence();

      // 计算需要多少行来完成一个完整的笔顺序列
      const rowsPerBlock = Math.ceil(strokeCount / gridsPerRow);
      const lastRowGridCount = strokeCount % gridsPerRow;

      // 在最后一行的末尾填充灰色描摸字
      if (lastRowGridCount > 0) {
        const fillerCount = gridsPerRow - lastRowGridCount;
        for (let i = 0; i < fillerCount; i++) {
          fullSequence.push(
            <TracingCharacterGrid
              key={`block-filler-${i}`}
              strokes={strokes}
              gridType={settings.gridType}
              isTracing={true}
              showPinyin={settings.showPinyin}
              pinyin={details.pinyin[0]}
              gridColor={settings.gridColor}
              innerGridColor={settings.innerGridColor}
              characterColor={settings.characterColor}
              tracingColor={settings.tracingColor}
              strokeColor={settings.strokeColor}
              completedStrokeColor={settings.completedStrokeColor}
              gridCount={settings.gridCount}
            />
          );
        }
      }

      // 重复这个完整的跨行“块” N 次
      for (let block = 0; block < tracingRows; block++) {
        // 将当前块的序列分解为多行
        for (let row = 0; row < rowsPerBlock; row++) {
          const startIndex = row * gridsPerRow;
          const endIndex = Math.min(startIndex + gridsPerRow, fullSequence.length);
          const rowGrids = fullSequence.slice(startIndex, endIndex);

          allRows.push(
            <div
              key={`block-${block}-row-${row}`}
              className="grid w-full gap-1"
              style={{ gridTemplateColumns: `repeat(${gridsPerRow}, 1fr)` }}
            >
              {rowGrids.map((grid, index) =>
                React.cloneElement(grid as React.ReactElement, {
                  key: `block-${block}-row-${row}-grid-${index}`
                })
              )}
            </div>
          );
        }
      }
    }

    return <div className="space-y-1">{allRows}</div>;
  };

  // Calculate progress percentage
  const loadingPercent = loadingProgress.total > 0
    ? Math.round((loadingProgress.loaded / loadingProgress.total) * 100)
    : 0;
  const pdfPercent = pdfProgress.total > 0
    ? Math.round((pdfProgress.current / pdfProgress.total) * 100)
    : 0;

  return (
    <div className="w-full relative">
      {/* 顶部固定进度条 - 在下载时始终可见 */}
      {isDownloading && (
        <div className="fixed top-0 left-0 w-full z-[100] no-print h-1.5 bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            style={{ width: `${pdfPercent}%` }}
          />
        </div>
      )}

      {/* PDF 生成时的全屏遮罩层 */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center no-print">
          <div className="bg-card border rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {pdfProgress.status === 'complete' ? "导出完成" : "正在转化 PDF..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pdfProgress.status === 'complete' ? "准备下载或进行预览" : "请稍候，正在为您生成高精度字帖"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={cancelGeneration} title="关闭" className="hover:bg-destructive/10 hover:text-destructive transition-colors rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">转化进度</span>
                    <span className="text-xs text-muted-foreground">正在处理第 {pdfProgress.current} 页 / 共 {pdfProgress.total} 页</span>
                  </div>
                  <span className="text-2xl font-black text-primary tabular-nums">{pdfPercent}%</span>
                </div>
                <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden border shadow-inner">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${pdfPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" style={{ width: '200%' }} />
                  </div>
                </div>
              </div>

              {pdfProgress.status === 'complete' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <p className="text-green-600 font-bold mb-1">✅ 成功！</p>
                    <p className="text-xs text-green-600/80">文件已准备好并触发自动下载</p>
                  </div>
                  <Button
                    onClick={previewPDF}
                    variant="outline"
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-primary/20 hover:bg-primary/5 transition-all text-sm font-bold"
                  >
                    <Eye className="h-5 w-5" />
                    在新标签页预览 PDF
                  </Button>
                </div>
              )}
            </div>

            {pdfProgress.status !== 'complete' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex gap-3 shadow-sm">
                <span className="text-xl shrink-0">⚠️</span>
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  正在处理 {pdfProgress.total} 页大型文档。由于渲染计算量大，浏览器可能会暂时提示“无响应”，此时<strong>请点击“等待”</strong>。转化完成后将自动开始下载。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 no-print sticky top-0 lg:top-[160px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 py-4 border-b shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] translate-y-[-1px]">
        <h2 className="text-2xl font-bold font-headline flex items-center gap-3">
          预览
          {isDownloading && (
            <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full animate-pulse uppercase tracking-widest font-black">
              CONVERTING {pdfPercent}%
            </span>
          )}
        </h2>
        <div className="flex gap-3 items-center">
          {/* 数据加载进度指示器 */}
          {isDataLoading && loadingProgress.total > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/30 px-3 py-2 rounded-full border border-dashed animate-in fade-in">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>数据采集 {loadingProgress.loaded}/{loadingProgress.total}</span>
            </div>
          )}
          <Button onClick={handlePrint} variant="outline" size="lg" disabled={isDataLoading || isDownloading || uniqueChars.length === 0} className="rounded-full px-6 shadow-sm hover:shadow-md transition-all active:scale-95">
            {isDataLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
            {isDataLoading ? "加载中" : "打印预览"}
          </Button>
          <Button onClick={handleDownloadPdf} size="lg" disabled={isDataLoading || isDownloading || uniqueChars.length === 0} className="rounded-full px-8 shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-95 text-primary-foreground font-bold">
            {isDownloading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Download className="h-5 w-5 mr-2" />}
            {isDownloading ? `导出中 ${pdfPercent}%` : "直接下载 PDF"}
          </Button>
        </div>
      </div>

      {/* Progress bar for character loading */}
      {isDataLoading && loadingProgress.total > 20 && (
        <div className="mb-4 no-print">
          <Progress value={loadingPercent} className="h-2" />
        </div>
      )}

      <div id="capture-buffer" className="fixed left-[-9999px] top-[-9999px] no-print" style={{ width: '210mm' }}>
        {renderingPageIndex >= 0 && pageLayout.pages[renderingPageIndex] && (
          <div ref={captureBufferRef} className="bg-white" style={{ width: '210mm' }}>
            <div className="page-header flex items-center justify-between p-2 border-b bg-background">
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-foreground">笔顺字帖</h1>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {renderingPageIndex + 1}/{pageLayout.pages.length}
              </div>
            </div>
            <div className="page-content p-8">
              <div className={pageLayout.pages[renderingPageIndex].length > 1 ? "space-y-6" : "space-y-2"}>
                {pageLayout.pages[renderingPageIndex].map((char) => {
                  const data = characterDataMap.get(char);
                  if (!data) return null;
                  const { details, strokesData } = data;
                  const strokes = strokesData?.strokes || [];
                  return (
                    <div key={`capture-${char}`} className={pageLayout.pages[renderingPageIndex].length > 1 ? "character-section border-b border-gray-100 pb-4 last:border-b-0" : "character-section"}>
                      <div className="flex gap-4 items-center mb-2">
                        <TracingCharacterGrid
                          strokes={strokes}
                          gridType={settings.gridType}
                          isExample={true}
                          gridColor={settings.gridColor}
                          innerGridColor={settings.innerGridColor}
                          characterColor={settings.characterColor}
                          tracingColor={settings.tracingColor}
                          strokeColor={settings.strokeColor}
                          completedStrokeColor={settings.completedStrokeColor}
                        />
                        <div className="flex-1">
                          <CharacterInfo details={details} strokeCount={strokes.length} />
                        </div>
                      </div>
                      {renderPracticeSheet(char)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div id="printable-area" className="printable-area">
        {pageLayout.pages.length > 0 ? (
          <div className="character-pages">
            {(showAllInPreview ? pageLayout.pages : pageLayout.pages.slice(0, 5)).map((pageChars, pageIndex) => (
              <div key={`page-${pageIndex}`} className="character-page">
                {/* 页眉 */}
                <div className="page-header flex items-center justify-between p-2 border-b bg-background">
                  <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold text-foreground">笔顺字帖</h1>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {pageLayout.pages.length === 1 ?
                      `全部/共 ${uniqueChars.length} 字` :
                      `第 ${pageIndex + 1} 页/共 ${pageLayout.pages.length} 页`
                    }
                  </div>
                </div>

                {/* 主内容 */}
                <div className="page-content p-4 sm:p-6">
                  <div className={pageChars.length > 1 ? "space-y-6" : "space-y-2"}>
                    {pageChars.map((char) => {
                      const data = characterDataMap.get(char);
                      if (!data) return null;

                      const { details, strokesData } = data;
                      const strokes = strokesData?.strokes || [];
                      const strokeCount = strokes.length;

                      return (
                        <div key={`${pageIndex}-${char}`} className={pageChars.length > 1 ? "character-section border-b border-gray-100 pb-4 last:border-b-0" : "character-section"}>
                          <div className="flex gap-4 items-center mb-2">
                            <TracingCharacterGrid
                              strokes={strokes}
                              gridType={settings.gridType}
                              isExample={true}
                              gridColor={settings.gridColor}
                              innerGridColor={settings.innerGridColor}
                              characterColor={settings.characterColor}
                              tracingColor={settings.tracingColor}
                              strokeColor={settings.strokeColor}
                              completedStrokeColor={settings.completedStrokeColor}
                            />
                            <div className="flex-1">
                              <CharacterInfo details={details} strokeCount={strokeCount} />
                            </div>
                          </div>
                          {renderPracticeSheet(char)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {!showAllInPreview && pageLayout.pages.length > 5 && (
              <div className="p-8 text-center no-print">
                <p className="text-muted-foreground mb-4">
                  为了性能，预览仅显示前 5 页（总计 {pageLayout.pages.length} 页）。
                </p>
                <Button variant="outline" onClick={() => setShowAllInPreview(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  显示全部预览
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  注意：显示全部页面可能会导致大文档预览卡顿。点击“下载 PDF”可生成完整文档。
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="character-page">
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              {uniqueChars.length === 0 ?
                "请在左侧输入汉字以生成字帖" :
                "正在加载汉字数据..."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
