import nodemailer from 'nodemailer';

/*
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}; 
*/
// Validate required email environment variables
const requiredEmailVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
for (const envVar of requiredEmailVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e916e4185223ef",
      pass: process.env.SMTP_PASSWORD,
    }
  });

// Create transporter

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transport.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}

export async function sendConfirmationLinkEmail(to: string, fullName: string, token: string, requestId: string) {
    const base = process.env.APP_BASE_URL || "http://localhost:3000";
    const url  = `${base}/verify?token=${encodeURIComponent(token)}`;
    const now  = new Date().toISOString();
  
    const html = `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2>Confirm your email, ${fullName.replace(/[<>&'"]/g, (c) => (
          { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[c] || c
        ))}</h2>
        <p>This message is intended for <strong>${to.replace(/[<>&'"]/g, (c) => (
          { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[c] || c
        ))}</strong>.</p>
        <p><a href="${url}">Confirm my email</a> (valid ${process.env.CONFIRM_TTL_HOURS || 24}h)</p>
        <p style="color:#666;font-size:12px">sent: ${now} • requestId: ${requestId}</p>
      </div>`;
    const text = `Confirm your email (${to}). Link (valid ${process.env.CONFIRM_TTL_HOURS || 24}h): ${url}\nrequestId: ${requestId} • sent: ${now}`;
  
    await transport.sendMail({
      from: process.env.SMTP_FROM!,
      to,
      subject: `Confirm your email, ${fullName}`,
      html, text,
      headers: { "X-Request-Id": requestId }
    });
  }

// Send confirmation email
export async function sendConfirmationEmail(
  to: string,
  fullName: string,
  requestId: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Email Confirmation - Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome, ${fullName}!</h2>
          <p>Thank you for subscribing to our newsletter. Your email address <strong>${to}</strong> has been successfully added to our mailing list.</p>
          <p>We'll keep you updated with our latest news and updates.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent to confirm your subscription. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Welcome, ${fullName}!
        
        Thank you for subscribing to our newsletter. Your email address ${to} has been successfully added to our mailing list.
        
        We'll keep you updated with our latest news and updates.
        
        This email was sent to confirm your subscription. If you didn't request this, please ignore this email.
      `,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(`Confirmation email sent successfully. Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}
