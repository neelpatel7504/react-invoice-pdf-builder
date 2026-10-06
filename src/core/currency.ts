export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'INR'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return '0.00';

  const curr = (currency || 'INR').toUpperCase();

  switch (curr) {
    case 'INR':
      // Indian numbering system: 1,00,000.00
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
