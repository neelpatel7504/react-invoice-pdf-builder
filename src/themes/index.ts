import { DocumentTheme } from '../types/document';

export const elegantGoldTheme: DocumentTheme = {
  primaryColor: '#5D1C34', // Deep Maroon
  accentColor: '#B58E58', // Regal Gold
  textColor: '#4A1529',
  mutedColor: '#8B7355',
  backgroundColor: '#FCF8F1', // Soft Cream
  cardBgColor: '#F7EFE1',
  fontFamilySans: "'Urbanist', 'Segoe UI', sans-serif",
  fontFamilySerif: "Georgia, 'Times New Roman', serif",
  borderStyle: 'solid',
};

export const modernSlateTheme: DocumentTheme = {
  primaryColor: '#0F172A', // Slate 900
  accentColor: '#3B82F6', // Blue 500
  textColor: '#1E293B', // Slate 800
  mutedColor: '#64748B', // Slate 500
  backgroundColor: '#FFFFFF',
  cardBgColor: '#F8FAFC', // Slate 50
  fontFamilySans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilySerif: "'Inter', sans-serif",
  borderStyle: 'solid',
};

export const minimalMonoTheme: DocumentTheme = {
  primaryColor: '#111111',
  accentColor: '#444444',
  textColor: '#222222',
  mutedColor: '#777777',
  backgroundColor: '#FFFFFF',
  cardBgColor: '#F9F9F9',
  fontFamilySans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilySerif: "-apple-system, BlinkMacSystemFont, sans-serif",
  borderStyle: 'solid',
};

export type BuiltInThemeName = 'elegant' | 'modern' | 'minimal';

export function resolveTheme(theme?: BuiltInThemeName | DocumentTheme): DocumentTheme {
  if (!theme) return elegantGoldTheme;
  if (typeof theme === 'object') return theme;

  switch (theme) {
    case 'modern':
      return modernSlateTheme;
    case 'minimal':
      return minimalMonoTheme;
    case 'elegant':
    default:
      return elegantGoldTheme;
  }
}
