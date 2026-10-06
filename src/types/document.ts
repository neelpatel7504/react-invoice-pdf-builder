export interface LineItem {
  id?: string | number;
  description: string;
  category?: string;
  quantity: number;
  unit?: string; // e.g. "pcs", "hours", "days", "services"
  rate: number;
  taxPercent?: number;
  amount: number;
}

export interface TaxEntry {
  name: string; // e.g. "CGST (9%)", "SGST (9%)", "GST (18%)", "VAT"
  amount: number;
  rate?: number;
}

export interface DiscountEntry {
  name: string; // e.g. "Early Bird Discount", "Promo Discount"
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
  taxId?: string; // e.g. GSTIN, PAN, VAT
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
  label?: string; // e.g. "Authorized Signatory", "Customer Signature"
  name?: string;
  imageUrl?: string;
}

export interface DocumentData {
  documentTitle?: string; // e.g. "TAX INVOICE", "ESTIMATE", "QUOTATION"
  documentNumber: string; // e.g. "INV-2026-001"
  date: string;
  validUntil?: string;
  dueDate?: string;
  currency?: string; // e.g. "INR", "USD", "EUR", "GBP"

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

export interface DocumentTheme {
  primaryColor: string; // Used for titles, table header bg, total highlight
  accentColor: string; // Used for accents, borders, icons
  textColor: string; // Main body text
  mutedColor: string; // Subtitles, captions, table borders
  backgroundColor: string; // Document background
  cardBgColor?: string; // Inner card or highlight background
  fontFamilySans?: string;
  fontFamilySerif?: string;
  borderStyle?: 'solid' | 'dotted' | 'double' | 'none';
}
