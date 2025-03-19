// app/api/journeys/[journeySlug]/levels/[levelId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getLevelWithUserProgress } from '@/lib/journeys/journeyService';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// This is not a type error - this is a workaround for the Next.js params issue
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract path parameters from the URL instead of using context.params directly
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // The path is /api/journeys/[journeySlug]/levels/[levelId]
    // So journey slug should be at index 3 and level ID at index 5
    const journeySlugValue = pathSegments[3];
    const levelIdValue = pathSegments[5];
    
    const userId = parseInt(session.user.id as string, 10);
    const levelIdNum = parseInt(levelIdValue, 10);
    
    // Check if level ID is a valid number
    if (isNaN(levelIdNum)) {
      return NextResponse.json(
        { error: 'Invalid level ID' },
        { status: 400 }
      );
    }
    
    const level = await getLevelWithUserProgress(userId, journeySlugValue, levelIdNum);
    
    if (!level) {
      return NextResponse.json(
        { error: 'Level not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(level);
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level' },
      { status: 500 }
    );
  }
}