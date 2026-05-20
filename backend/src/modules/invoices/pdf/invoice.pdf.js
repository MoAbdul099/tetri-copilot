const PDFDocument = require('pdfkit');

// ── Helpers ────────────────────────────────────────────────

const buildColors = (brandColor) => ({
  primary: brandColor || '#2563eb',
  text:    '#0f172a',
  muted:   '#64748b',
  light:   '#94a3b8',
  border:  '#e2e8f0',
  stripe:  '#f8fafc',
  white:   '#ffffff',
});

const fmt = (val, currency = '') => {
  const n = Number(val ?? 0);
  const s = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency ? `${currency} ${s}` : s;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const statusLabel = (s) =>
  ({ draft: 'DRAFT', issued: 'ISSUED', sent: 'SENT', paid: 'PAID', overdue: 'OVERDUE', cancelled: 'CANCELLED', void: 'VOID' }[s] || s.toUpperCase());

const statusColor = (s) =>
  ({ draft: '#64748b', issued: '#2563eb', sent: '#0891b2', paid: '#16a34a', overdue: '#dc2626', cancelled: '#6b7280', void: '#9333ea' }[s] || '#64748b');

// ── Amount in words ────────────────────────────────────────

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
  if (n < 20)  return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
  if (n < 1e3) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + _nw(n % 100) : '');
  if (n < 1e6) return _nw(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + _nw(n % 1000) : '');
  if (n < 1e9) return _nw(Math.floor(n / 1e6)) + ' Million'   + (n % 1e6  ? ' ' + _nw(n % 1e6)  : '');
  return           _nw(Math.floor(n / 1e9)) + ' Billion'   + (n % 1e9  ? ' ' + _nw(n % 1e9)  : '');
};
const amountInWords = (amount, currency = '') => {
  const n     = Math.abs(Number(amount) || 0);
  const whole = Math.floor(n);
  const cents = Math.round((n - whole) * 100);
  const name  = CURRENCY_NAMES[currency] || currency;
  const words = whole === 0 ? 'Zero' : _nw(whole);
  return cents > 0
    ? `${words} ${name} and ${String(cents).padStart(2, '0')}/100`
    : `${words} ${name} Only`;
};

// ── PDF generator ──────────────────────────────────────────

