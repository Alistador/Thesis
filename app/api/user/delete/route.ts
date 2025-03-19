import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// 🔹 Handle User Account Deletion (DELETE)
export async function DELETE(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(
    `[DELETE-ACCOUNT-${requestId}] Account deletion request received`
  );

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log(
        `[DELETE-ACCOUNT-${requestId}] Unauthorized deletion attempt`
      );
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 🔹 Delete all user-related data in a transaction
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
      prisma.activateToken.deleteMany({ where: { userId } }),
      // With JWT strategy, we should delete accounts linked to OAuth providers
      prisma.account.deleteMany({ where: { userId } }),
      // We still delete sessions from database as they might exist from before the strategy change
      prisma.session.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    console.log(`[DELETE-ACCOUNT-${requestId}] Account deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    console.error(`[DELETE-ACCOUNT-${requestId}] Error:`, error);
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 }
    );
  }
}
