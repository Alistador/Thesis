import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcrypt";
import { randomUUID } from "crypto";

// Password Validation Function
const validatePassword = (password: string, confirmPassword: string) => {
  if (!password || !confirmPassword) {
    return "Please fill in all required fields.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null; // No errors
};

// Password Reset Handler (POST)
export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[RESET-${requestId}] Password reset request received`);

  try {
    // Await params properly
    const { params } = context;
    const resolvedParams = await params;
    const token = resolvedParams?.token;

    if (!token) {
      return NextResponse.json({ error: "Token is missing." }, { status: 400 });
    }

    const formData = await req.formData();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm") as string;

    // Validate Password Input
    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Find all unexpired and unused tokens
    const activeTokens = await prisma.passwordResetToken.findMany({
      where: {
        resetAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check each token to find a match
    let matchedToken = null;
    let matchedUser = null;

    for (const resetToken of activeTokens) {
      const isValidToken = await compare(token, resetToken.token);
      if (isValidToken) {
        matchedToken = resetToken;
        break;
      }
    }

    if (!matchedToken) {
      return NextResponse.json(
        { error: "Invalid or expired token. Please request a new reset." },
        { status: 400 }
      );
    }

    // Retrieve associated user
    const user = await prisma.user.findUnique({
      where: { id: matchedToken.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Encrypt the new password
    const hashedPassword = await hash(password, 12);

    // Update Password & Invalidate Token using Transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: matchedToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { resetAt: new Date() }, // Mark token as used
      }),
    ]);

    console.log(
      `[RESET-${requestId}] Password reset successful for user: ${user.id}`
    );

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error(`[RESET-${requestId}] Password reset error:`, error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
