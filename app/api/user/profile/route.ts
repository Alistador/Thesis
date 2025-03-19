import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";

// 🔹 PATCH: Update User Profile
export async function PATCH(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[PROFILE-UPDATE-${requestId}] Update request received`);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log(`[PROFILE-UPDATE-${requestId}] Unauthorized access attempt`);
      return NextResponse.json(
        { error: "You must be signed in to update your profile." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Handle ID correctly whether it's a string or number in the database
    const userId = session.user.id;

    // Validate if at least one field is provided
    const updateData: Record<string, any> = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.email) updateData.email = body.email.trim().toLowerCase();
    if (typeof body.active === "boolean") updateData.active = body.active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    // 🔹 Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
      select: { id: true, name: true, email: true, active: true },
    });

    console.log(`[PROFILE-UPDATE-${requestId}] User updated successfully`);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(`[PROFILE-UPDATE-${requestId}] Error:`, error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}

// 🔹 GET: Retrieve User Profile
export async function GET(req: Request) {
  const requestId = randomUUID().slice(0, 8);
  console.log(`[PROFILE-GET-${requestId}] Profile request received`);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log(`[PROFILE-GET-${requestId}] Unauthorized access attempt`);
      return NextResponse.json(
        { error: "You must be signed in to access profile data." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { id: true, name: true, email: true, active: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "User account is deactivated." },
        { status: 403 }
      );
    }

    console.log(`[PROFILE-GET-${requestId}] Profile retrieved successfully`);

    return NextResponse.json({ user });
  } catch (error) {
    console.error(`[PROFILE-GET-${requestId}] Error:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}
