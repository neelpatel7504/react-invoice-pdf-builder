import React, { forwardRef } from 'react';
import { DocumentData, DocumentTheme } from '../types/document';
import { resolveTheme, BuiltInThemeName } from '../themes';
import { formatCurrency } from '../core/currency';

export interface DocumentTemplateProps {
  data: DocumentData;
  theme?: BuiltInThemeName | DocumentTheme;
  watermarkText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DocumentTemplate = forwardRef<HTMLDivElement, DocumentTemplateProps>(
  ({ data, theme: themeProp, watermarkText, className, style }, ref) => {
    const t = resolveTheme(themeProp);
    const currency = data.currency || 'INR';

    return (
      <div
        ref={ref}
        className={className}
        style={
          {
            width: '794px', // Standard A4 at 96 DPI
            minHeight: '1123px',
            boxSizing: 'border-box',
            backgroundColor: t.backgroundColor,
            color: t.textColor,
            fontFamily: t.fontFamilySans,
            padding: '40px 48px',
            position: 'relative',
            overflow: 'hidden',
            ...style,
          } as any
        }
      >
        {/* Optional Watermark */}
        {watermarkText && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-35deg)',
              fontSize: '80px',
              fontWeight: 800,
              color: t.accentColor,
              opacity: 0.07,
              pointerEvents: 'none',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              zIndex: 0,
              letterSpacing: '8px',
            }}
          >
            {watermarkText}
          </div>
        )}

        {/* Content Container */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header Block */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: `2px solid ${t.accentColor}`,
              paddingBottom: '24px',
              marginBottom: '28px',
            }}
          >
            {/* Company Info */}
            <div style={{ maxWidth: '440px' }}>
              {data.company.logoUrl && (
                <img
                  src={data.company.logoUrl}
                  alt={data.company.name}
                  style={{
                    maxHeight: '60px',
                    maxWidth: '220px',
                    objectFit: 'contain',
                    marginBottom: '10px',
                  }}
                />
              )}
              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontFamily: t.fontFamilySerif,
                  fontWeight: 700,
                  color: t.primaryColor,
                  letterSpacing: '0.5px',
                }}
              >
                {data.company.name}
              </h1>
              {data.company.tagline && (
                <p
                  style={{
                    margin: '3px 0 6px 0',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: t.mutedColor,
                  }}
                >
                  {data.company.tagline}
                </p>
              )}
              <div style={{ fontSize: '11px', color: t.mutedColor, lineHeight: 1.5 }}>
                {data.company.address && <div>{data.company.address}</div>}
                {(data.company.city || data.company.postalCode) && (
                  <div>
                    {[data.company.city, data.company.postalCode]
                      .filter(Boolean)
                      .join(' - ')}
                  </div>
                )}
                {data.company.phone && <div>Phone: {data.company.phone}</div>}
                {data.company.email && <div>Email: {data.company.email}</div>}
                {data.company.taxId && <div>Tax ID / GSTIN: {data.company.taxId}</div>}
              </div>
            </div>

            {/* Document Title & Meta */}
            <div style={{ textAlign: 'right' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 800,
                  color: t.primaryColor,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                }}
              >
                {data.documentTitle || 'QUOTATION'}
              </h2>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: t.accentColor,
                  marginTop: '4px',
                }}
              >
                #{data.documentNumber}
              </div>

              <div
                style={{
                  marginTop: '12px',
                  fontSize: '11px',
                  color: t.mutedColor,
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <strong>Date:</strong> {data.date}
                </div>
                {data.validUntil && (
                  <div>
                    <strong>Valid Until:</strong> {data.validUntil}
                  </div>
                )}
                {data.dueDate && (
                  <div>
                    <strong>Due Date:</strong> {data.dueDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billed To / Customer Section */}
          <div
            style={{
              backgroundColor: t.cardBgColor || '#f9f9f9',
              borderRadius: '8px',
              padding: '16px 20px',
              marginBottom: '28px',
              border: `1px solid ${t.accentColor}25`,
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: t.accentColor,
                letterSpacing: '1px',
                marginBottom: '6px',
              }}
            >
              Billed To / Client Details
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: t.primaryColor,
                marginBottom: '2px',
              }}
            >
              {data.customer.name}
            </div>
            {data.customer.companyName && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: t.textColor }}>
                {data.customer.companyName}
              </div>
            )}
            <div style={{ fontSize: '11px', color: t.mutedColor, lineHeight: 1.5, marginTop: '4px' }}>
              {data.customer.address && <div>{data.customer.address}</div>}
              {(data.customer.city || data.customer.postalCode) && (
                <div>{[data.customer.city, data.customer.postalCode].filter(Boolean).join(', ')}</div>
              )}
              {data.customer.phone && <div>Phone: {data.customer.phone}</div>}
              {data.customer.email && <div>Email: {data.customer.email}</div>}
              {data.customer.taxId && <div>Tax ID: {data.customer.taxId}</div>}
            </div>
          </div>

          {/* Items Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '28px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: t.primaryColor,
                  color: '#ffffff',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '32px' }}>#</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '70px' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '100px' }}>Rate</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: '110px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr
                  key={item.id ?? idx}
                  style={{
                    borderBottom: `1px solid ${t.accentColor}30`,
                    fontSize: '12px',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : `${t.accentColor}08`,
                  }}
                >
                  <td style={{ padding: '10px 12px', color: t.mutedColor }}>{idx + 1}</td>
                  <td style={{ padding: '10px 12px', color: t.textColor, fontWeight: 500 }}>
                    <div>{item.description}</div>
                    {item.category && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: t.mutedColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {item.quantity} {item.unit || ''}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {formatCurrency(item.rate, currency)}
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: t.primaryColor,
                    }}
                  >
                    {formatCurrency(item.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Calculation Summary & Payment Info */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '32px',
            }}
          >
            {/* Bank Details (Left side) */}
            <div style={{ maxWidth: '340px' }}>
              {data.bankDetails && (
                <div
                  style={{
                    backgroundColor: t.cardBgColor || '#f9f9f9',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: `1px solid ${t.accentColor}25`,
                    fontSize: '11px',
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: t.primaryColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '6px',
                    }}
                  >
                    Payment / Bank Details
                  </div>
                  {data.bankDetails.bankName && <div>Bank: {data.bankDetails.bankName}</div>}
                  {data.bankDetails.accountName && (
                    <div>Account Name: {data.bankDetails.accountName}</div>
                  )}
                  {data.bankDetails.accountNumber && (
                    <div>Account No: {data.bankDetails.accountNumber}</div>
                  )}
                  {data.bankDetails.ifscCode && <div>IFSC Code: {data.bankDetails.ifscCode}</div>}
                  {data.bankDetails.upiId && <div>UPI ID: {data.bankDetails.upiId}</div>}
                </div>
              )}
            </div>

            {/* Summary Totals (Right side) */}
            <div style={{ width: '280px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  fontSize: '12px',
                  color: t.textColor,
                }}
              >
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(data.subtotal, currency)}</span>
              </div>

              {/* Discounts */}
              {data.discounts?.map((disc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '11px',
                    color: '#16a34a',
                  }}
                >
                  <span>{disc.name}:</span>
                  <span>- {formatCurrency(disc.amount, currency)}</span>
                </div>
              ))}

              {/* Taxes */}
              {data.taxes?.map((tax, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '11px',
                    color: t.mutedColor,
                  }}
                >
                  <span>{tax.name}:</span>
                  <span>+ {formatCurrency(tax.amount, currency)}</span>
                </div>
              ))}

              {/* Grand Total Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  marginTop: '10px',
                  backgroundColor: t.primaryColor,
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                <span>Total Amount:</span>
                <span style={{ fontSize: '16px' }}>{formatCurrency(data.total, currency)}</span>
              </div>

              {/* Advance & Balance */}
              {typeof data.advancePaid === 'number' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0 2px 0',
                    fontSize: '11px',
                    color: t.mutedColor,
                  }}
                >
                  <span>Advance Paid:</span>
                  <span>{formatCurrency(data.advancePaid, currency)}</span>
                </div>
              )}

              {typeof data.balanceDue === 'number' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: t.primaryColor,
                  }}
                >
                  <span>Balance Due:</span>
                  <span>{formatCurrency(data.balanceDue, currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions + Signature Section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: `1px dotted ${t.accentColor}`,
              paddingTop: '20px',
            }}
          >
            {/* Terms */}
            <div style={{ maxWidth: '440px' }}>
              {data.termsAndConditions && data.termsAndConditions.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: t.primaryColor,
                      marginBottom: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Terms & Conditions:
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      fontSize: '10px',
                      color: t.mutedColor,
                      lineHeight: 1.5,
                    }}
                  >
                    {data.termsAndConditions.map((term, i) => (
                      <li key={i}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Signature */}
            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              {data.signature?.imageUrl && (
                <img
                  src={data.signature.imageUrl}
                  alt="Signature"
                  style={{
                    maxHeight: '45px',
                    maxWidth: '120px',
                    objectFit: 'contain',
                    marginBottom: '4px',
                  }}
                />
              )}
              <div
                style={{
                  borderTop: `1px solid ${t.textColor}`,
                  paddingTop: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: t.textColor,
                }}
              >
                {data.signature?.label || 'Authorized Signatory'}
              </div>
              {data.signature?.name && (
                <div style={{ fontSize: '10px', color: t.mutedColor }}>
                  {data.signature.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DocumentTemplate.displayName = 'DocumentTemplate';
