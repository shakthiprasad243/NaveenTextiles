'use client';

import { forwardRef } from 'react';

interface InvoiceItem {
  product_name: string | null;
  size: string | null;
  color: string | null;
  qty: number | null;
  unit_price: number | null;
}

interface InvoiceData {
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  } | null;
  subtotal: number;
  shipping: number;
  total: number;
  order_items: InvoiceItem[];
}

interface InvoiceProps {
  order: InvoiceData;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

// Generate unique invoice number from order data
function generateInvoiceNumber(orderNumber: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Extract numeric part from order number or use timestamp
  const orderPart = orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase();
  
  return `INV-${year}${month}${day}-${orderPart}`;
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  (
    {
      order,
      companyName = 'Naveen Textiles',
      companyAddress = '123 Textile Market, Chennai, Tamil Nadu 600001',
      companyPhone = '+91 98765 43210',
      companyEmail = 'info@naveentextiles.com',
    },
    ref
  ) => {
    const formatAddress = (address: InvoiceData['shipping_address']) => {
      if (!address) return 'Not provided';
      const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
      ].filter(Boolean);
      return parts.join(', ') || 'Not provided';
    };

    // Generate unique invoice number
    const invoiceNumber = generateInvoiceNumber(order.order_number, order.created_at);

    // Inline styles for print compatibility
    const styles = {
      container: {
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
        color: '#e5e5e5',
        minHeight: '100%',
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '3px solid #d4af37',
        paddingBottom: '24px',
        marginBottom: '28px',
      },
      companyName: {
        fontSize: '32px',
        fontWeight: 'bold' as const,
        color: '#d4af37',
        margin: 0,
        letterSpacing: '0.5px',
      },
      companyInfo: {
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '10px',
        lineHeight: '1.6',
      },
      invoiceTitle: {
        fontSize: '28px',
        fontWeight: 'bold' as const,
        color: '#d4af37',
        margin: 0,
        letterSpacing: '3px',
      },
      invoiceInfo: {
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '14px',
        lineHeight: '1.8',
      },
      invoiceValue: {
        color: '#e5e5e5',
        fontWeight: '500' as const,
      },
      sectionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '28px',
      },
      infoBox: {
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '8px',
        padding: '18px',
      },
      sectionTitle: {
        fontSize: '11px',
        fontWeight: 'bold' as const,
        color: '#d4af37',
        textTransform: 'uppercase' as const,
        letterSpacing: '1.5px',
        marginBottom: '10px',
        marginTop: 0,
      },
      customerName: {
        fontWeight: '600' as const,
        color: '#e5e5e5',
        margin: '6px 0',
        fontSize: '15px',
      },
      customerInfo: {
        fontSize: '13px',
        color: '#9ca3af',
        margin: '4px 0',
        lineHeight: '1.5',
      },
      table: {
        width: '100%',
        marginBottom: '28px',
        borderCollapse: 'collapse' as const,
        fontSize: '13px',
      },
      tableHeader: {
        background: 'linear-gradient(90deg, #d4af37, #b8860b)',
      },
      th: {
        padding: '14px 16px',
        fontWeight: '600' as const,
        color: '#1a1a2e',
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
      },
      td: {
        padding: '14px 16px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        color: '#e5e5e5',
      },
      tdMuted: {
        padding: '14px 16px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        color: '#9ca3af',
      },
      tdTotal: {
        padding: '14px 16px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        color: '#d4af37',
        fontWeight: '600' as const,
      },
      totalsContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
      },
      totalsBox: {
        width: '300px',
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '8px',
        padding: '18px',
      },
      totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        fontSize: '14px',
      },
      totalLabel: {
        color: '#9ca3af',
      },
      totalValue: {
        color: '#e5e5e5',
      },
      grandTotalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '14px 0',
        marginTop: '6px',
      },
      grandTotalLabel: {
        fontWeight: 'bold' as const,
        fontSize: '16px',
        color: '#e5e5e5',
      },
      grandTotalValue: {
        fontWeight: 'bold' as const,
        fontSize: '22px',
        color: '#d4af37',
      },
      footer: {
        marginTop: '36px',
        paddingTop: '20px',
        borderTop: '2px solid rgba(212, 175, 55, 0.25)',
        textAlign: 'center' as const,
      },
      footerThank: {
        fontSize: '15px',
        color: '#d4af37',
        margin: '6px 0',
        fontWeight: '500' as const,
      },
      footerContact: {
        fontSize: '12px',
        color: '#6b7280',
        margin: '6px 0',
      },
    };

    return (
      <div ref={ref} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.companyName}>{companyName}</h1>
            <div style={styles.companyInfo}>
              <div>{companyAddress}</div>
              <div>Phone: {companyPhone}</div>
              <div>Email: {companyEmail}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={styles.invoiceTitle}>INVOICE</h2>
            <div style={styles.invoiceInfo}>
              <div>
                Invoice #: <span style={styles.invoiceValue}>{invoiceNumber}</span>
              </div>
              <div>
                Order #: <span style={styles.invoiceValue}>{order.order_number}</span>
              </div>
              <div>
                Date:{' '}
                <span style={styles.invoiceValue}>
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div style={styles.sectionGrid}>
          <div style={styles.infoBox}>
            <h3 style={styles.sectionTitle}>Bill To:</h3>
            <p style={styles.customerName}>{order.customer_name}</p>
            <p style={styles.customerInfo}>{order.customer_phone}</p>
            {order.customer_email && (
              <p style={styles.customerInfo}>{order.customer_email}</p>
            )}
          </div>
          <div style={styles.infoBox}>
            <h3 style={styles.sectionTitle}>Ship To:</h3>
            <p style={styles.customerInfo}>
              {formatAddress(order.shipping_address)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ ...styles.th, textAlign: 'left' }}>Item</th>
              <th style={{ ...styles.th, textAlign: 'left' }}>Size / Color</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Price</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{item.product_name || 'Product'}</td>
                <td style={styles.tdMuted}>
                  {item.size || '-'} / {item.color || '-'}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>
                  {item.qty || 0}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  ₹{(item.unit_price || 0).toLocaleString()}
                </td>
                <td style={{ ...styles.tdTotal, textAlign: 'right' }}>
                  ₹{((item.qty || 0) * (item.unit_price || 0)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={styles.totalsContainer}>
          <div style={styles.totalsBox}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Subtotal:</span>
              <span style={styles.totalValue}>
                ₹{order.subtotal.toLocaleString()}
              </span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Shipping:</span>
              <span
                style={{
                  color: order.shipping === 0 ? '#22c55e' : '#e5e5e5',
                }}
              >
                {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
              </span>
            </div>
            <div style={styles.grandTotalRow}>
              <span style={styles.grandTotalLabel}>Total:</span>
              <span style={styles.grandTotalValue}>
                ₹{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerThank}>
            Thank you for shopping with {companyName}!
          </p>
          <p style={styles.footerContact}>
            For any queries, contact us at {companyPhone} or {companyEmail}
          </p>
        </div>
      </div>
    );
  }
);

Invoice.displayName = 'Invoice';

export default Invoice;
