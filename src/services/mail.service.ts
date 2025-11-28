import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<string>('SMTP_PORT') || 587),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private generateRandomCode() {
    return Math.floor(Math.random() * 999999);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const appBaseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
    const resetLink = `${appBaseUrl}/reset-password?token=${token}`;
    const resetCode = this.generateRandomCode();

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('MAIL_FROM') || 'Auth Backend <no-reply@localhost>',
      to,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>Your reset code is: <strong>${resetCode}</strong></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailVerificationEmail(to: string, code: string) {
    const appBaseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
    const verifyLink = `${appBaseUrl}/verify-email`;

    const brandColor = this.configService.get<string>('MAIL_BRAND_COLOR') || '#4f46e5';
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('MAIL_FROM') || 'Auth Backend <no-reply@localhost>',
      to,
      subject: 'Verify your email address',
      html: `
      <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="padding:24px 24px 0 24px;">
              <h2 style="margin:0;color:#0f172a;font-size:20px;">Confirm your email</h2>
              <p style="color:#334155;line-height:1.6;margin-top:8px;">Use the 6-digit code below to verify your account. This code expires in 24 hours.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px 24px;">
              <div style="letter-spacing:8px;font-weight:700;font-size:28px;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;text-align:center;padding:18px 0;">${code}</div>
              <p style="color:#64748b;line-height:1.6;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
              <a href="${verifyLink}" style="display:inline-block;margin-top:12px;background:${brandColor};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Open App</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px 24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">This is an automated message. Please do not reply.</td>
          </tr>
        </table>
      </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}