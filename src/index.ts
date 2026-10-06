// Public API exports for react-invoice-pdf-builder

// Components
export { DocumentTemplate, type DocumentTemplateProps } from './components/DocumentTemplate';

// Hooks
export { usePdfExport, type UsePdfExportOptions } from './hooks/usePdfExport';

// Core PDF & Currency functions
export {
  generatePdfBlob,
  downloadPdfFromElement,
  type PdfExportOptions,
} from './core/pdfExporter';
export { formatCurrency } from './core/currency';

// Themes
export {
  elegantGoldTheme,
  modernSlateTheme,
  minimalMonoTheme,
  resolveTheme,
  type BuiltInThemeName,
} from './themes';

// Types
export type {
  LineItem,
  TaxEntry,
  DiscountEntry,
  CompanyDetails,
  CustomerDetails,
  BankDetails,
  SignatureDetails,
  DocumentData,
  DocumentTheme,
} from './types/document';
