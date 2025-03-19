// lib/journeys/journeyService.ts
import { prisma } from '@/lib/prisma';
import { Journey, Level, LevelProgress, JourneyProgress } from '@prisma/client';

// Types with expanded relationships
type JourneyWithLevels = Journey & {
  levels: Level[];
};

type LevelWithProgress = Level & {
  levelProgress?: LevelProgress[];
};

export async function getJourneys() {
  return await prisma.journey.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
}

export async function getJourneyBySlug(slug: string): Promise<JourneyWithLevels | null> {
  return await prisma.journey.findUnique({
    where: { slug },
    include: {
      levels: {
        orderBy: { order: 'asc' }
      }
    }
  });
}

export async function getLevelsByJourneySlug(slug: string): Promise<Level[]> {
  const journey = await prisma.journey.findUnique({
    where: { slug },
    include: {
      levels: {
        orderBy: { order: 'asc' }
      }
    }
  });
  
  return journey?.levels || [];
}

export async function getLevelById(journeySlug: string, levelId: number): Promise<Level | null> {
  const journey = await prisma.journey.findUnique({
    where: { slug: journeySlug }
  });
  
  if (!journey) return null;
  
  return await prisma.level.findUnique({
    where: { 
      id: levelId,
      journeyId: journey.id
    }
  });
}

export async function getUserJourneyProgress(
    userId: number, 
    journeySlug: string
  ): Promise<JourneyProgress | null> {
    const journey = await prisma.journey.findUnique({
      where: { slug: journeySlug }
    });
    
    if (!journey) return null;
    
    // Find existing progress
    let progress = await prisma.journeyProgress.findUnique({
      where: {
        userId_journeyId: {
          userId,
          journeyId: journey.id
        }
      }
    });
    
    // If no progress exists, create a default progress record
    if (!progress) {
      progress = await prisma.journeyProgress.create({
        data: {
          userId,
          journeyId: journey.id,
          currentLevelOrder: 1,
          isCompleted: false
        }
      });
    }
    
    return progress;
  }

export async function getUserLevelProgress(
  userId: number,
  levelId: number
): Promise<LevelProgress | null> {
  return await prisma.levelProgress.findUnique({
    where: {
      userId_levelId: {
        userId,
        levelId
      }
    }
  });
}

export async function getLevelWithUserProgress(
  userId: number,
  journeySlug: string,
  levelId: number
): Promise<LevelWithProgress | null> {
  const journey = await prisma.journey.findUnique({
    where: { slug: journeySlug }
  });
  
  if (!journey) return null;
  
  return await prisma.level.findUnique({
    where: {
      id: levelId,
      journeyId: journey.id
    },
    include: {
      levelProgress: {
        where: { userId }
      }
    }
  });
}

// Update user progress when completing a level
export async function completeLevel(
  userId: number,
  journeySlug: string,
  levelId: number,
  submittedCode: string
): Promise<LevelProgress> {
  const journey = await prisma.journey.findUnique({
    where: { slug: journeySlug }
  });
  
  if (!journey) {
    throw new Error(`Journey with slug ${journeySlug} not found`);
  }
  
  // Get the completed level
  const completedLevel = await prisma.level.findUnique({
    where: { 
      id: levelId,
      journeyId: journey.id
    }
  });
  
  if (!completedLevel) {
    throw new Error(`Level ${levelId} not found in journey ${journeySlug}`);
  }
  
  // Get the next level in sequence
  const nextLevel = await prisma.level.findFirst({
    where: {
      journeyId: journey.id,
      order: { gt: completedLevel.order }
    },
    orderBy: { order: 'asc' }
  });
  
  // Update level progress
  const levelProgress = await prisma.levelProgress.upsert({
    where: {
      userId_levelId: {
        userId,
        levelId
      }
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      attempts: { increment: 1 },
      lastSubmittedCode: submittedCode
    },
    create: {
      userId,
      levelId,
      isCompleted: true,
      completedAt: new Date(),
      attempts: 1,
      lastSubmittedCode: submittedCode
    }
  });
  
  // Update journey progress
  await prisma.journeyProgress.upsert({
    where: {
      userId_journeyId: {
        userId,
        journeyId: journey.id
      }
    },
    update: {
      // Update current level if there is a next level
      currentLevelOrder: nextLevel ? nextLevel.order : completedLevel.order,
      // Mark journey as completed if this was the last level
      isCompleted: !nextLevel
    },
    create: {
      userId,
      journeyId: journey.id,
      currentLevelOrder: nextLevel ? nextLevel.order : completedLevel.order,
      isCompleted: !nextLevel
    }
  });
  
  return levelProgress;
}

// Get all levels with user progress for a journey
export async function getJourneyWithUserProgress(
  userId: number,
  journeySlug: string
): Promise<{
  journey: Journey | null;
  levels: LevelWithProgress[];
  progress: JourneyProgress | null;
}> {
  const journey = await prisma.journey.findUnique({
    where: { slug: journeySlug }
  });
  
  if (!journey) {
    return { journey: null, levels: [], progress: null };
  }
  
  const levels = await prisma.level.findMany({
    where: { journeyId: journey.id },
    orderBy: { order: 'asc' },
    include: {
      levelProgress: {
        where: { userId }
      }
    }
  });
  
  const progress = await prisma.journeyProgress.findUnique({
    where: {
      userId_journeyId: {
        userId,
        journeyId: journey.id
      }
    }
  });
  
  return { journey, levels, progress };
}