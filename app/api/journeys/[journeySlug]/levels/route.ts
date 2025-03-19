// app/api/journeys/[journeySlug]/levels/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getJourneyWithUserProgress } from '@/lib/journeys/journeyService';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    
    // The path is /api/journeys/[journeySlug]/levels
    // So journey slug should be at index 3
    const journeySlugValue = pathSegments[3];
    
    // Get the user ID from the session
    const userId = parseInt(session.user.id as string, 10);
    
    // Get all levels with user progress for this journey
    const { levels, progress } = await getJourneyWithUserProgress(userId, journeySlugValue);
    
    if (!levels || levels.length === 0) {
      return NextResponse.json(
        { message: 'No levels found for this journey' },
        { status: 200 }
      );
    }
    
    // Get current level order from progress
    const currentLevelOrder = progress?.currentLevelOrder || 1;
    
    // Transform each level to include status information
    const levelsWithStatus = levels.map(level => {
      // Determine if level has been completed
      const isCompleted = level.levelProgress && 
                           level.levelProgress.length > 0 && 
                           level.levelProgress[0].isCompleted;
      
      // Determine level status for the hex visualization
      let status: "locked" | "completed" | "next" | "available" = "locked";  // Default status
      
      if (isCompleted) {
        status = "completed";
      } else if (level.order === currentLevelOrder) {
        status = "next";
      } else if (level.order === currentLevelOrder + 1) {
        status = "available";
      }
      
      return {
        ...level,
        isCompleted,
        status
      };
    });
    
    return NextResponse.json(levelsWithStatus);
  } catch (error) {
    console.error('Error fetching journey levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journey levels' },
      { status: 500 }
    );
  }
}