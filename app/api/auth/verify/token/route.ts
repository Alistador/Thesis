// app/api/verify/token/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const requestId = randomUUID().slice(0, 8);
  console.log(
    `[TOKEN-${requestId}] Verification token lookup request received`
  );

  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const pageToken = await prisma.verificationPageToken.findUnique({
      where: {
        token,
        expires: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!pageToken) {
      console.log(`[TOKEN-${requestId}] Invalid or expired token`);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    console.log(
      `[TOKEN-${requestId}] Token exchanged successfully for user ${pageToken.userId}`
    );

    return NextResponse.json({ email: pageToken.user.email });
  } catch (error) {
    console.error(`[TOKEN-${requestId}] Token verification error:`, error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
