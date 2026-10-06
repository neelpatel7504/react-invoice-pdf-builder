# Master Guide: Building, Bundling & Publishing a React NPM Package
### Project: `react-invoice-pdf-builder`

This document is a comprehensive, step-by-step handbook created for learning purposes. It details every architectural decision, shell command, configuration file, and procedure required to create, build, test, and publish a modern TypeScript React library to the public NPM registry.

---

## Table of Contents
1. [Prerequisites & Core Concepts](#1-prerequisites--core-concepts)
2. [Git Workflow & Branching](#2-git-workflow--branching)
3. [Package Directory & File Structure](#3-package-directory--file-structure)
4. [Configuration Files Deep Dive](#4-configuration-files-deep-dive)
   - [`package.json`](#packagejson)
   - [`tsconfig.json`](#tsconfigjson)
   - [`tsup.config.ts`](#tsupconfigts)
5. [Source Code Architecture & Implementation](#5-source-code-architecture--implementation)
   - [Universal Data Schema (`src/types/document.ts`)](#universal-data-schema)
   - [High-DPI Multi-Page PDF Engine (`src/core/pdfExporter.ts`)](#high-dpi-multi-page-pdf-engine)
   - [Multi-Currency Formatter (`src/core/currency.ts`)](#multi-currency-formatter)
   - [Design Token System (`src/themes/index.ts`)](#design-token-system)
   - [Zero-Dependency Component (`src/components/DocumentTemplate.tsx`)](#zero-dependency-component)
   - [React Hook (`src/hooks/usePdfExport.ts`)](#react-hook)
   - [Public API Entry Point (`src/index.ts`)](#public-api-entry-point)
6. [Compilation & Bundling with `tsup`](#6-compilation--bundling-with-tsup)
7. [Testing & Local Development](#7-testing--local-development)
   - [Interactive In-App Demo Page](#interactive-in-app-demo-page)
   - [Testing via `npm link`](#testing-via-npm-link)
8. [Publishing to NPM (Step-by-Step)](#8-publishing-to-npm-step-by-step)
9. [Maintenance, Versioning & Semantic Releases](#9-maintenance-versioning--semantic-releases)
10. [Troubleshooting & Common Pitfalls](#10-troubleshooting--common-pitfalls)

---

## 1. Prerequisites & Core Concepts

### Why Build a Standalone Library?
When building features inside an application (like quotation generation), the code is tightly coupled to application state (Redux, Axios, specific CSS frameworks). Turning it into an NPM package requires:
- **Decoupling**: No dependencies on project-specific global stores or routers.
- **Portability**: Usable in any React app (Next.js, Create React App, Vite, Remix).
- **Dual-Module Output**: Modern tools use ES Modules (`import/export`), while older environments use CommonJS (`require()`). Your library must provide both.
- **Zero CSS Runtime Collisions**: If your library uses Tailwind or Emotion, it might conflict with the host app's styling. Inline styles with typed theme tokens solve this cleanly.

---

## 2. Git Workflow & Branching

Always create a feature branch before developing new packages to prevent polluting your main/production branches:

```bash
# 1. Ensure your local repository is up to date
git fetch origin

# 2. Create and switch to the new feature branch
git checkout -b feat/invoice-pdf-builder

# 3. Check the current branch status
git status
```

---

## 3. Package Directory & File Structure

Inside your monorepo or project root, the package lives in `packages/react-invoice-pdf-builder`:

```text
packages/react-invoice-pdf-builder/
├── package.json              # Defines package metadata, entry points & peer deps
├── tsconfig.json             # TypeScript compiler settings for library build
├── tsup.config.ts            # Fast build configuration (bundles CJS, ESM, and .d.ts)
├── README.md                 # Public documentation shown on npmjs.com
├── PACKAGE_GUIDE.md          # Comprehensive internal documentation (this file)
├── dist/                     # Auto-generated compilation artifacts (published to npm)
│   ├── index.js              # CommonJS bundle
│   ├── index.mjs             # ES Module bundle
│   ├── index.d.ts            # TypeScript type declarations
│   └── index.d.mts           # TypeScript ESM type declarations
└── src/
    ├── index.ts              # Public API barrel export
    ├── types/
    │   └── document.ts       # Types for Items, Taxes, Discounts, Themes, Data
    ├── core/
    │   ├── pdfExporter.ts    # Multi-page A4 html2canvas + jsPDF engine
    │   └── currency.ts       # Multi-currency formatter (INR, USD, EUR, GBP)
    ├── hooks/
    │   └── usePdfExport.ts   # Custom React hook for triggering exports
    ├── themes/
    │   └── index.ts          # Preset themes (elegant, modern, minimal) & resolver
    └── components/
        └── DocumentTemplate.tsx # Print-ready, customizable invoice container
```

---

## 4. Configuration Files Deep Dive

### `package.json`
Located at: `packages/react-invoice-pdf-builder/package.json`

```json
{
  "name": "react-invoice-pdf-builder",
  "version": "1.0.0",
  "description": "Customizable, print-ready React quotation & invoice builder with high-res PDF export.",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tsup": "^8.3.5",
    "typescript": "^5.0.0"
  }
}
```

#### Why each field matters:
- **`main`**: The entry point for CommonJS (`const { DocumentTemplate } = require('...')`).
- **`module`**: The entry point for modern bundlers using ES Modules (`import { DocumentTemplate } from '...'`).
- **`types`**: Tells TypeScript where to find type definitions for IDE autocomplete.
- **`files`**: Limits what gets uploaded to NPM. **Never upload `src/` or `node_modules`** — only publish `dist/` and `README.md`.
- **`peerDependencies`**: **Crucial rule for React libraries**. Never put `react` inside `dependencies`. If bundled, the host application will end up with two active instances of React, triggering:
  `Error: Invalid hook call. Hooks can only be called inside the body of a function component.`
- **`prepublishOnly`**: Automatically executes `npm run build` whenever you run `npm publish` so you never accidentally publish stale or broken code.

---

### `tsconfig.json`
Located at: `packages/react-invoice-pdf-builder/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### `tsup.config.ts`
Located at: `packages/react-invoice-pdf-builder/tsup.config.ts`

`tsup` is powered by `esbuild`. It is 100x faster than traditional Webpack/Babel pipelines.

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],    // Generates both dist/index.js and dist/index.mjs
  dts: true,                 // Automatically generates .d.ts type declaration files
  clean: true,               // Clears the dist folder before every build
  sourcemap: true,
  minify: false,             // Set to true if you want compressed bundles
  external: ['react', 'react-dom'], // Never bundle React itself
});
```

---

## 5. Source Code Architecture & Implementation

### Universal Data Schema
**File:** `src/types/document.ts`

A clean, decoupled schema that covers quotations, tax invoices, purchase orders, and estimates.

```typescript
export interface LineItem {
  id?: string | number;
  description: string;
  category?: string;
  quantity: number;
  unit?: string;             // e.g. "pcs", "days", "hours"
  rate: number;
  taxPercent?: number;
  amount: number;
}

export interface TaxEntry {
  name: string;              // e.g. "CGST (9%)", "VAT (15%)"
  amount: number;
  rate?: number;
}

export interface DiscountEntry {
  name: string;              // e.g. "Festive Discount"
  amount: number;
  rate?: number;
}

export interface CompanyDetails {
  name: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;            // GSTIN / PAN / VAT ID
}

export interface CustomerDetails {
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;
}

export interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
}

export interface SignatureDetails {
  label?: string;            // e.g. "Authorized Signatory"
  name?: string;
  imageUrl?: string;
}

export interface DocumentData {
  documentTitle?: string;    // "TAX INVOICE", "ESTIMATE", "QUOTATION"
  documentNumber: string;    // "INV-2026-001"
  date: string;
  validUntil?: string;
  dueDate?: string;
  currency?: string;         // "INR", "USD", "EUR", "GBP"
  company: CompanyDetails;
  customer: CustomerDetails;
  items: LineItem[];
  subtotal: number;
  taxes?: TaxEntry[];
  discounts?: DiscountEntry[];
  total: number;
  advancePaid?: number;
  balanceDue?: number;
  notes?: string;
  termsAndConditions?: string[];
  bankDetails?: BankDetails;
  signature?: SignatureDetails;
}
```

---

### High-DPI Multi-Page PDF Engine
**File:** `src/core/pdfExporter.ts`

Handles two of the biggest problems with in-browser PDF generation:
1. **Missing Images**: Waits for logos, signatures, and QR codes to load before snapshotting.
2. **Page Breaks & Multi-page Slicing**: Converts canvas dimensions to standard millimeter units (`210mm x 297mm` A4) and slices overflowing heights across multiple PDF pages.

```typescript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PDF_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

async function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

export async function generatePdfBlob(
  element: HTMLElement,
  options?: { scale?: number; quality?: number; backgroundColor?: string }
): Promise<Blob> {
  const scale = options?.scale ?? 2;          // 2x Retina scale for crisp lines
  const quality = options?.quality ?? 0.95;
  const backgroundColor = options?.backgroundColor ?? '#ffffff';

  await waitForImagesToLoad(element);

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
    const isShortPage = pdfHeight < PDF_WIDTH_MM;
    pdf = new jsPDF({
      orientation: isShortPage ? 'l' : 'p',
      unit: 'mm',
      format: [PDF_WIDTH_MM, Math.max(pdfHeight, 50)],
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_WIDTH_MM, pdfHeight, undefined, 'FAST');
  } else {
    // Multi-page document slicing
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
```

---

### Multi-Currency Formatter
**File:** `src/core/currency.ts`

Formats currencies accurately based on local currency standards (e.g. Indian Lakh/Crore commas for `INR` vs Western thousands separators):

```typescript
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'INR'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return '0.00';

  const curr = (currency || 'INR').toUpperCase();
  switch (curr) {
    case 'INR':
      return `₹ ${num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case 'USD':
      return `$ ${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case 'EUR':
      return `€ ${num.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case 'GBP':
      return `£ ${num.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    default:
      return `${curr} ${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
}
```

---

### Design Token System
**File:** `src/themes/index.ts`

Provides customizable color schemes:
- **`elegantGoldTheme`**: Regal Maroon & Gold luxury branding (`#5D1C34`, `#B58E58`, `#FCF8F1`).
- **`modernSlateTheme`**: Clean Slate & Indigo blue corporate branding (`#0F172A`, `#3B82F6`, `#FFFFFF`).
- **`minimalMonoTheme`**: Crisp monochrome high-contrast branding (`#111111`, `#444444`, `#FFFFFF`).

---

### Zero-Dependency Component
**File:** `src/components/DocumentTemplate.tsx`

Built with vanilla inline styles and flexbox. Consuming projects can use this in Tailwind apps, Material UI apps, Ant Design apps, or CSS Modules apps without any style conflicts.

Key features:
- Standard A4 width ratio (`794px` width at standard 96 DPI).
- Semi-transparent diagonal watermark overlay (e.g. `"DRAFT"`, `"ORIGINAL"`, `"PAID"`).
- Forwarded ref (`forwardRef`) allows the hook to grab the DOM node for PDF generation.

---

### React Hook
**File:** `src/hooks/usePdfExport.ts`

Exposes an intuitive interface for developers:
```typescript
const { targetRef, downloadPdf, getBlob, isExporting, error } = usePdfExport({
  filename: 'Invoice-INV-2026.pdf',
  scale: 2,
});
```

---

### Public API Entry Point
**File:** `src/index.ts`

Barrel exports all types, functions, components, and hooks so developers can import everything cleanly:
```typescript
import {
  DocumentTemplate,
  usePdfExport,
  formatCurrency,
  type DocumentData,
} from 'react-invoice-pdf-builder';
```

---

## 6. Compilation & Bundling with `tsup`

To build the library, run the build script inside the package directory:

```bash
cd packages/react-invoice-pdf-builder
npm run build
```

### What happens during the build:
1. `tsup` reads `src/index.ts`.
2. It compiles the TypeScript code into:
   - `dist/index.js` (CommonJS bundle)
   - `dist/index.mjs` (ES Module bundle)
3. It extracts all type definitions into:
   - `dist/index.d.ts` (TypeScript types for CJS)
   - `dist/index.d.mts` (TypeScript types for ESM)
4. Takes only **~12–15 milliseconds** to complete.

---

## 7. Testing & Local Development

### Interactive In-App Demo Page
An interactive playground is already set up in this project at:
- **Source File:** `src/components/pages/Demo/PdfBuilderDemoPage.tsx`
- **Route:** `/invoice-builder-demo`

#### How to run and test:
```bash
# From the project root (/Users/macbookpro/photo-app-dashboard)
npm run start:dev
```
Open your browser and navigate to:
```
http://localhost:3000/invoice-builder-demo
```
**Features to test interactively:**
1. Switch themes dynamically using the Theme dropdown (**Elegant**, **Modern**, **Minimal**).
2. Type into the Watermark input (e.g. `"PAID"` or `"PROFORMA"`) to verify real-time watermark placement.
3. Click **📥 Download PDF** to generate and download a sharp, multi-page PDF document.

---

### Testing via `npm link`
`npm link` lets you test your local package in any other React application on your computer without publishing it to NPM first.

```bash
# Step 1: In your package folder, create the global symlink
cd packages/react-invoice-pdf-builder
npm run build
npm link

# Step 2: In any other React project on your computer
cd ~/Desktop/my-other-react-app
npm link react-invoice-pdf-builder

# Step 3: Now you can import it as a real package!
# import { DocumentTemplate } from 'react-invoice-pdf-builder';

# Step 4: When done testing, unlink it:
npm unlink react-invoice-pdf-builder
```

---

## 8. Publishing to NPM (Step-by-Step)

When you are ready to publish your library for the public or your company:

### Step 1: Create an NPM Account
If you don't already have one, create an account at [npmjs.com](https://www.npmjs.com/).

### Step 2: Choose a Unique Package Name
NPM package names must be globally unique. If `react-invoice-pdf-builder` is already taken, you can publish under your username scope:
In `package.json`:
```json
"name": "@yourusername/react-invoice-pdf-builder"
```

### Step 3: Log in via Terminal
```bash
npm login
```
*You will be prompted for your username, password, email, and 2FA authentication code.*

Verify you are logged in:
```bash
npm whoami
```

### Step 4: Build and Publish
```bash
cd packages/react-invoice-pdf-builder

# 1. Run typecheck and fresh build
npm run typecheck
npm run build

# 2. Publish to the public registry
# If using a scoped name (@yourusername/name), use --access public:
npm publish --access public
```

Congratulations! Your package is now live on `https://www.npmjs.com/package/@yourusername/react-invoice-pdf-builder`.

Anyone in the world can now install it:
```bash
npm install @yourusername/react-invoice-pdf-builder
```

---

## 9. Maintenance, Versioning & Semantic Releases

NPM strictly enforces **Semantic Versioning (SemVer)** in the format `MAJOR.MINOR.PATCH`:

| Type | When to use | Command | Example |
|---|---|---|---|
| **Patch** (`1.0.0` → `1.0.1`) | Bug fixes, typos, small adjustments | `npm version patch` | Bug fix in currency rounding |
| **Minor** (`1.0.1` → `1.1.0`) | New backward-compatible features | `npm version minor` | Added a new theme or export option |
| **Major** (`1.1.0` → `2.0.0`) | Breaking changes that require user code changes | `npm version major` | Renamed props, dropped React 17 support |

### How to release an update:
```bash
cd packages/react-invoice-pdf-builder

# 1. Make your code changes in src/
# 2. Bump the version (this updates package.json automatically)
npm version minor

# 3. Rebuild and publish
npm run build
npm publish --access public
```

---

## 10. Troubleshooting & Common Pitfalls

### Issue 1: "Invalid hook call. Hooks can only be called inside the body..."
- **Cause**: React is bundled inside your package's `dependencies`.
- **Solution**: Keep `react` and `react-dom` in `peerDependencies` and `devDependencies`. Always configure `external: ['react', 'react-dom']` in `tsup.config.ts`.

### Issue 2: Images are blank or missing in the downloaded PDF
- **Cause**: `html2canvas` took the screenshot before remote images (logos/signatures) finished loading from the CDN.
- **Solution**: Our `waitForImagesToLoad` helper scans all `<img>` tags inside the document and resolves their `onload` promises before capturing the canvas.

### Issue 3: Canvas Tainted / CORS Error
- **Cause**: Image URLs hosted on S3 or external CDNs lack CORS headers.
- **Solution**: Ensure your image CDN provides `Access-Control-Allow-Origin: *` headers, and use `useCORS: true` in `html2canvas`.

### Issue 4: Text looks blurry when printed on paper
- **Cause**: Canvas rendered at standard 1x screen resolution (72 or 96 DPI).
- **Solution**: We pass `scale: 2` to `html2canvas`, rendering at 2x Retina resolution for sharp vector-like print fidelity.

---

### Summary of Daily Useful Commands

```bash
# Build the package
npm run build

# Watch mode for active development (re-compiles on save)
npm run dev

# Verify TypeScript types without building
npm run typecheck

# Bump patch version and publish update
npm version patch && npm run build && npm publish --access public
```
