// app/api/journeys/[journeySlug]/route.ts
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
    
    // Extract path parameters from the URL instead of using context.params directly
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // The path is /api/journeys/[journeySlug]
    // So journey slug should be at index 3
    const journeySlugValue = pathSegments[3];
    
    const userId = parseInt(session.user.id as string, 10);
    
    const journeyData = await getJourneyWithUserProgress(userId, journeySlugValue);
    
    if (!journeyData.journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(journeyData);
  } catch (error) {
    console.error('Error fetching journey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journey' },
      { status: 500 }
    );
  }
}