import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  scale?: number;
  backgroundColor?: string;
  marginMm?: number;
  quality?: number; // 0 to 1
}

const PDF_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Ensures all <img> tags inside the container have resolved before capturing.
 */
async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

/**
 * Renders an HTML element into a high-DPI PDF Blob.
 */
export async function generatePdfBlob(
  element: HTMLElement,
  options?: PdfExportOptions
): Promise<Blob> {
  const scale = options?.scale ?? 2;
  const quality = options?.quality ?? 0.95;
  const backgroundColor = options?.backgroundColor ?? '#ffffff';

  // 1. Wait for images (logos, signatures, QR codes)
  await waitForImagesToLoad(element);

  // 2. Render high-resolution canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor,
    height: element.scrollHeight,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', quality);
  const canvasWidth = canvas.width || 1;
  const canvasHeight = canvas.height || 1;
  const pdfHeight = (canvasHeight * PDF_WIDTH_MM) / canvasWidth;

  let pdf: jsPDF;

  if (pdfHeight <= A4_HEIGHT_MM) {
    // Fits in a single page
    const isShortPage = pdfHeight < PDF_WIDTH_MM;
    pdf = new jsPDF({
      orientation: isShortPage ? 'l' : 'p',
      unit: 'mm',
      format: [PDF_WIDTH_MM, Math.max(pdfHeight, 50)],
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_WIDTH_MM, pdfHeight, undefined, 'FAST');
  } else {
    // Multi-page document
    pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, PDF_WIDTH_MM, pdfHeight, undefined, 'FAST');

    let heightLeft = pdfHeight - A4_HEIGHT_MM;
    while (heightLeft > 0) {
      position -= A4_HEIGHT_MM;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, PDF_WIDTH_MM, pdfHeight, undefined, 'FAST');
      heightLeft -= A4_HEIGHT_MM;
    }
  }

  return pdf.output('blob');
}

/**
 * Triggers a direct browser download of the generated PDF.
 */
export async function downloadPdfFromElement(
  element: HTMLElement,
  options?: PdfExportOptions
): Promise<void> {
  const blob = await generatePdfBlob(element, options);
  const filename = options?.filename || 'document.pdf';
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
