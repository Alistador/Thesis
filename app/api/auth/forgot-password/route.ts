import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Constants
const DOMAIN = process.env.DOMAIN || "localhost:3000";
const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";
const RESET_TOKEN_EXPIRY_HOURS = 4;

// Email validation function
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Generate a strong reset token (hash it before storing)
const generateResetToken = async () => {
  const rawToken = randomUUID() + randomUUID();
  const hashedToken = await bcrypt.hash(rawToken, 12); // More secure hash
  return { rawToken, hashedToken };
};

// 🔹 Forgot Password Request Handler (POST)
export async function POST(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[RESET-${requestId}] Password reset request received`);

  try {
    const { email } = await req.json();

    // Validate email input
    if (!email || !isValidEmail(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (!user) {
      console.log(
        `[RESET-${requestId}] No account found for email: ${sanitizedEmail}`
      );
      return NextResponse.json(
        { error: "If an account exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate reset token
    const { rawToken, hashedToken } = await generateResetToken();

    // Delete old reset tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Store the new hashed token in the database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(
          Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
        ),
      },
    });

    console.log(
      `[RESET-${requestId}] Password reset token created for user: ${user.id}`
    );

    // Send email with reset instructions
    const emailApiResponse = await fetch(
      `${PROTOCOL}://${DOMAIN}/api/auth/emailsender`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          template: "reset-password",
          data: {
            name: user.name,
            token: rawToken,
            expiryHours: RESET_TOKEN_EXPIRY_HOURS,
          },
        }),
      }
    );

    if (!emailApiResponse.ok) {
      console.error(`[RESET-${requestId}] Email sending failed`);
      return NextResponse.json(
        { error: "Failed to send password reset email." },
        { status: 500 }
      );
    }

    console.log(`[RESET-${requestId}] Password reset email sent successfully`);

    return NextResponse.json({
      success: true,
      message:
        "If an account exists, a password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(`[RESET-${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
