// app/api/challenges/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { submitCode } from "@/utils/judge0Service";
import { generateAIResponse } from "@/utils/aiChallengeService";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all available challenges
    const challenges = await prisma.challenge.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        difficulty: 'asc'
      },
      include: {
        challengeTypes: true
      }
    });
    
    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const requestData = await request.json();
    const { challengeId, code, languageId } = requestData;
    
    if (!challengeId || !code || !languageId) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: "challengeId, code, and languageId are required" 
      }, { status: 400 });
    }
    
    const userId = parseInt(session.user.id as string);
    
    // Get the challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId.toString() },
      include: {
        challengeTypes: true,
        testCases: true
      }
    });
    
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }
    
    // Submit user code to Judge0
    const userResult = await submitCode(code, languageId, challenge.sampleInput || "");
    
    if (!userResult) {
      return NextResponse.json({ 
        error: "Code execution failed", 
        details: "No response from code execution service"
      }, { status: 500 });
    }
    
    // Check if user code had execution errors
    const userExecutionError = userResult.status && userResult.status.id !== 3 
      ? {
          statusId: userResult.status.id,
          description: userResult.status.description,
          message: userResult.message || null,
          stderr: userResult.stderr || null,
        }
      : null;
      
    // Determine if user solution is correct
    const userCorrect = !userExecutionError && 
                      userResult.stdout?.trim() === challenge.expectedOutput?.trim();
                      
    // Get user metrics regardless of correctness
    let userMetrics = {
      executionTime: userResult.time ? parseFloat(userResult.time) * 1000 : null,
      memory: userResult.memory ? parseInt(userResult.memory.toString()) : null,
      codeLength: code.length,
      correct: userCorrect
    };
    
    // Get AI solution
    let aiSolution;
    let aiMetrics;
    let winner = "user"; // Default to user if AI fails
    
    try {
      // Get AI solution for the same challenge
      aiSolution = await generateAIResponse(challenge, languageId);
      
      // Set AI metrics
      aiMetrics = {
        executionTime: aiSolution.executionTime,
        memory: aiSolution.memory,
        codeLength: aiSolution.code.length,
        correct: aiSolution.correct
      };
      
      // Only determine winner if user code executed successfully
      if (!userExecutionError) {
        winner = determineWinner(challenge.challengeTypes[0].type, userMetrics, aiMetrics);
      } else {
        winner = "ai"; // AI wins if user code had execution errors
      }
    } catch (aiError) {
      console.error("Error generating AI solution:", aiError);
      
      // Use fallback AI metrics if AI solution generation failed
      aiSolution = {
        code: "# AI solution generation failed",
        executionTime: null,
        memory: null,
        correct: false,
        explanation: "Failed to generate AI solution"
      };
      
      aiMetrics = {
        executionTime: null,
        memory: null,
        codeLength: aiSolution.code.length,
        correct: false
      };
      
      // If both failed, it's a tie
      winner = userCorrect ? "user" : "tie";
    }
    
    // Log the challenge attempt
    const attempt = await prisma.challengeAttempt.create({
      data: {
        userId,
        challengeId: challenge.id.toString(),
        userCode: code,
        aiCode: aiSolution.code,
        userExecutionTime: userMetrics.executionTime,
        userMemory: userMetrics.memory,
        aiExecutionTime: aiMetrics.executionTime,
        aiMemory: aiMetrics.memory,
        userCorrect: userMetrics.correct,
        aiCorrect: aiMetrics.correct,
        winner: winner
      }
    });
    
    // Update user stats (only count successful runs)
    if (!userExecutionError) {
      await updateUserStats(userId, challenge.id, winner);
    }
    
    return NextResponse.json({
      attempt: attempt,
      userMetrics,
      aiMetrics,
      winner,
      userExecutionError,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.challengeTypes[0].type,
        difficulty: challenge.difficulty
      }
    });
  } catch (error: any) {
    console.error('Error processing challenge:', error);
    return NextResponse.json({
      error: "Failed to process challenge",
      message: error.message
    }, { status: 500 });
  }
}

// Helper function to determine winner based on challenge type
function determineWinner(
  challengeType: string, 
  userMetrics: any, 
  aiMetrics: any
): "user" | "ai" | "tie" {
  // Both solutions must be correct to be considered
  if (!userMetrics.correct && !aiMetrics.correct) return "tie";
  if (!userMetrics.correct) return "ai";
  if (!aiMetrics.correct) return "user";
  
  switch (challengeType) {
    case "code_golf":
      // Shortest code wins
      if (userMetrics.codeLength < aiMetrics.codeLength) return "user";
      if (userMetrics.codeLength > aiMetrics.codeLength) return "ai";
      return "tie";
      
    case "time_trial":
      // Fastest execution wins
      if (userMetrics.executionTime < aiMetrics.executionTime) return "user";
      if (userMetrics.executionTime > aiMetrics.executionTime) return "ai";
      return "tie";
      
    case "memory_optimization":
      // Least memory usage wins
      if (userMetrics.memory < aiMetrics.memory) return "user";
      if (userMetrics.memory > aiMetrics.memory) return "ai";
      return "tie";
      
    default:
      // Default to time trial
      if (userMetrics.executionTime < aiMetrics.executionTime) return "user";
      if (userMetrics.executionTime > aiMetrics.executionTime) return "ai";
      return "tie";
  }
}

// Helper function to update user statistics
async function updateUserStats(userId: number, challengeId: string, winner: string) {
  try {
    // Get or create user challenge stats
    const userStats = await prisma.userChallengeStats.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      },
      update: {
        attempts: { increment: 1 },
        wins: winner === "user" ? { increment: 1 } : undefined,
        ties: winner === "tie" ? { increment: 1 } : undefined
      },
      create: {
        userId,
        challengeId,
        attempts: 1,
        wins: winner === "user" ? 1 : 0,
        ties: winner === "tie" ? 1 : 0
      }
    });
    
    // Update global user stats
    await prisma.userGlobalStats.upsert({
      where: { userId },
      update: {
        totalChallengesAttempted: { increment: 1 },
        challengesWon: winner === "user" ? { increment: 1 } : undefined,
        challengesTied: winner === "tie" ? { increment: 1 } : undefined
      },
      create: {
        userId,
        totalChallengesAttempted: 1,
        challengesWon: winner === "user" ? 1 : 0,
        challengesTied: winner === "tie" ? 1 : 0
      }
    });
    
    return userStats;
  } catch (error) {
    console.error("Error updating user stats:", error);
    // Don't throw error, just log it
    return null;
  }
}