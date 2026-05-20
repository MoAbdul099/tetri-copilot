const PDFDocument = require('pdfkit');

const buildColors = (brandColor) => ({
  primary:    brandColor || '#2563eb',
  text:       '#0f172a',
  muted:      '#64748b',
  border:     '#e2e8f0',
  bg:         '#f8fafc',
  white:      '#ffffff',
  error:      '#ef4444',
});

const fmt = (val, currency = '') => {
  const n = Number(val ?? 0);
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();
};

// Amount in words
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const CURRENCY_NAMES = {
  USD: 'US Dollars', EUR: 'Euros', GBP: 'Pounds Sterling', AED: 'UAE Dirhams',
  SAR: 'Saudi Riyals', CAD: 'Canadian Dollars', AUD: 'Australian Dollars',
  CHF: 'Swiss Francs', JPY: 'Japanese Yen', SGD: 'Singapore Dollars',
};
const _nw = (n) => {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + _nw(n % 100) : '');
  if (n < 1e6) return _nw(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + _nw(n % 1000) : '');
  if (n < 1e9) return _nw(Math.floor(n / 1e6)) + ' Million' + (n % 1e6 ? ' ' + _nw(n % 1e6) : '');
  return _nw(Math.floor(n / 1e9)) + ' Billion' + (n % 1e9 ? ' ' + _nw(n % 1e9) : '');
};
const amountInWords = (amount, currency = '') => {
  const n = Math.abs(Number(amount) || 0);
  const whole = Math.floor(n);
  const cents = Math.round((n - whole) * 100);
  const name = CURRENCY_NAMES[currency] || currency;
  const words = whole === 0 ? 'Zero' : _nw(whole);
  return cents > 0
    ? `${words} ${name} and ${String(cents).padStart(2, '0')}/100`
    : `${words} ${name} Only`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusLabel = (s) => {
  const MAP = { draft: 'DRAFT', issued: 'ISSUED', sent: 'SENT', paid: 'PAID', overdue: 'OVERDUE', cancelled: 'CANCELLED', void: 'VOID' };
  return MAP[s] || s.toUpperCase();
};

const statusColor = (s) => {
  const MAP = { draft: '#64748b', issued: '#2563eb', sent: '#0891b2', paid: '#16a34a', overdue: '#dc2626', cancelled: '#6b7280', void: '#9333ea' };
  return MAP[s] || '#64748b';
};

/**
 * Generate invoice PDF buffer.
 * @param {object} invoice - fully loaded invoice object from formatInvoice()
 * @param {object} company - company record from DB
 * @returns {Promise<Buffer>}
 */
const generateInvoicePdf = (invoice, company) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Invoice ${invoice.invoiceNumber}` } });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const COLORS = buildColors(company?.brandColor);
    const W = doc.page.width - 100; // usable width
    const currency = invoice.currencyCode || '';

    // ── Header band ────────────────────────────────────────
    doc.rect(50, 40, W, 90).fill(COLORS.bg);

    // Company name
    doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.text)
      .text(company?.companyName || 'Your Company', 65, 55, { width: W / 2 });

    // Company details
    const companyLines = [
      company?.email,
      company?.phone,
      company?.addressLine1,
      [company?.city, company?.postalCode].filter(Boolean).join(', '),
      company?.taxNumber ? `Tax No: ${company.taxNumber}` : null,
    ].filter(Boolean);

    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
    companyLines.forEach((line, i) => {
      doc.text(line, 65, 78 + i * 11, { width: W / 2 });
    });

    // Invoice label + status
    doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.text)
      .text('INVOICE', 50 + W / 2, 55, { width: W / 2, align: 'right' });

    const sColor = statusColor(invoice.status);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(sColor)
      .text(statusLabel(invoice.status), 50 + W / 2, 83, { width: W / 2, align: 'right' });

    // ── Invoice meta ───────────────────────────────────────
    let y = 148;
    const col1 = 50, col2 = 230, col3 = 370, col4 = 470;

    const metaRow = (label, value, cx, cy, w = 140) => {
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.muted).text(label.toUpperCase(), cx, cy, { width: w });
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text(value || '—', cx, cy + 11, { width: w });
    };

    metaRow('Invoice Number', invoice.invoiceNumber, col1, y);
    metaRow('Issue Date', fmtDate(invoice.issueDate), col2, y);
    metaRow('Due Date', fmtDate(invoice.dueDate), col3, y);
    if (invoice.referenceNumber) metaRow('Reference', invoice.referenceNumber, col4, y, 90);

    y += 42;
    if (invoice.poNumber) {
      metaRow('PO Number', invoice.poNumber, col1, y);
      y += 42;
    }

    // ── Bill To ────────────────────────────────────────────
    doc.moveTo(50, y).lineTo(50 + W, y).stroke(COLORS.border);
    y += 12;

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.muted).text('BILL TO', col1, y);
    y += 13;

    const c = invoice.customer;
    if (c) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.text).text(c.name, col1, y);
      y += 14;
      const addrParts = [
        c.addressLine1, c.addressLine2,
        [c.city, c.stateRegion, c.postalCode].filter(Boolean).join(', '),
        c.country,
        c.email,
        c.taxNumber ? `Tax No: ${c.taxNumber}` : null,
      ].filter(Boolean);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted);
      addrParts.forEach((p) => { doc.text(p, col1, y, { width: 220 }); y += 13; });
    }

    y += 16;
    doc.moveTo(50, y).lineTo(50 + W, y).stroke(COLORS.border);
    y += 14;

    // ── Line items table ───────────────────────────────────
    const COL = { desc: 50, qty: 280, price: 340, disc: 400, tax: 450, total: 490 };

    // Header row
    doc.rect(50, y, W, 20).fill(COLORS.primary);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.white);
    doc.text('DESCRIPTION', COL.desc + 4, y + 6, { width: 220 });
    doc.text('QTY', COL.qty, y + 6, { width: 55, align: 'right' });
    doc.text('PRICE', COL.price, y + 6, { width: 55, align: 'right' });
    doc.text('DISC%', COL.disc, y + 6, { width: 44, align: 'right' });
    doc.text('TAX%', COL.tax, y + 6, { width: 34, align: 'right' });
    doc.text('TOTAL', COL.total, y + 6, { width: W - COL.total + 50, align: 'right' });
    y += 20;

    // Item rows
    (invoice.items || []).forEach((item, idx) => {
      const rowH = 22;
      if (idx % 2 === 1) doc.rect(50, y, W, rowH).fill('#f1f5f9');

      doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text);
      doc.text(item.description, COL.desc + 4, y + 6, { width: 224, lineBreak: false });
      doc.text(Number(item.quantity).toFixed(2), COL.qty, y + 6, { width: 55, align: 'right' });
      doc.text(fmt(item.unitPrice), COL.price, y + 6, { width: 55, align: 'right' });
      doc.text(`${Number(item.discountRate || 0).toFixed(1)}%`, COL.disc, y + 6, { width: 44, align: 'right' });
      doc.text(`${Number(item.taxRate || 0).toFixed(1)}%`, COL.tax, y + 6, { width: 34, align: 'right' });
      doc.font('Helvetica-Bold').text(fmt(item.lineTotal), COL.total, y + 6, { width: W - COL.total + 50, align: 'right' });
      y += rowH;
    });

    y += 10;
    doc.moveTo(50, y).lineTo(50 + W, y).stroke(COLORS.border);
    y += 12;

    // ── Totals ─────────────────────────────────────────────
    const totRow = (label, value, bold = false) => {
      const display = typeof value === 'string' ? value : fmt(value, currency);
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(bold ? COLORS.text : COLORS.muted);
      doc.text(label, 350, y, { width: 130, align: 'right' });
      doc.text(display, 490, y, { width: W - 440, align: 'right' });
      y += 16;
    };

    totRow('Subtotal', invoice.subtotal);
    if (Number(invoice.discountTotal) > 0) totRow('Discount', `-${fmt(invoice.discountTotal, currency)}`);
    if (Number(invoice.taxTotal) > 0) totRow('Tax', invoice.taxTotal);
    doc.moveTo(350, y).lineTo(50 + W, y).stroke(COLORS.border);
    y += 6;
    doc.rect(350, y, W - 300, 24).fill(COLORS.primary);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.white)
      .text('TOTAL DUE', 354, y + 6, { width: 126, align: 'right' });
    doc.text(`${currency} ${Number(invoice.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      490, y + 6, { width: W - 440, align: 'right' });
    y += 36;

    // ── Amount in words ────────────────────────────────────
    const wordsText = amountInWords(invoice.totalAmount, currency);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLORS.muted).text('AMOUNT IN WORDS', 50, y);
    y += 12;
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.text).text(wordsText, 50, y, { width: W });
    y += 20;

    // ── Notes / Terms ──────────────────────────────────────
    if (invoice.notes || invoice.terms) {
      doc.moveTo(50, y).lineTo(50 + W, y).stroke(COLORS.border);
      y += 12;

      if (invoice.notes) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text('NOTES', 50, y);
        y += 12;
        doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text).text(invoice.notes, 50, y, { width: W });
        y += doc.heightOfString(invoice.notes, { width: W }) + 12;
      }
      if (invoice.terms) {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted).text('TERMS & CONDITIONS', 50, y);
        y += 12;
        doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.text).text(invoice.terms, 50, y, { width: W });
      }
    }

    // ── Footer ─────────────────────────────────────────────
    const pageH = doc.page.height;
    doc.rect(50, pageH - 60, W, 1).fill(COLORS.border);
    doc.font('Helvetica').fontSize(7.5).fillColor(COLORS.muted)
      .text(`${invoice.invoiceNumber} · Generated by Tetri Copilot`, 50, pageH - 50, { width: W, align: 'center' });

    doc.end();
  });

module.exports = { generateInvoicePdf };
