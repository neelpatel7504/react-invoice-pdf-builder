import { useState, useRef, useCallback } from 'react';
import {
  generatePdfBlob,
  downloadPdfFromElement,
  PdfExportOptions,
} from '../core/pdfExporter';

export interface UsePdfExportOptions extends PdfExportOptions {
  onSuccess?: (blob: Blob) => void;
  onError?: (err: Error) => void;
}

export function usePdfExport(defaultOptions?: UsePdfExportOptions) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const downloadPdf = useCallback(
    async (overrideFilename?: string) => {
      if (!targetRef.current) {
        const err = new Error('PDF target element is not mounted');
        setError(err);
        defaultOptions?.onError?.(err);
        return;
      }

      setIsExporting(true);
      setError(null);

      try {
        const options: PdfExportOptions = {
          ...defaultOptions,
          filename: overrideFilename || defaultOptions?.filename || 'document.pdf',
        };
        await downloadPdfFromElement(targetRef.current, options);
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        defaultOptions?.onError?.(errorObj);
      } finally {
        setIsExporting(false);
      }
    },
    [defaultOptions]
  );

  const getBlob = useCallback(async (): Promise<Blob | null> => {
    if (!targetRef.current) {
      const err = new Error('PDF target element is not mounted');
      setError(err);
      defaultOptions?.onError?.(err);
      return null;
    }

    setIsExporting(true);
    setError(null);

    try {
      const blob = await generatePdfBlob(targetRef.current, defaultOptions);
      defaultOptions?.onSuccess?.(blob);
      return blob;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      defaultOptions?.onError?.(errorObj);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [defaultOptions]);

  return {
    targetRef,
    isExporting,
    error,
    downloadPdf,
    getBlob,
  };
}
