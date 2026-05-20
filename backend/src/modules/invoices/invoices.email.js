const { Resend } = require('resend');

const EMAIL_FROM = process.env.EMAIL_FROM || 'Tetri Copilot <onboarding@resend.dev>';

let resend;
const getResend = () => {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
};

const sendInvoiceEmail = async ({ to, cc, bcc, subject, message, pdfBuffer, invoiceNumber, company }) => {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, skipped: true, error: 'RESEND_API_KEY not configured' };
  }

  const emailSubject = subject || `Invoice ${invoiceNumber} from ${company?.companyName || 'Us'}`;
  const emailBody    = message  || `Please find attached invoice ${invoiceNumber}. Thank you for your business.`;

  const payload = {
    from:    EMAIL_FROM,
    to:      Array.isArray(to) ? to : [to],
    subject: emailSubject,
    text:    emailBody,
    html:    `<p>${emailBody.replace(/\n/g, '<br>')}</p><br><p style="color:#64748b;font-size:12px">Sent via Tetri Copilot</p>`,
  };

  if (cc)        payload.cc  = Array.isArray(cc)  ? cc  : [cc];
  if (bcc)       payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  if (pdfBuffer) payload.attachments = [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer.toString('base64') }];

  try {
    const result = await getResend().emails.send(payload);
    if (result.error) return { success: false, skipped: false, error: result.error.message };
    return { success: true, skipped: false, id: result.data?.id };
  } catch (err) {
    return { success: false, skipped: false, error: err.message };
  }
};

module.exports = { sendInvoiceEmail };
