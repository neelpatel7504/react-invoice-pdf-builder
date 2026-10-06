# react-invoice-pdf-builder

A lightweight, customizable, zero-CSS-runtime React library to generate, preview, and download print-ready Quotations and Invoices with high-resolution multi-page PDF export.

## Features

- 📄 **Print & PDF Ready**: Multi-page A4 slicing, Retina/high-DPI capture via `html2canvas` and `jsPDF`.
- 🖼 **Pre-flight Image Loading**: Ensures logos, signatures, and QR codes are 100% loaded before PDF generation.
- 🎨 **Theme Presets**: Includes `elegant` (Maroon & Gold luxury), `modern` (Slate blue corporate), and `minimal` (Monochrome) themes, or pass your own custom theme object.
- 💰 **Multi-Currency Support**: Built-in formatting for `INR` (Indian numbering system `₹ 1,00,000.00`), `USD`, `EUR`, and `GBP`.
- 🪝 **React Hook (`usePdfExport`)**: Effortlessly trigger downloads or retrieve raw `Blob` objects for email or cloud upload.
- ⚡ **Zero External CSS**: Inline styles ensure zero clashes with Tailwind, Bootstrap, Emotion, or Styled-Components.

---

## Installation

```bash
npm install react-invoice-pdf-builder html2canvas jspdf
```

*Note: `react` and `react-dom` (>=17.0.0) are peer dependencies.*

---

## Quick Start

```tsx
import React from 'react';
import {
  DocumentTemplate,
  usePdfExport,
  DocumentData,
} from 'react-invoice-pdf-builder';

const sampleData: DocumentData = {
  documentTitle: 'TAX INVOICE',
  documentNumber: 'INV-0001',
  date: '2026-01-01',
  currency: 'INR',
  company: {
    name: 'ABC Studio',
    phone: '+91 00000 00000',
    email: 'contact@abcstudio.com',
    address: '123 Sample Street, Suite 100',
    city: 'City, State 000000',
    taxId: '22AAAAA0000A1Z5',
  },
  customer: {
    name: 'John Doe',
    phone: '+91 00000 00000',
    email: 'client@example.com',
    address: '456 Client Avenue',
    city: 'City, State',
  },
  items: [
    {
      id: 1,
      description: 'Photography & Cinematography Services',
      quantity: 1,
      rate: 50000,
      amount: 50000,
    },
    {
      id: 2,
      description: 'Drone Aerial Coverage',
      quantity: 1,
      rate: 10000,
      amount: 10000,
    },
  ],
  subtotal: 60000,
  taxes: [{ name: 'GST (18%)', amount: 10800 }],
  total: 70800,
  advancePaid: 20000,
  balanceDue: 50800,
  bankDetails: {
    bankName: 'ABC Bank',
    accountName: 'ABC Studio',
    accountNumber: '00000000000000',
    ifscCode: 'ABCD0000000',
    upiId: 'abcstudio@upi',
  },
  termsAndConditions: [
    'Advance payment is required to confirm booking.',
    'Deliverables will be processed within the agreed timeline.',
  ],
};

export default function InvoicePage() {
  const { targetRef, downloadPdf, isExporting } = usePdfExport({
    filename: 'Invoice-INV-0001.pdf',
  });

  return (
    <div style={{ padding: '24px' }}>
      <button
        onClick={() => downloadPdf()}
        disabled={isExporting}
        style={{
          padding: '10px 20px',
          background: '#5D1C34',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        {isExporting ? 'Generating PDF...' : 'Download PDF'}
      </button>

      {/* Render Document */}
      <DocumentTemplate
        ref={targetRef}
        data={sampleData}
        theme="elegant" // 'elegant' | 'modern' | 'minimal' | custom object
        watermarkText="ORIGINAL"
      />
    </div>
  );
}
```

---

## API Reference

### `<DocumentTemplate />` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `DocumentData` | *required* | The invoice or quotation data object |
| `theme` | `'elegant' \| 'modern' \| 'minimal' \| DocumentTheme` | `'elegant'` | Preset theme name or custom theme object |
| `watermarkText` | `string` | `undefined` | Optional diagonal background watermark text |
| `className` | `string` | `undefined` | Optional CSS class name |
| `style` | `React.CSSProperties` | `undefined` | Optional container style overrides |

---

### `usePdfExport(options?)`

| Option | Type | Description |
|---|---|---|
| `filename` | `string` | Default filename for the downloaded PDF |
| `scale` | `number` (default: 2) | Canvas scale multiplier for high-DPI rendering |
| `quality` | `number` (default: 0.95) | JPEG quality compression |
| `onSuccess` | `(blob: Blob) => void` | Callback triggered after blob generation |
| `onError` | `(err: Error) => void` | Callback triggered if capture fails |

**Returns:**
- `targetRef`: Attach to `<DocumentTemplate ref={targetRef} />`
- `downloadPdf(overrideFilename?)`: Initiates browser download
- `getBlob()`: Returns raw `Promise<Blob | null>`
- `isExporting`: `boolean` indicating if render is currently in progress
- `error`: `Error | null`

---

## License

MIT
