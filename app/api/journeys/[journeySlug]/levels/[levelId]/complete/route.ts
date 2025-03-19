// app/api/journeys/[journeySlug]/levels/[levelId]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { completeLevel } from '@/lib/journeys/journeyService';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  context: { params: { journeySlug: string; levelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract path parameters from the URL instead of using context.params directly
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    
    // The path is /api/journeys/[journeySlug]/levels/[levelId]/complete
    // So journey slug should be at index 3 and level ID at index 5
    const journeySlug = pathSegments[3];
    const levelId = pathSegments[5];
    
    const userId = parseInt(session.user.id as string, 10);
    const levelIdNum = parseInt(levelId, 10);
    
    // Parse request body
    const body = await request.json();
    const { submittedCode } = body;
    
    if (!submittedCode) {
      return NextResponse.json(
        { error: 'Submitted code is required' },
        { status: 400 }
      );
    }
    
    // Complete the level
    const levelProgress = await completeLevel(
      userId,
      journeySlug,
      levelIdNum,
      submittedCode
    );
    
    return NextResponse.json({
      success: true,
      levelProgress
    });
  } catch (error) {
    console.error('Error completing level:', error);
    return NextResponse.json(
      { error: 'Failed to complete level' },
      { status: 500 }
    );
  }
}