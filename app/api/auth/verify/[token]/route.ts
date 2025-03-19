import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

// Handle Account Activation (GET)
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[ACTIVATE-${requestId}] Account activation request received`);

  try {
    // Extract token from route params
    const { token } = await params;

    if (!token) {
      console.log(`[ACTIVATE-${requestId}] Invalid token parameter`);
      return redirect("/verify/error");
    }

    // Find user and unexpired activation token
    const activationToken = await prisma.activateToken.findFirst({
      where: {
        token,
        activatedAt: null,
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours expiry
        },
      },
      include: { user: true },
    });

    if (!activationToken || !activationToken.user) {
      console.log(`[ACTIVATE-${requestId}] Invalid or expired token`);
      return redirect("/verify/error"); // Redirect to error page
    }

    const { user } = activationToken;

    // Ensure the user isn't already activated
    if (user.active) {
      console.log(`[ACTIVATE-${requestId}] User already active`);
      return redirect("/verify/success");
    }

    // Use a transaction to activate user and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { active: true },
      }),
      prisma.activateToken.update({
        where: { id: activationToken.id },
        data: { activatedAt: new Date() },
      }),
      // Clean up any verification page tokens for this user
      prisma.verificationPageToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    console.log(`[ACTIVATE-${requestId}] User activated successfully`);

    // Create a success token to avoid showing user information in URL
    const successToken = randomUUID();

    // Store a short-lived success token
    await prisma.verificationPageToken.create({
      data: {
        token: successToken,
        userId: user.id,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minute expiry
        createdAt: new Date(),
      },
    });

    // Return the redirect response with success token
    return redirect(`/verify/success?token=${successToken}`);
  } catch (error) {
    // Only catch real errors, not NEXT_REDIRECT errors
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // Let Next.js handle the redirect
      throw error;
    }

    console.error(`[ACTIVATE-${requestId}] Activation error:`, error);
    return redirect("/verify/error");
  }
}
