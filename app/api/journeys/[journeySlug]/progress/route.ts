// app/api/journeys/[journeySlug]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserJourneyProgress } from '@/lib/journeys/journeyService';
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
    
    // The path is /api/journeys/[journeySlug]/progress
    // So journey slug should be at index 3
    const journeySlugValue = pathSegments[3];
    
    // Get the user ID from the session
    const userId = parseInt(session.user.id as string, 10);
    
    // Get the user's progress for this journey using the updated service function
    // This will create a default progress if none exists
    const progress = await getUserJourneyProgress(userId, journeySlugValue);
    
    if (!progress) {
      // This would only happen if the journey itself wasn't found
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journey progress' },
      { status: 500 }
    );
  }
}