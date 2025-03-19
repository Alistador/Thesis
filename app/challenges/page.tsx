// /challenges/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ChallengesClient from "@/components/challenges/ChallengesClient";
import { prisma } from "@/lib/prisma";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import { Challenge, UserStats, TopPerformer, ChallengeType, ChallengeStats } from "@/types/challenges";

export default async function AIChallengesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); // Redirects to login if not authenticated
    return null;
  }

  if (session.user?.active === false) {
    redirect("/verify"); // Redirects inactive users to verification page
    return null;
  }

  // Get user with onboarding progress
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    include: { onboardingProgress: true },
  });

  // Redirect if user has not completed onboarding
  if (!user?.onboardingProgress || !user.onboardingProgress.profileCompleted) {
    redirect("/dashboard/onboarding");
    return null;
  }

  // Fetch challenges with related data
  const dbChallenges = await prisma.challenge.findMany({
    include: {
      challengeTypes: true,
      userStats: true, // This matches the relation name in your Prisma schema
    },
  });

  // Fetch user global stats
  const dbUserGlobalStats = await prisma.userGlobalStats.findUnique({
    where: { userId: user.id },
  });

  // Calculate user's rank if they have stats
  let userRank = null;
  if (dbUserGlobalStats) {
    const betterUsersCount = await prisma.userGlobalStats.count({
      where: {
        challengesWon: {
          gt: dbUserGlobalStats.challengesWon
        }
      }
    });
    userRank = betterUsersCount + 1; // Rank is position in leaderboard (1-indexed)
  }

  // Fetch top performers leaderboard
  const dbLeaderboard = await prisma.userGlobalStats.findMany({
    take: 5,
    orderBy: { challengesWon: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Extract unique challenge types
  const challengeTypes = [...new Set(dbChallenges.flatMap(challenge =>
    challenge.challengeTypes.map(type => type.type)
  ))];

  // Format challenges to match the Challenge interface
  const formattedChallenges: Challenge[] = dbChallenges.map(challenge => {
    // Calculate success rate and total attempts for the challenge
    const totalAttempts = challenge.userStats.reduce((sum, stat) => sum + stat.attempts, 0);
    const totalWins = challenge.userStats.reduce((sum, stat) => sum + stat.wins, 0);
    const successRate = totalAttempts > 0 ? Math.round((totalWins / totalAttempts) * 100) : 0;

    // Format the challenge types to match the ChallengeType interface
    const formattedTypes: ChallengeType[] = challenge.challengeTypes.map(type => ({
      id: type.id,
      type: type.type,
      description: type.description
    }));

    // Create a stats object that matches what the ChallengeClient expects
    const challengeStats: ChallengeStats[] = [{
      successRate: successRate,
      attempts: totalAttempts
    }];

    return {
      id: challenge.id, // Convert string ID to number
      title: challenge.title,
      description: challenge.description,
      starterCode: challenge.starterCode,
      languageId: challenge.languageId,
      difficulty: challenge.difficulty,
      sampleInput: challenge.sampleInput,
      expectedOutput: challenge.expectedOutput,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      isActive: challenge.isActive,
      initialCode: challenge.initialCode,
      solutionCode: challenge.solutionCode,
      challengeTypes: formattedTypes,
      stats: challengeStats,
    };
  });

  // Format user stats to match the UserStats interface
  const formattedUserStats: UserStats | null = dbUserGlobalStats
    ? {
        id: dbUserGlobalStats.id,
        userId: dbUserGlobalStats.userId,
        challengesWon: dbUserGlobalStats.challengesWon,
        totalChallengesAttempted: dbUserGlobalStats.totalChallengesAttempted,
        challengesTied: dbUserGlobalStats.challengesTied,
        codeGolfRating: dbUserGlobalStats.codeGolfRating,
        timeTrialRating: dbUserGlobalStats.timeTrialRating,
        memoryOptRating: dbUserGlobalStats.memoryOptRating,
        debuggingRating: dbUserGlobalStats.debuggingRating,
        updatedAt: dbUserGlobalStats.updatedAt,
      }
    : null;

  // Format leaderboard to match the TopPerformer interface
  const formattedLeaderboard: TopPerformer[] = dbLeaderboard.map(stats => ({
    id: stats.id,
    userId: stats.userId,
    challengesWon: stats.challengesWon,
    user: {
      id: stats.user.id,
      name: stats.user.name,
    },
  }));

  return (
    <UsernameCheckWrapper
      userId={user.id}
      email={user.email as string}
      name={user.name}
    >
      <div className="min-h-screen bg-gray-50">
        <DashboardNavBar email={session.user?.email} userName={user?.name} />
        
        <div className="p-6 pt-24 max-w-7xl mx-auto">
          <ChallengesClient
            session={session}
            initialChallenges={formattedChallenges}
            initialUserStats={formattedUserStats}
            initialTopPerformers={formattedLeaderboard}
            initialChallengeTypes={challengeTypes}
          />
        </div>
      </div>
    </UsernameCheckWrapper>
  );
}