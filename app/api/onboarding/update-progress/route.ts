// app/api/onboarding/update-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to update progress" },
      { status: 401 }
    );
  }

  try {
    const { userId, step, completed } = await request.json();

    // Verify the user is updating their own progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { onboardingProgress: true },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create progress record if it doesn't exist
    if (!user.onboardingProgress) {
      await prisma.userOnboardingProgress.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Update the specific step
    const updateData: Record<string, boolean> = {};

    switch (step) {
      case "profile":
        updateData.profileCompleted = completed;
        break;
      case "tutorial":
        updateData.tutorialCompleted = completed;
        break;
      case "challenge":
        updateData.firstChallengeCompleted = completed;
        break;
      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Update the progress
    await prisma.userOnboardingProgress.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating onboarding progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
