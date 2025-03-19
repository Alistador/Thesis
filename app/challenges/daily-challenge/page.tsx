// challenges/daily-challenge/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import DailyChallengeClient from "@/components/challenges/DailyChallengesClient";

export default async function DailyChallengePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/"); // Redirects to login if not authenticated
  }

  if (session.user?.active === false) {
    redirect("/verify"); // Redirects inactive users to verification page
  }

  // Get user with onboarding progress
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    include: { onboardingProgress: true },
  });

  // Redirect if user has not completed onboarding
  if (!user?.onboardingProgress || !user.onboardingProgress.profileCompleted) {
    redirect("/dashboard/onboarding");
  }

  // Check if user already has a daily challenge for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDailyChallenge = await prisma.dailyChallenge.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      challenge: true
    }
  });

  return (
    <UsernameCheckWrapper
      userId={user.id}
      email={user.email as string}
      name={user.name}
    >
      <div className="min-h-screen bg-gray-50">
        <DashboardNavBar email={session.user?.email} userName={user?.name} />
        
        <div className="p-6 pt-24 max-w-7xl mx-auto">
          <DailyChallengeClient 
            session={session}
            existingChallengeId={existingDailyChallenge?.challenge?.id} 
            lastAttemptedAt={existingDailyChallenge?.updatedAt}
          />
        </div>
      </div>
    </UsernameCheckWrapper>
  );
}