const generateInvoicePdf = (invoice, company) =>
  new Promise((resolve, reject) => {
    const MARGIN = 36;
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN, info: { Title: `Invoice ${invoice.invoiceNumber}` } });
    const buffers = [];
    doc.on('data',  (d) => buffers.push(d));
    doc.on('end',   ()  => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const C  = buildColors(company?.brandColor);
    const PW = doc.page.width;
    const W  = PW - MARGIN * 2;   // usable width
    const currency = invoice.currencyCode || '';

    let y = MARGIN;

    // ── Header ─────────────────────────────────────────────
    // Primary colour bar at the very top
    doc.rect(0, 0, PW, 6).fill(C.primary);
    y = 22;

    // Company name (left) / INVOICE label (right)
    doc.font('Helvetica-Bold').fontSize(20).fillColor(C.text)
      .text(company?.companyName || 'Your Company', MARGIN, y, { width: W * 0.55, lineBreak: false });

    doc.font('Helvetica-Bold').fontSize(26).fillColor(C.primary)
      .text('INVOICE', MARGIN + W * 0.55, y, { width: W * 0.45, align: 'right', lineBreak: false });

    y += 30;

    // Company detail lines (left) / Invoice number + status (right)
    const companyLines = [
      company?.email,
      company?.phone,
      company?.addressLine1,
      [company?.city, company?.postalCode].filter(Boolean).join(', '),
      company?.taxNumber ? `Tax No: ${company.taxNumber}` : null,
    ].filter(Boolean);

    const detailStartY = y;
    doc.font('Helvetica').fontSize(8.5).fillColor(C.muted);
    companyLines.forEach((line) => {
      doc.text(line, MARGIN, y, { width: W * 0.5, lineBreak: false });
      y += 13;
    });

    // Right column: number + status
    const rightX = MARGIN + W * 0.55;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.light)
      .text('INVOICE NUMBER', rightX, detailStartY, { width: W * 0.45, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.text)
      .text(invoice.invoiceNumber, rightX, detailStartY + 11, { width: W * 0.45, align: 'right' });

    // Status pill (right)
    const sColor = statusColor(invoice.status);
    const sLabel = statusLabel(invoice.status);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(sColor)
      .text(sLabel, rightX, detailStartY + 30, { width: W * 0.45, align: 'right' });

    y = Math.max(y, detailStartY + 55) + 16;

    // ── Divider ────────────────────────────────────────────
    doc.rect(MARGIN, y, W, 1).fill(C.border);
    y += 14;

    // ── Meta row (dates + reference) ───────────────────────
    const metaCols = [
      { label: 'Issue Date',      value: fmtDate(invoice.issueDate) },
      { label: 'Due Date',        value: fmtDate(invoice.dueDate)   },
      ...(invoice.referenceNumber ? [{ label: 'Reference', value: invoice.referenceNumber }] : []),
      ...(invoice.poNumber        ? [{ label: 'PO Number', value: invoice.poNumber        }] : []),
    ];
    const metaW = W / Math.max(metaCols.length, 1);
    metaCols.forEach((col, i) => {
      const cx = MARGIN + i * metaW;
      doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
        .text(col.label.toUpperCase(), cx, y, { width: metaW - 8 });
      doc.font('Helvetica').fontSize(9).fillColor(C.text)
        .text(col.value, cx, y + 10, { width: metaW - 8 });
    });
    y += 32;

    // ── Bill To ────────────────────────────────────────────
    doc.rect(MARGIN, y, W, 1).fill(C.border);
    y += 10;

    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
      .text('BILL TO', MARGIN, y);
    y += 11;

    const cust = invoice.customer;
    if (cust) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor(C.text)
        .text(cust.name, MARGIN, y);
      y += 14;
      const addrParts = [
        cust.addressLine1, cust.addressLine2,
        [cust.city, cust.stateRegion, cust.postalCode].filter(Boolean).join(', '),
        cust.country,
        cust.email,
        cust.taxNumber ? `Tax No: ${cust.taxNumber}` : null,
      ].filter(Boolean);
      doc.font('Helvetica').fontSize(8.5).fillColor(C.muted);
      addrParts.forEach((p) => { doc.text(p, MARGIN, y, { width: 240 }); y += 12; });
    }
    y += 18;

    // ── Line items table ───────────────────────────────────
    // Column layout
    const COL = {
      desc:  MARGIN,
      qty:   MARGIN + W - 270,
      price: MARGIN + W - 210,
      disc:  MARGIN + W - 150,
      tax:   MARGIN + W - 90,
      total: MARGIN + W - 30,
    };
    const COL_W = {
      desc:  COL.qty  - COL.desc  - 6,
      qty:   54,
      price: 54,
      disc:  54,
      tax:   54,
      total: 60,
    };

    // Table header
    const HDR_H = 22;
    doc.rect(MARGIN, y, W, HDR_H).fill(C.primary);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white);
    doc.text('DESCRIPTION',          COL.desc  + 4, y + 7, { width: COL_W.desc,  lineBreak: false });
    doc.text('QTY',                  COL.qty,        y + 7, { width: COL_W.qty,   align: 'right', lineBreak: false });
    doc.text('UNIT PRICE',           COL.price,      y + 7, { width: COL_W.price, align: 'right', lineBreak: false });
    doc.text('DISC%',                COL.disc,       y + 7, { width: COL_W.disc,  align: 'right', lineBreak: false });
    doc.text('TAX%',                 COL.tax,        y + 7, { width: COL_W.tax,   align: 'right', lineBreak: false });
    doc.text('TOTAL',                COL.total - 30, y + 7, { width: COL_W.total, align: 'right', lineBreak: false });
    y += HDR_H;

    // Item rows
    (invoice.items || []).forEach((item, idx) => {
      const ROW_H = 22;
      if (idx % 2 === 1) doc.rect(MARGIN, y, W, ROW_H).fill(C.stripe);
      const ry = y + 6;
      doc.font('Helvetica').fontSize(8.5).fillColor(C.text);
      doc.text(item.description,                               COL.desc  + 4, ry, { width: COL_W.desc,  lineBreak: false });
      doc.text(Number(item.quantity).toFixed(2),               COL.qty,        ry, { width: COL_W.qty,   align: 'right', lineBreak: false });
      doc.text(fmt(item.unitPrice),                            COL.price,      ry, { width: COL_W.price, align: 'right', lineBreak: false });
      doc.text(`${Number(item.discountRate || 0).toFixed(1)}%`,COL.disc,       ry, { width: COL_W.disc,  align: 'right', lineBreak: false });
      doc.text(`${Number(item.taxRate     || 0).toFixed(1)}%`, COL.tax,        ry, { width: COL_W.tax,   align: 'right', lineBreak: false });
      doc.font('Helvetica-Bold')
        .text(fmt(item.lineTotal),                             COL.total - 30, ry, { width: COL_W.total, align: 'right', lineBreak: false });
      y += ROW_H;
    });

    // ── Totals block ───────────────────────────────────────
    y += 12;
    doc.rect(MARGIN, y, W, 1).fill(C.border);
    y += 14;

    // Right-aligned totals table
    const TLABEL_X = MARGIN + W - 230;
    const TVAL_X   = MARGIN + W - 30;
    const TVAL_W   = 90;
    const TLABEL_W = 130;

    const totRow = (label, value, opts = {}) => {
      const { bold = false, color = null } = opts;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9)
        .fillColor(color || (bold ? C.text : C.muted))
        .text(label, TLABEL_X, y, { width: TLABEL_W, align: 'right', lineBreak: false });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9)
        .fillColor(color || (bold ? C.text : C.muted))
        .text(value, TVAL_X - TVAL_W, y, { width: TVAL_W, align: 'right', lineBreak: false });
      y += 18;
    };

    totRow('Subtotal', fmt(invoice.subtotal, currency));
    if (Number(invoice.discountTotal) > 0)
      totRow('Discount', `-${fmt(invoice.discountTotal, currency)}`);
    if (Number(invoice.taxTotal) > 0)
      totRow('Tax', fmt(invoice.taxTotal, currency));

    // Grand total band
    y += 4;
    const GT_H = 28;
    const GT_X = TLABEL_X - 10;
    doc.rect(GT_X, y, MARGIN + W - GT_X, GT_H).fill(C.primary);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.white)
      .text('TOTAL DUE', TLABEL_X, y + 9, { width: TLABEL_W, align: 'right', lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.white)
      .text(fmt(invoice.totalAmount, currency), TVAL_X - TVAL_W, y + 8, { width: TVAL_W, align: 'right', lineBreak: false });
    y += GT_H + 18;

    // ── Amount in words ────────────────────────────────────
    doc.rect(MARGIN, y, W, 1).fill(C.border);
    y += 10;
    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
      .text('AMOUNT IN WORDS', MARGIN, y);
    y += 11;
    doc.font('Helvetica').fontSize(9).fillColor(C.text)
      .text(amountInWords(invoice.totalAmount, currency), MARGIN, y, { width: W });
    y += doc.heightOfString(amountInWords(invoice.totalAmount, currency), { width: W }) + 18;

    // ── Notes / Terms ──────────────────────────────────────
    if (invoice.notes || invoice.terms) {
      doc.rect(MARGIN, y, W, 1).fill(C.border);
      y += 10;

      if (invoice.notes) {
        doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
          .text('NOTES', MARGIN, y);
        y += 11;
        doc.font('Helvetica').fontSize(8.5).fillColor(C.text)
          .text(invoice.notes, MARGIN, y, { width: W });
        y += doc.heightOfString(invoice.notes, { width: W }) + 14;
      }
      if (invoice.terms) {
        doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
          .text('TERMS & CONDITIONS', MARGIN, y);
        y += 11;
        doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
          .text(invoice.terms, MARGIN, y, { width: W });
      }
    }

    // ── Footer ─────────────────────────────────────────────
    const pageH = doc.page.height;
    doc.rect(0, pageH - 30, PW, 30).fill(C.primary);
    doc.font('Helvetica').fontSize(7.5).fillColor(C.white)
      .text(
        `${invoice.invoiceNumber}  ·  Generated by Tetri Copilot`,
        MARGIN, pageH - 19,
        { width: W, align: 'center', lineBreak: false }
      );

    doc.end();
  });

module.exports = { generateInvoicePdf };
