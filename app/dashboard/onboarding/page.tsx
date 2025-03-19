import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/onboarding/OnboardingHeader";
import SequentialOnboarding from "@/components/onboarding/SequentialOnboarding";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import { prisma } from "@/lib/prisma";

export default async function DashboardOnboarding() {
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

  // Create onboarding progress record if it doesn't exist yet
  if (!user?.onboardingProgress) {
    await prisma.userOnboardingProgress.create({
      data: {
        userId: user?.id as number,
      },
    });
  }

  // Re-fetch to ensure we have the progress data
  const userWithProgress = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
    },
    include: {
      onboardingProgress: true,
    },
  });

  const progress = userWithProgress?.onboardingProgress || {
    profileCompleted: false,
    tutorialCompleted: false,
    firstChallengeCompleted: false,
  };

  // IMPORTANT: Remove the automatic redirect to dashboard
  // This was causing users to be redirected after step 3 before completing all 5 steps
  // The redirect will now be handled by the SequentialOnboarding component after all steps are completed

  return (
    <UsernameCheckWrapper
      userId={user?.id as number}
      email={user?.email as string}
      name={user?.name}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <DashboardHeader email={session.user?.email} userName={user?.name} />

          <div className="mt-8">
            <SequentialOnboarding
              userId={user?.id as number}
              initialProgress={progress}
            />
          </div>
        </div>
      </div>
    </UsernameCheckWrapper>
  );
}
