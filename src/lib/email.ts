/**
 * Email utility for sending emails
 * Uses nodemailer with SMTP configuration
 */

import nodemailer from "nodemailer";
import { logger } from "./logger";

const CTX = "EmailService";

// Email configuration from environment variables
const EMAIL_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.SMTP_USER || process.env.NODEMAILER_GMAIL || process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.SMTP_PASS || process.env.NODEMAILER_GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.SMTP_FROM || process.env.EMAIL_FROM || EMAIL_USER;

// Create transporter (reusable)
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      logger.warn(CTX, "Email credentials not configured. Emails will be logged but not sent.");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    
    // If no transporter (email not configured), just log
    if (!transport) {
      logger.info(CTX, "Email would be sent (but not configured):", {
        to: options.to,
        subject: options.subject,
      });
      console.log("\n📧 EMAIL PREVIEW:");
      console.log("═══════════════════════════════════════");
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log("───────────────────────────────────────");
      console.log(options.text || "See HTML version");
      console.log("═══════════════════════════════════════\n");
      return true;
    }

    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(CTX, "Email sent successfully:", {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    logger.error(CTX, "Failed to send email:", error);
    return false;
  }
}

/**
 * Send company registration email with credentials
 */
export async function sendCompanyCredentials(
  companyName: string,
  email: string,
  password: string,
  companyCode: string,
): Promise<boolean> {
  const subject = "Welcome to Zylo Job - Your Company Account Details";
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .credential-item { margin: 10px 0; }
    .credential-label { font-weight: bold; color: #667eea; display: inline-block; width: 150px; }
    .credential-value { background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Zylo Job!</h1>
    </div>
    <div class="content">
      <h2>Hello ${companyName},</h2>
      <p>Your company account has been successfully created on Zylo Job platform. Below are your login credentials:</p>
      
      <div class="credentials">
        <div class="credential-item">
          <span class="credential-label">Company Name:</span>
          <span class="credential-value">${companyName}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Company Code:</span>
          <span class="credential-value">${companyCode}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Email:</span>
          <span class="credential-value">${email}</span>
        </div>
        <div class="credential-item">
          <span class="credential-label">Password:</span>
          <span class="credential-value">${password}</span>
        </div>
      </div>

      <div class="warning">
        <strong>⚠️ Important Security Notice:</strong>
        <ul>
          <li>Please change your password after your first login</li>
          <li>Keep your credentials secure and do not share them</li>
          <li>Never share your password via email or phone</li>
        </ul>
      </div>

      <p>You can now access your company dashboard to:</p>
      <ul>
        <li>Post job openings</li>
        <li>Manage applications</li>
        <li>Schedule interviews</li>
        <li>Onboard workers</li>
        <li>Track attendance and manage payroll</li>
      </ul>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/company/login" class="btn">Login to Your Dashboard</a>

      <p>If you have any questions or need assistance, please contact our support team.</p>

      <div class="footer">
        <p><strong>Zylo Job</strong><br>
        Making job management easier<br>
        © ${new Date().getFullYear()} All rights reserved</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to Zylo Job!

Hello ${companyName},

Your company account has been successfully created. Below are your login credentials:

Company Name: ${companyName}
Company Code: ${companyCode}
Email: ${email}
Password: ${password}

IMPORTANT SECURITY NOTICE:
- Please change your password after your first login
- Keep your credentials secure and do not share them
- Never share your password via email or phone

You can now access your company dashboard to:
- Post job openings
- Manage applications
- Schedule interviews
- Onboard workers
- Track attendance and manage payroll

Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/company/login

If you have any questions or need assistance, please contact our support team.

Best regards,
Zylo Job Team
  `;

  return sendEmail({ to: email, subject, html, text });
}
