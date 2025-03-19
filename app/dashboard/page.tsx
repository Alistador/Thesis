// dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import UsernameCheckWrapper from "@/components/user/UsernameCheckWrapper";
import { prisma } from "@/lib/prisma"; // Import using named export

export default async function DashboardGetStarted() {
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

  return (
    <UsernameCheckWrapper
      userId={user?.id as number}
      email={user?.email as string}
      name={user?.name}
    >
      <div className="min-h-screen bg-gray-50">
        <DashboardNavBar email={session.user?.email} userName={user?.name} />

        <div className="p-6 pt-24 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Welcome to Your Dashboard
          </h1>

          {/* Main dashboard content goes here */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700">
              This is your personalized dashboard. You've completed the initial
              setup!
            </p>
          </div>
        </div>
      </div>
    </UsernameCheckWrapper>
  );
}
