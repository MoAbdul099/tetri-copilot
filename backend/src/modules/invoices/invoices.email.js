const nodemailer = require('nodemailer');

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
};

/**
 * Send invoice by email.
 * Returns { success, skipped, error }.
 */
const sendInvoiceEmail = async ({ to, cc, bcc, subject, message, pdfBuffer, invoiceNumber, company }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return { success: false, skipped: true, error: 'SMTP not configured' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com';
  const emailSubject = subject || `Invoice ${invoiceNumber} from ${company?.companyName || 'Us'}`;
  const emailBody = message || `Please find attached invoice ${invoiceNumber}. Thank you for your business.`;

  const mailOptions = {
    from,
    to,
    cc:  cc  || undefined,
    bcc: bcc || undefined,
    subject: emailSubject,
    text: emailBody,
    html: `<p>${emailBody.replace(/\n/g, '<br>')}</p>
           <br><p style="color:#64748b;font-size:12px">Sent via Tetri Copilot</p>`,
    attachments: pdfBuffer
      ? [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
      : [],
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, skipped: false };
  } catch (err) {
    return { success: false, skipped: false, error: err.message };
  }
};

module.exports = { sendInvoiceEmail };
