import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendPasswordResetEmail } from '@/lib/email';

// POST - Request password reset code
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists (don't reveal if email exists or not for security)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json(
        { message: 'If an account with this email exists, a reset code has been sent.' },
        { status: 200 }
      );
    }

    // Rate limiting: Check if a code was sent in the last 60 seconds
    const recentCode = await prisma.passwordReset.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentCode) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting a new code' },
        { status: 429 }
      );
    }

    // Generate code and save to DB
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordReset.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Send email (don't fail the request if email service is not configured)
    const sent = await sendPasswordResetEmail(email, code);

    if (!sent) {
      console.warn('Password reset email failed to send for:', email, '- Code saved to DB');
    }

    return NextResponse.json(
      { message: 'If an account with this email exists, a reset code has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT - Verify code and reset password
export async function PUT(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the latest unused reset code for this email
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'No valid reset code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (resetRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Check code
    if (resetRecord.code !== code) {
      // Increment attempts
      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json(
        { error: `Invalid code. ${4 - resetRecord.attempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // Mark code as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Password reset successfully! You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
