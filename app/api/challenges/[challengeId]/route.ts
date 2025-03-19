// app/api/challenges/[challengeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract path parameters from the URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // The path is /api/challenges/[challengeId]
    // So challenge ID should be at index 3
    const challengeIdStr = pathSegments[3];
    // Since Challenge IDs are strings (cuid) in our schema, no conversion needed
    const challengeId = challengeIdStr;
    
    if (!challengeId) {
      return NextResponse.json({ error: 'Invalid challenge ID' }, { status: 400 });
    }
    
    const userId = parseInt(session.user.id as string, 10);
    
    // Get detailed challenge info
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        challengeTypes: true,
        testCases: {
          where: { isHidden: false } // Only include non-hidden test cases
        }
      }
    });
    
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    
    // Get user's past attempts for this challenge
    const userAttempts = await prisma.challengeAttempt.findMany({
      where: {
        userId,
        challengeId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Get the latest 5 attempts
    });
    
    // Get user stats for this challenge
    const userStats = await prisma.userChallengeStats.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      }
    });
    
    // Get the leaderboard for this challenge
    const leaderboard = await prisma.userChallengeStats.findMany({
      where: {
        challengeId
      },
      orderBy: {
        wins: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    return NextResponse.json({
      challenge,
      userAttempts,
      userStats,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching challenge details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge details' },
      { status: 500 }
    );
  }
}