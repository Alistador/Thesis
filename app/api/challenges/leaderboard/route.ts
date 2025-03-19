// app/api/challenges/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const challengeType = searchParams.get('type');
    const timeFrame = searchParams.get('timeFrame') || 'all'; // 'all', 'week', 'month'
    
    // Build the date filter
    let dateFilter = {};
    if (timeFrame === 'week') {
      dateFilter = {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (timeFrame === 'month') {
      dateFilter = {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      };
    }
    
    // Get the global leaderboard for all challenge types
    if (!challengeType) {
      const globalLeaderboard = await prisma.userGlobalStats.findMany({
        orderBy: {
          challengesWon: 'desc'
        },
        take: 50,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });
      
      // Get current user's ranking
      const userId = parseInt(session.user.id as string);
      const userRank = await findUserRanking(userId);
      
      return NextResponse.json({
        leaderboard: globalLeaderboard,
        userRank
      });
    }
    
    // Get leaderboard for a specific challenge type
    const challengeTypeObj = await prisma.challengeType.findUnique({
      where: { type: challengeType }
    });
    
    if (!challengeTypeObj) {
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }
    
    // Find all challenges of this type
    const challenges = await prisma.challenge.findMany({
      where: {
        challengeTypes: {
          some: { id: challengeTypeObj.id }
        }
      },
      select: { id: true }
    });
    
    const challengeIds = challenges.map(c => c.id);
    
    // Get the top performers for this challenge type
    const typeLeaderboard = await prisma.userChallengeStats.groupBy({
      by: ['userId'],
      where: {
        challengeId: {
          in: challengeIds
        },
        ...dateFilter
      },
      _sum: {
        wins: true,
        attempts: true
      },
      orderBy: {
        _sum: {
          wins: 'desc'
        }
      },
      take: 50
    });
    
    // Get user details for the leaderboard
    const usersData = await prisma.user.findMany({
      where: {
        id: {
          in: typeLeaderboard.map(entry => entry.userId)
        }
      },
      select: {
        id: true,
        name: true,
      }
    });
    
    // Combine the data
    const formattedLeaderboard = typeLeaderboard.map(entry => {
      const user = usersData.find(u => u.id === entry.userId);
      return {
        userId: entry.userId,
        user,
        wins: entry._sum.wins || 0,
        attempts: entry._sum.attempts || 0,
        winRate: entry._sum.attempts 
          ? Math.round((entry._sum.wins || 0) / entry._sum.attempts * 100) 
          : 0
      };
    });
    
    // Get current user's ranking for this challenge type
    const userId = parseInt(session.user.id as string);
    const userRank = await findUserRankingByType(userId, challengeIds, timeFrame);
    
    return NextResponse.json({
      challengeType: challengeTypeObj.type,
      timeFrame,
      leaderboard: formattedLeaderboard,
      userRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

// Helper function to find user's global ranking
async function findUserRanking(userId: number) {
  const prisma = new PrismaClient();
  
  // Count users with more wins
  const userStats = await prisma.userGlobalStats.findUnique({
    where: { userId }
  });
  
  if (!userStats) {
    return { rank: null, stats: null };
  }
  
  const betterUsers = await prisma.userGlobalStats.count({
    where: {
      challengesWon: { gt: userStats.challengesWon }
    }
  });
  
  return {
    rank: betterUsers + 1, // +1 because rank is 1-indexed
    stats: userStats
  };
}

// Helper function to find user's ranking for a specific challenge type
async function findUserRankingByType(
  userId: number, 
  challengeIds: string[], 
  timeFrame: string
) {
  const prisma = new PrismaClient();
  
  // Build the date filter
  let dateFilter = {};
  if (timeFrame === 'week') {
    dateFilter = {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    };
  } else if (timeFrame === 'month') {
    dateFilter = {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    };
  }
  
  // Get the user's aggregate stats for these challenges
  const userAggStats = await prisma.userChallengeStats.aggregate({
    where: {
      userId,
      challengeId: { in: challengeIds },
      ...dateFilter
    },
    _sum: {
      wins: true,
      attempts: true
    }
  });
  
  // Handle case when the user has no stats or the aggregate operation returns no data
  if (!userAggStats._sum || !userAggStats._sum.wins) {
    return { rank: null, stats: null };
  }
  
  // Count users with more wins
  const userGroups = await prisma.userChallengeStats.groupBy({
    by: ['userId'],
    where: {
      challengeId: { in: challengeIds },
      ...dateFilter
    },
    _sum: {
      wins: true
    },
    having: {
      wins: {
        _sum: {
          gt: userAggStats._sum.wins
        }
      }
    }
  });
  
  return {
    rank: userGroups.length + 1, // +1 because rank is 1-indexed
    stats: {
      wins: userAggStats._sum.wins || 0,
      attempts: userAggStats._sum.attempts || 0,
      winRate: userAggStats._sum.attempts 
        ? Math.round((userAggStats._sum.wins || 0) / userAggStats._sum.attempts * 100) 
        : 0
    }
  };
}