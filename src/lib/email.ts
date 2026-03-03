import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'OrahFinance <noreply@orahfinance.com>';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'OrahFinance';

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send email verification code to user
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} - Verify Your Email`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px;">💰 ${APP_NAME}</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Personal Finance Manager</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #e2e8f0; margin: 0 0 16px;">Verify Your Email</h2>
            <p style="color: #94a3b8; line-height: 1.6;">
              Welcome to ${APP_NAME}! Please enter this code in the app to verify your email address:
            </p>
            <div style="background: #1e293b; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6366f1;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
              This code expires in <strong style="color: #e2e8f0;">15 minutes</strong>. 
              If you didn't create an account, please ignore this email.
            </p>
          </div>
          <div style="padding: 16px 32px; background: #1e293b; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              © 2026 ${APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

/**
 * Send password reset code to user
 */
export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} - Password Reset Code`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px;">🔐 ${APP_NAME}</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Password Reset Request</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #e2e8f0; margin: 0 0 16px;">Reset Your Password</h2>
            <p style="color: #94a3b8; line-height: 1.6;">
              We received a request to reset your password. Enter this code in the app:
            </p>
            <div style="background: #1e293b; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
              This code expires in <strong style="color: #e2e8f0;">15 minutes</strong>. 
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          <div style="padding: 16px 32px; background: #1e293b; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              © 2026 ${APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Password reset email error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionEmail(
  email: string,
  tierName: string,
  priceKES: number,
  endDate: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${APP_NAME} - Subscription Activated!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px;">✅ ${APP_NAME}</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Subscription Confirmed</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #e2e8f0; margin: 0 0 16px;">Welcome to ${tierName}!</h2>
            <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 16px 0;">
              <p style="margin: 4px 0; color: #94a3b8;">Plan: <strong style="color: #10b981;">${tierName}</strong></p>
              <p style="margin: 4px 0; color: #94a3b8;">Amount: <strong style="color: #e2e8f0;">KSh ${priceKES}/month</strong></p>
              <p style="margin: 4px 0; color: #94a3b8;">Valid until: <strong style="color: #e2e8f0;">${endDate}</strong></p>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
              Thank you for subscribing! You now have access to all ${tierName} features.
            </p>
          </div>
          <div style="padding: 16px 32px; background: #1e293b; text-align: center;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
              © 2026 ${APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Subscription email error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send subscription email:', error);
    return false;
  }
}
