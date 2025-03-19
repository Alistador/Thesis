// app/api/verify/create-token/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  console.log(
    `[TOKEN-CREATE-${requestId}] Create verification token request received`
  );

  try {
    // Check if the request comes from an authenticated session
    const session = await getServerSession(authOptions);
    let userEmail: string | null = null;

    // Get email from request body or session
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      const body = await req.json();
      userEmail = body.email || null;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete any existing tokens for this user
    await prisma.verificationPageToken.deleteMany({
      where: { userId: user.id },
    });

    // Create a new token
    const token = randomUUID();
    const pageToken = await prisma.verificationPageToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        createdAt: new Date(),
      },
    });

    console.log(
      `[TOKEN-CREATE-${requestId}] Token created for user ${user.id}`
    );

    return NextResponse.json({ token: pageToken.token });
  } catch (error) {
    console.error(`[TOKEN-CREATE-${requestId}] Token creation error:`, error);
    return NextResponse.json(
      { error: "Failed to create verification token" },
      { status: 500 }
    );
  }
}
