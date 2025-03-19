// app/api/onboarding/update-source/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to update preferences" },
      { status: 401 }
    );
  }

  try {
    const { userId, source } = await request.json();

    // Verify the user is updating their own progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update user with source information
    // Note: You'll need to add a 'referralSource' field to your User model
    // This can be done by adding it to your Prisma schema and running a migration
    await prisma.user.update({
      where: { id: userId },
      data: {
        referralSource: source,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating source preference:", error);
    return NextResponse.json(
      { error: "Failed to update preference" },
      { status: 500 }
    );
  }
}
