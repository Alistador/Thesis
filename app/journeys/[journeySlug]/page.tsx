// app/journeys/[journeySlug]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import IndividualJourneysContent from "@/components/journeys/IndividualJourneysContent";

// Types for journey data
interface Journey {
  id: number;
  title: string;
  description: string;
  slug: string;
  icon: string;
  difficultyLevel: string;
  isActive: boolean;
  order: number;
}

interface JourneyProgress {
  userId: number;
  journeyId: number;
  currentLevelOrder: number;
  isCompleted: boolean;
}

interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string;
  expectedOutput: string;
  solutionCode: string;
  hints: string[] | string;
  order: number;
  journeyId: number;
  xpReward: number;
  testCases: any[] | string;
  isCompleted?: boolean;
  levelProgress?: any[];
}

// Fetch journey data for a specific slug
async function getJourneyData(slug: string, userId: number): Promise<{
  journey?: Journey;
  progress?: JourneyProgress;
  levels?: Level[];
  error?: string;
}> {
  try {
    // Find the journey by slug
    const journey = await prisma.journey.findUnique({
      where: { slug },
    });

    if (!journey) {
      return { error: "Journey not found" };
    }

    // Find the user's progress for this journey
    const progress = await prisma.journeyProgress.findUnique({
      where: {
        userId_journeyId: {
          userId,
          journeyId: journey.id,
        },
      },
    });

    // Get levels for this journey
    const levels = await prisma.level.findMany({
      where: { journeyId: journey.id },
      orderBy: { order: 'asc' },
      include: {
        levelProgress: {
          where: { userId },
        },
      },
    });

    // Process levels to include completion status
    const processedLevels = levels.map(level => ({
      ...level,
      isCompleted: level.levelProgress.length > 0 ? level.levelProgress[0].isCompleted : false,
      hints: typeof level.hints === 'string' ? JSON.parse(level.hints) : level.hints,
      testCases: typeof level.testCases === 'string' ? JSON.parse(level.testCases) : level.testCases,
    }));

    return {
      journey: journey as Journey,
      progress: progress as JourneyProgress,
      levels: processedLevels as Level[],
    };
  } catch (error) {
    console.error("Error fetching journey data:", error);
    return { error: "Failed to fetch journey data" };
  }
}

export default async function JourneysPage({ params }: { params: { journeySlug: string } }) {
    const { journeySlug } = await Promise.resolve(params);

    const session = await getServerSession(authOptions);
  
  // Authentication checks
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
  });
  
  if (!user) {
    redirect("/"); // Redirect if user not found
  }
  
  // Fetch journey data for this slug and user
  const journeyData = await getJourneyData(journeySlug, user.id);
  
  // Handle errors or redirect if journey not found
  if (journeyData.error === "Journey not found") {
    redirect("/journeys");
  }
  
  // Ensure we have properly typed data to pass to the client component
  const journey = journeyData.journey || null;
  const progress = journeyData.progress || null;
  const levels = journeyData.levels || [];
  const error = journeyData.error || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar - server rendered */}
      <DashboardNavBar 
        email={user.email}
        userName={user.name} 
      />
      
      {/* Client component for interactive journey UI */}
      <IndividualJourneysContent 
        user={user}
        journeySlug={journeySlug}
        initialJourney={journey}
        initialProgress={progress}
        initialLevels={levels}
        error={error}
      />
    </div>
  );
}