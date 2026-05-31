
import { useState, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFProgress {
    current: number;
    total: number;
    status: 'idle' | 'preparing' | 'rendering' | 'complete' | 'error' | 'cancelled';
}

export function usePDFGenerator() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState<PDFProgress>({ current: 0, total: 0, status: 'idle' });
    const abortRef = useRef(false);
    const pdfRef = useRef<jsPDF | null>(null);

    /**
     * Starts the PDF generation process.
     * Initializes the jsPDF instance and sets the total number of pages.
     */
    const startPDF = useCallback((totalPages: number) => {
        abortRef.current = false;
        setIsDownloading(true);
        setProgress({ current: 0, total: totalPages, status: 'rendering' });

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        pdfRef.current = pdf;
    }, []);

    /**
     * Captures a single page and adds it to the PDF.
     * This should be called after the UI has rendered the specific page in the capture buffer.
     */
    const capturePage = useCallback(async (element: HTMLElement, index: number, total: number) => {
        if (!pdfRef.current || abortRef.current) return false;

        try {
            // 画质设置：根据总页数动态调整截图分辨率，平衡清晰度与渲染性能（防止大文档极度卡顿）
            let scale = 2; // 默认超清
            if (total >= 50) {
                scale = 1.0; // 超大文档使用基础分辨率
            } else if (total >= 30) {
                scale = 1.2;
            } else if (total >= 15) {
                scale = 1.5;
            }
            const jpegQuality = total > 30 ? 0.8 : 0.92;

            // 准备捕获元素样式：强制指定 A4 物理宽高 (210mm x 297mm)，避免因负位置定位导致 html2canvas 截取到多余空白页
            const originalStyle = element.style.cssText;
            element.style.width = '210mm';
            element.style.height = '297mm';
            element.style.backgroundColor = '#ffffff';
            element.style.boxSizing = 'border-box';
            element.style.position = 'relative';
            element.style.overflow = 'hidden';

            // 捕获元素的内容
            const canvas = await html2canvas(element, {
                scale: scale,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                imageTimeout: 0,
                removeContainer: true,
            });

            // 恢复原始样式
            element.style.cssText = originalStyle;

            // 检查生成是否已被中止
            if (!pdfRef.current || abortRef.current) return false;

            // ========================================================
            // 核心：创建精确 A4 比例（210:297）的画布
            // 这确保每张图像与 PDF 页面比例完全匹配，杜绝空白页
            // ========================================================
            const A4_RATIO = 297 / 210; // ≈ 1.4143
            const targetWidth = canvas.width;
            const targetHeight = Math.round(targetWidth * A4_RATIO);

            const a4Canvas = document.createElement('canvas');
            a4Canvas.width = targetWidth;
            a4Canvas.height = targetHeight;
            const ctx = a4Canvas.getContext('2d');

            if (!ctx) {
                console.error('[PDF] 无法创建 canvas 2d 上下文');
                return false;
            }

            // 先用白色填满整个 A4 画布
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            if (canvas.height <= targetHeight) {
                // 内容高度 ≤ A4 高度：直接绘制在顶部，底部保留白色
                ctx.drawImage(canvas, 0, 0);
            } else {
                // 内容高度 > A4 高度：等比缩放以适应 A4 页面
                const fitScale = targetHeight / canvas.height;
                const scaledWidth = Math.round(canvas.width * fitScale);
                const offsetX = Math.round((targetWidth - scaledWidth) / 2);
                ctx.drawImage(canvas, offsetX, 0, scaledWidth, targetHeight);
            }

            const imgData = a4Canvas.toDataURL('image/jpeg', jpegQuality);

            const pdf = pdfRef.current;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            if (index > 0) {
                pdf.addPage();
            }

            // 图像完美填满整个 PDF 页面（画布已是 A4 比例，无变形无空白）
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            setProgress(prev => ({ ...prev, current: index + 1 }));
            return true;
        } catch (error) {
            console.error("Error capturing page:", error);
            return false;
        }
    }, []);

    /**
     * Sanitizes a filename to ensure it's safe for all platforms and browsers.
     * Removes invalid characters and ensures proper .pdf extension.
     */
    const sanitizeFilename = (name: string): string => {
        // Remove or replace invalid filename characters for Windows/Mac/Linux
        let safe = name
            .replace(/[\\/:"*?<>|]/g, '_')  // Invalid filesystem chars
            .replace(/[\x00-\x1f\x7f]/g, '') // Control characters
            .replace(/\s+/g, ' ')             // Collapse multiple spaces
            .trim();

        // Fallback if name becomes empty after sanitization
        if (!safe || safe.length === 0) {
            safe = '笔顺字帖';
        }

        // Limit length (leave room for extension)
        if (safe.length > 100) {
            safe = safe.substring(0, 100);
        }

        // Ensure .pdf extension (case-insensitive check)
        if (!safe.toLowerCase().endsWith('.pdf')) {
            safe = `${safe}.pdf`;
        }

        return safe;
    };

    /**
     * Finalizes the PDF generation and saves the file.
     * Uses jsPDF native save() which handles filenames correctly.
     */
    const finishPDF = useCallback((filename: string = 'worksheet.pdf') => {
        // Step 1: Sanitize filename to prevent issues
        const finalFile = sanitizeFilename(filename);
        console.log(`[PDF] Preparing to save: "${finalFile}" (original: "${filename}")`);

        if (!pdfRef.current || abortRef.current) {
            console.warn("[PDF] finishPDF called but conditions not met (null pdf or aborted)");
            return;
        }

        const pdf = pdfRef.current;

        // Step 2: Set PDF metadata
        const titleWithoutExt = finalFile.replace(/\.pdf$/i, '');
        pdf.setProperties({
            title: titleWithoutExt,
            subject: 'Hanzi Stroke Order Worksheet',
            author: 'Hanzi Worksheet Generator',
            creator: 'jsPDF'
        });

        try {
            // 直接保存 PDF（不调用 output() 预验证，避免潜在的 jsPDF 内部状态干扰）
            console.log(`[PDF] 页数: ${pdf.getNumberOfPages()}, 正在保存: "${finalFile}"`);
            pdf.save(finalFile);

            console.log(`[PDF] ✅ 下载完成: "${finalFile}"`);
            setProgress(prev => ({ ...prev, status: 'complete' }));

        } catch (error) {
            console.error("[PDF] Download failed:", error);
            setProgress(prev => ({ ...prev, status: 'error' }));
            alert(`PDF下载失败，请重试。\n文件名: ${finalFile}`);
        } finally {
            // Reset states with appropriate delays
            setTimeout(() => {
                setIsDownloading(false);
                pdfRef.current = null;
            }, 1000);

            setTimeout(() => {
                setProgress({ current: 0, total: 0, status: 'idle' });
            }, 5000);
        }
    }, []);

    /**
     * Diagnostic feature: Previews the current PDF in a new tab without downloading.
     */
    const previewPDF = useCallback(() => {
        if (!pdfRef.current) {
            console.error("[PDF] No PDF instance available for preview");
            return;
        }

        try {
            console.log("[PDF] Generating preview...");
            const blob = pdfRef.current.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Keep URL active for 5 minutes for viewing
            setTimeout(() => URL.revokeObjectURL(url), 300000);
        } catch (error) {
            console.error("[PDF] Preview failed:", error);
        }
    }, []);



    const cancelGeneration = useCallback(() => {
        abortRef.current = true;
        setIsDownloading(false);
        pdfRef.current = null;
        setProgress(prev => ({ ...prev, status: 'cancelled' }));

        setTimeout(() => {
            setProgress({ current: 0, total: 0, status: 'idle' });
        }, 2000);
    }, []);

    return {
        isDownloading,
        progress,
        startPDF,
        capturePage,
        finishPDF,
        previewPDF,
        cancelGeneration
    };
}
