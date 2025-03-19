// app/api/challenges/ai-solution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateAIResponse, generateDynamicAIResponse } from "@/utils/aiChallengeService";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const requestData = await request.json();
    const { challengeId, languageId, difficulty } = requestData;
    
    if (!challengeId || !languageId) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: "challengeId and languageId are required" 
      }, { status: 400 });
    }
    
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
    
    // Define valid skill levels for the AI
    type AISkillLevel = 'beginner' | 'intermediate' | 'expert';
    
    // Map the difficulty level to AI skill level
    let aiSkillLevel: AISkillLevel = 'intermediate'; // Default
    
    // Get the raw difficulty, defaulting to the challenge's difficulty if not provided
    const rawDifficulty = (difficulty || challenge.difficulty || '').toLowerCase();
    
    // Enhanced mapping with more granular difficulty levels
    if (['beginner', 'easy', 'novice', 'entry'].some(level => rawDifficulty.includes(level))) {
      aiSkillLevel = 'beginner';
    } else if (['medium', 'intermediate', 'moderate'].some(level => rawDifficulty.includes(level))) {
      aiSkillLevel = 'intermediate';
    } else if (['expert', 'advanced', 'hard', 'difficult'].some(level => rawDifficulty.includes(level))) {
      aiSkillLevel = 'expert';
    }
    
    // Log the selected AI skill level for debugging
    console.log(`Challenge difficulty: ${challenge.difficulty}, Mapped AI skill level: ${aiSkillLevel}`);
    
    // Use the dynamic AI response generator with skill level
    const aiSolution = await generateDynamicAIResponse(challenge, languageId, aiSkillLevel);
    
    return NextResponse.json(aiSolution);
  } catch (error: any) {
    console.error('Error generating AI solution:', error);
    return NextResponse.json({
      error: "Failed to generate AI solution",
      message: error.message,
      code: "# Couldn't generate solution due to an error"
    }, { status: 500 });
  }
}