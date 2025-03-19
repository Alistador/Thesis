// /challenges/leaderboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LeaderboardClient from "@/components/challenges/LeaderboardClient";
import { prisma } from "@/lib/prisma";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import { TopPerformer, UserRank } from "@/types/challenges";

export default async function ChallengesLeaderboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); // Redirects to login if not authenticated
  }

  if (session.user?.active === false) {
    redirect("/verify"); // Redirects inactive users to verification page
  }

  // Get user with onboarding progress
  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
    },
    include: {
      onboardingProgress: true,
    },
  });

  // Check if user has completed onboarding
  // If onboardingProgress doesn't exist or profileCompleted is false, redirect to onboarding
  if (!user?.onboardingProgress || !user.onboardingProgress.profileCompleted) {
    redirect("/dashboard/onboarding");
  }

  // Fetch challenge types
  const challenges = await prisma.challenge.findMany({
    include: {
      challengeTypes: true
    }
  });
  
  const challengeTypes = [...new Set(challenges.flatMap(challenge => 
    challenge.challengeTypes.map(type => type.type)
  ))];

  // Fetch leaderboard data using UserGlobalStats
  const dbLeaderboard = await prisma.userGlobalStats.findMany({
    orderBy: {
      challengesWon: 'desc'
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Modified: Format the leaderboard to include user.id to match the TopPerformer interface
  const formattedLeaderboard = dbLeaderboard.map(stats => ({
    id: stats.id,
    userId: stats.userId,
    challengesWon: stats.challengesWon,
    user: {
      id: stats.user.id,  // Include user.id to match the TopPerformer interface
      name: stats.user.name
    }
  })) as TopPerformer[];  // Use type assertion here

  // Get user's rank and stats
  const userStats = dbLeaderboard.find(entry => entry.userId === user.id);
  const userRank: UserRank = {
    rank: dbLeaderboard.findIndex(entry => entry.userId === user.id) + 1,
    stats: userStats ? {
      id: userStats.id,
      userId: userStats.userId,
      challengesWon: userStats.challengesWon,
      totalChallengesAttempted: userStats.totalChallengesAttempted,
      challengesTied: userStats.challengesTied,
      codeGolfRating: userStats.codeGolfRating,
      timeTrialRating: userStats.timeTrialRating,
      memoryOptRating: userStats.memoryOptRating,
      debuggingRating: userStats.debuggingRating
    } : null
  };

  return (
    <UsernameCheckWrapper
      userId={user.id}
      email={user.email as string}
      name={user.name}
    >
      <LeaderboardClient
        session={session}
        initialLeaderboard={formattedLeaderboard}
        initialUserRank={userRank}
        initialChallengeTypes={challengeTypes}
      />
    </UsernameCheckWrapper>
  );
}