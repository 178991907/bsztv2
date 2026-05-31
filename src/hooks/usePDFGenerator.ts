
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
            // Quality settings for capture
            const isLargeDocument = total > 50;
            const scale = isLargeDocument ? 1.5 : 2;

            // Prepare element for capture (ensure it looks like a printed page)
            const originalStyle = element.style.cssText;
            element.style.width = '210mm';
            element.style.minHeight = '297mm';
            element.style.backgroundColor = '#ffffff';
            element.style.position = 'relative';
            element.style.padding = '20px';
            element.style.boxSizing = 'border-box';

            const canvas = await html2canvas(element, {
                scale: scale,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                imageTimeout: 0,
                removeContainer: true,
            });

            // Restore original style
            element.style.cssText = originalStyle;

            // Check if generation was aborted or pdf was cleared during async capture
            if (!pdfRef.current || abortRef.current) return false;

            const imgData = canvas.toDataURL('image/jpeg', isLargeDocument ? 0.85 : 0.92);

            const pdf = pdfRef.current;
            
            // 定义尺寸安全收缩裕量（单位：pt），扣除 24 pt (约 8.4mm 超宽留白) 以防止 jsPDF 因为高清 scale 滚动精度判定溢出导致自动生成空白页
            const SAFE_MARGIN = 24;
            const pdfWidth = pdf.internal.pageSize.getWidth() - SAFE_MARGIN;
            const pdfHeight = pdf.internal.pageSize.getHeight() - SAFE_MARGIN;

            if (index > 0) {
                pdf.addPage();
            }

            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;

            let finalWidth, finalHeight;
            if (canvasAspectRatio > pdfAspectRatio) {
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / canvasAspectRatio;
            } else {
                finalHeight = pdfHeight;
                finalWidth = pdfHeight * canvasAspectRatio;
            }

            // 计算完全居中的坐标位置，保证在 A4 页面上完美匀称排布
            const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
            const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;

            pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

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
            // Step 3: Validate PDF content before saving
            const pdfOutput = pdf.output('arraybuffer');
            const bytes = new Uint8Array(pdfOutput);

            const isValid = bytes.length > 4 &&
                bytes[0] === 0x25 && bytes[1] === 0x50 &&
                bytes[2] === 0x44 && bytes[3] === 0x46;

            console.log(`[PDF] Validation: ${isValid ? 'PASS' : 'FAIL'}, Pages: ${pdf.getNumberOfPages()}, Size: ${(bytes.length / 1024).toFixed(1)}KB`);

            if (!isValid) {
                throw new Error("Invalid PDF content");
            }

            // Step 4: Use jsPDF native save - this correctly handles Chinese filenames
            console.log(`[PDF] Saving via jsPDF.save("${finalFile}")...`);
            pdf.save(finalFile);

            console.log(`[PDF] ✅ Download complete: "${finalFile}"`);
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
