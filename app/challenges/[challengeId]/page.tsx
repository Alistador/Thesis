// /challenges/[challengeId]/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ChallengeDetailClient from "@/components/challenges/ChallengeDetailClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import { 
  Challenge, 
  ChallengeAttempt, 
  TopPerformer, 
  Language, 
  ChallengeTestCase, 
  User 
} from "@/types/challenges";

interface PageParams {
  params: {
    challengeId: string;
  };
}

export default async function ChallengeDetailPage({ params }: PageParams) {
    
  const resolvedParams = await params;
  const { challengeId } = resolvedParams as { challengeId: string };
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

  // Fetch challenge details
  const dbChallenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId
    },
    include: {
      challengeTypes: true,
      testCases: true,
    }
  });

  if (!dbChallenge) {
    notFound();
  }

  // Format challenge to match the Challenge interface
  // Convert string id to number if necessary for Challenge type
  const challenge: Challenge & { testCases: ChallengeTestCase[] } = {
    id: dbChallenge.id, // Convert string ID to number
    title: dbChallenge.title,
    description: dbChallenge.description,
    difficulty: dbChallenge.difficulty,
    starterCode: dbChallenge.starterCode,
    initialCode: dbChallenge.initialCode,
    sampleInput: dbChallenge.sampleInput,
    expectedOutput: dbChallenge.expectedOutput,
    solutionCode: dbChallenge.solutionCode,
    languageId: dbChallenge.languageId,
    timeLimit: dbChallenge.timeLimit,
    memoryLimit: dbChallenge.memoryLimit,
    isActive: dbChallenge.isActive,
    challengeTypes: dbChallenge.challengeTypes.map(type => ({
      id: type.id,
      type: type.type,
      description: type.description || ''
    })),
    testCases: dbChallenge.testCases.map(testCase => ({
      id: testCase.id,
      challengeId: testCase.challengeId,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      isHidden: testCase.isHidden
    }))
  };

  // Fetch user attempts for this challenge
  const dbUserAttempts = await prisma.challengeAttempt.findMany({
    where: {
      challengeId: challengeId,
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Format attempts to match the ChallengeAttempt interface
  const userAttempts: ChallengeAttempt[] = dbUserAttempts.map(attempt => ({
    id: attempt.id,
    createdAt: attempt.createdAt,
    userCode: attempt.userCode || '',
    aiCode: attempt.aiCode || '',
    userExecutionTime: attempt.userExecutionTime,
    userMemory: attempt.userMemory,
    aiExecutionTime: attempt.aiExecutionTime,
    aiMemory: attempt.aiMemory,
    userCorrect: attempt.userCorrect,
    aiCorrect: attempt.aiCorrect,
    winner: attempt.winner,
    userId: attempt.userId,
    challengeId: attempt.challengeId
  }));

  // Fetch global stats for users who attempted this challenge
  const dbLeaderboard = await prisma.userGlobalStats.findMany({
    where: {
      user: {
        challengeAttempts: {
          some: {
            challengeId: challengeId
          }
        }
      }
    },
    include: {
      user: {
        select: {
          id: true, // Make sure to include the user ID
          name: true
        }
      }
    },
    orderBy: {
      challengesWon: 'desc'
    },
    take: 10
  });
  
  // Format leaderboard to match the TopPerformer interface
  const leaderboard: TopPerformer[] = dbLeaderboard.map(stats => ({
    id: stats.id,
    userId: stats.userId,
    challengesWon: stats.challengesWon,
    user: {
      id: stats.user.id, // Include the user ID
      name: stats.user.name || ''
    }
  }));

  // Fetch available languages
  const languagesResponse = await fetch(`${process.env.API_URL}/code/languages`).then(res => 
    res.ok ? res.json() : []
  ).catch(() => []);
  
  // Format languages to match the Language interface
  const languages: Language[] = languagesResponse.map((lang: any) => ({
    id: lang.id,
    name: lang.name || '',
    version: lang.version || ''
  }));

  return (
    <UsernameCheckWrapper
      userId={user.id}
      email={user.email}
      name={user.name}
    >
      <ChallengeDetailClient
        session={session}
        challenge={challenge}
        userAttempts={userAttempts}
        leaderboard={leaderboard}
        languages={languages}
      />
    </UsernameCheckWrapper>
  );
}