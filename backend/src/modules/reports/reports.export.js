const XLSX  = require('xlsx');
const PDFDocument = require('pdfkit');

// ── CSV ───────────────────────────────────────────────────────

function buildCsv(columns, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header = columns.map(escape).join(',');
  const body   = rows.map((r) => columns.map((c) => escape(r[c])).join(','));
  return [header, ...body].join('\r\n');
}

// ── Excel ─────────────────────────────────────────────────────

function buildExcel(reportName, workspaceName, columns, rows, totals, filters) {
  const wb   = XLSX.utils.book_new();
  const data = [];

  // Header block
  data.push([reportName]);
  data.push([`Workspace: ${workspaceName || ''}`]);
  data.push([`Generated: ${new Date().toISOString()}`]);
  if (filters && Object.keys(filters).length > 0) {
    data.push([`Filters: ${JSON.stringify(filters)}`]);
  }
  data.push([]);

  // Column headers
  data.push(columns);

  // Rows
  for (const row of rows) {
    data.push(columns.map((c) => row[c] ?? ''));
  }

  // Totals
  if (totals) {
    data.push([]);
    data.push(['Totals', ...columns.slice(1).map((c) => totals[c] ?? '')]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// ── PDF ───────────────────────────────────────────────────────

function buildPdf(reportName, workspaceName, columns, rows, totals, filters) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width - 80;

    // Header
    doc.fontSize(16).font('Helvetica-Bold').text('Tetri Copilot', 40, 40);
    doc.fontSize(12).font('Helvetica').text(reportName, 40, 62);
    doc.fontSize(9).fillColor('#64748b')
      .text(`Workspace: ${workspaceName || ''}  |  Generated: ${new Date().toLocaleString()}`, 40, 80);
    if (filters && Object.keys(filters).length > 0) {
      doc.text(`Filters: ${Object.entries(filters).map(([k, v]) => `${k}=${v}`).join(', ')}`, 40, 94);
    }

    doc.moveTo(40, 110).lineTo(40 + pageW, 110).strokeColor('#e2e8f0').stroke();
    doc.fillColor('#000000');

    // Table
    const colCount = columns.length;
    const colW     = Math.floor(pageW / colCount);
    let   y        = 122;
    const rowH     = 16;

    // Header row
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#1e293b');
    columns.forEach((col, i) => {
      doc.text(col, 40 + i * colW, y, { width: colW - 4, ellipsis: true });
    });
    y += rowH;
    doc.moveTo(40, y - 2).lineTo(40 + pageW, y - 2).strokeColor('#cbd5e1').stroke();

    // Data rows
    doc.font('Helvetica').fontSize(7).fillColor('#334155');
    for (const row of rows) {
      if (y > doc.page.height - 60) {
        doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
        y = 40;
      }
      columns.forEach((col, i) => {
        const val = row[col] ?? '';
        doc.text(String(val), 40 + i * colW, y, { width: colW - 4, ellipsis: true });
      });
      y += rowH;
    }

    // Totals
    if (totals) {
      y += 4;
      doc.moveTo(40, y).lineTo(40 + pageW, y).strokeColor('#94a3b8').stroke();
      y += 6;
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#0f172a');
      doc.text('Totals', 40, y, { width: colW - 4 });
      columns.slice(1).forEach((col, i) => {
        const val = totals[col] != null ? String(totals[col]) : '';
        doc.text(val, 40 + (i + 1) * colW, y, { width: colW - 4 });
      });
    }

    // Page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      doc.fontSize(7).fillColor('#94a3b8')
        .text(`Page ${i + 1} of ${pages.count}`, 40, doc.page.height - 30, { align: 'right', width: pageW });
    }

    doc.end();
  });
}

// ── Dispatch ─────────────────────────────────────────────────

async function generateExport(format, reportName, workspaceName, columns, rows, totals, filters) {
  if (format === 'csv') {
    return { buffer: Buffer.from(buildCsv(columns, rows), 'utf8'), mimeType: 'text/csv', ext: 'csv' };
  }
  if (format === 'excel') {
    return { buffer: buildExcel(reportName, workspaceName, columns, rows, totals, filters), mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' };
  }
  if (format === 'pdf') {
    const buf = await buildPdf(reportName, workspaceName, columns, rows, totals, filters);
    return { buffer: buf, mimeType: 'application/pdf', ext: 'pdf' };
  }
  throw new Error(`Unsupported export format: ${format}`);
}

module.exports = { generateExport };
