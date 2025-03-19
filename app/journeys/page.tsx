import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import JourneyContent from "@/components/journeys/JourneyContent";
import { getJourneyIcon } from "@/lib/journeyIcons";

import { IconType } from "react-icons";

export default async function JourneyPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");
  if (session.user?.active === false) redirect("/verify");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    include: { onboardingProgress: true },
  });

  if (!user?.onboardingProgress?.profileCompleted) redirect("/dashboard/onboarding");

  // Fetch journeys with progress
  const journeysData = await prisma.journey.findMany({
    include: {
      journeyProgress: { where: { userId: user.id } },
      levels: { select: { id: true } },
      _count: { select: { journeyProgress: true } },
    },
  });

  // Transform data
  const journeys = journeysData.map((journey) => {
    const iconData = getJourneyIcon(journey.slug);
    const userProgress = journey.journeyProgress[0];
    const totalLevels = journey.levels.length;
    const completedLevels = userProgress ? userProgress.currentLevelOrder - 1 : 0;
    const completionPercentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  
    return {
      id: journey.slug,
      name: journey.title,
      description: journey.description,
      coders: journey._count.journeyProgress,
      completionPercentage,
      isEnrolled: journey.journeyProgress.length > 0,
      difficulty: journey.difficultyLevel ?? undefined,
      iconName: journey.icon || "default",  // Pass only the name, NOT the function
      iconColor: iconData.color,
      bgColor: iconData.bgColor,
    };
  });

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavBar email={user?.email} userName={displayName} />
      <JourneyContent journeys={journeys} displayName={displayName} />
    </div>
  );
}
