// app/api/user/update-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to update your username" },
      { status: 401 }
    );
  }

  try {
    const { userId, username } = await request.json();

    // Validate the username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "A valid username is required" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 2 and 30 characters" },
        { status: 400 }
      );
    }

    // Verify the user is updating their own profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the user's name
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: username,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}
