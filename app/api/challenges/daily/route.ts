// app/api/challenges/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateAIChallenge } from "@/utils/challengeGenerator";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id as string);
    
    // Check if user already has a daily challenge for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingDailyChallenge = await prisma.dailyChallenge.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        challenge: true
      }
    });

    // If there's an existing challenge, return that instead of creating a new one
    if (existingDailyChallenge) {
      return NextResponse.json({ 
        challengeId: existingDailyChallenge.challenge.id,
        message: 'Returning existing daily challenge' 
      });
    }
    
    // Get user's skill level
    const userStats = await prisma.userGlobalStats.findUnique({
      where: { userId }
    });

    // Determine difficulty based on user stats
    let difficulty = 'medium'; // Default difficulty
    
    if (userStats) {
      const totalChallengesAttempted = userStats.totalChallengesAttempted || 0;
      const challengesWon = userStats.challengesWon || 0;
      const winRate = totalChallengesAttempted > 0 
        ? (challengesWon / totalChallengesAttempted) 
        : 0;
      
      if (totalChallengesAttempted < 5) {
        difficulty = 'easy';
      } else if (winRate < 0.3) {
        difficulty = 'easy';
      } else if (winRate < 0.5) {
        difficulty = 'medium';
      } else if (winRate < 0.8) {
        difficulty = 'hard';
      } else {
        difficulty = 'expert';
      }
    }
    
    // Generate random challenge type
    const challengeTypes = ['code_golf', 'time_trial', 'memory_optimization'];
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    
    // Get the user's preferred language - we need to look at CodeSubmission instead
    // since ChallengeAttempt doesn't have languageId
    let languageId = 28; // Default to Python
    
    // Try to find user's preferred language from their most recent code submission
    const recentSubmission = await prisma.codeSubmission.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (recentSubmission && recentSubmission.languageId) {
      languageId = recentSubmission.languageId;
    }
    
    // Alternatively, check if the user has a preferred language in their profile
    if (languageId === 28) { // Still default
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true }
      });
      
      // Map preferredLanguage string to languageId if available
      if (user?.preferredLanguage) {
        const languageMap: Record<string, number> = {
          'python': 28,
          'javascript': 63,
          'cpp': 54,
          'java': 62,
          'c': 50
        };
        
        languageId = languageMap[user.preferredLanguage.toLowerCase()] || languageId;
      }
    }
    
    // Generate the challenge
    const aiChallenge = await generateAIChallenge(difficulty, randomType, languageId);
    
    // Find the challenge type ID (or create it if it doesn't exist)
    let challengeTypeRecord = await prisma.challengeType.findUnique({
      where: { type: randomType }
    });
    
    if (!challengeTypeRecord) {
      challengeTypeRecord = await prisma.challengeType.create({
        data: {
          type: randomType,
          description: `AI-generated ${randomType} challenge`
        }
      });
    }
    
    // Store the challenge in the database
    const challenge = await prisma.challenge.create({
      data: {
        title: aiChallenge.title,
        description: aiChallenge.description,
        difficulty,
        starterCode: aiChallenge.starterCode,
        initialCode: aiChallenge.starterCode,
        sampleInput: aiChallenge.sampleInput,
        expectedOutput: aiChallenge.expectedOutput,
        timeLimit: 5000, // 5 seconds
        memoryLimit: 256, // 256 MB
        isActive: true,
        languageId,
        source: 'daily-ai',
        solutionCode: aiChallenge.solutionCode,
        challengeTypes: {
          connect: [{ id: challengeTypeRecord.id }] // Connect existing challenge type
        },
        testCases: {
          create: aiChallenge.testCases.map(testCase => ({
            input: testCase.input,
            expectedOutput: testCase.output,
            isHidden: false
          }))
        }
      }
    });
    
    // Create the daily challenge record
    await prisma.dailyChallenge.create({
      data: {
        userId,
        challengeId: challenge.id,
      }
    });
    
    return NextResponse.json({ 
      challengeId: challenge.id,
      message: 'Daily challenge generated successfully' 
    });
  } catch (error: any) {
    console.error('Error generating daily challenge:', error);
    return NextResponse.json({
      error: "Failed to generate daily challenge",
      message: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id as string);
    
    // Get user's daily challenge history
    const dailyChallenges = await prisma.dailyChallenge.findMany({
      where: { userId },
      include: {
        challenge: {
          include: {
            challengeTypes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 30 // Last 30 days
    });
    
    return NextResponse.json({ dailyChallenges });
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily challenges' },
      { status: 500 }
    );
  }
}