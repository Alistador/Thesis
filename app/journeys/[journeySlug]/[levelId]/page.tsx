// app/journeys/[journeySlug]/[levelId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNavBar from "@/components/dashboard/DashboardNavBar";
import LevelContentClient from "@/components/journeys/LevelContentClient";
import { LevelData } from "@/types/levelTypes";

// Extended Level type with progress information
interface LevelWithProgress extends Omit<LevelData, 'hints' | 'testCases'> {
  order: number;
  journeyId: number;
  hints: string[] | string | any;
  testCases: any[] | string | any;
  isCompleted?: boolean;
  levelProgress?: Array<{
    id?: number;
    userId?: number;
    levelId?: number;
    isCompleted: boolean;
    completedAt?: Date;
    lastSubmittedCode?: string;
  }>;
}

// Journey Progress type
interface JourneyProgress {
  userId: number;
  journeyId: number;
  currentLevelOrder: number;
  isCompleted: boolean;
}

// Function to check if user has access to this level
function checkLevelAccess(level: LevelWithProgress, progress: JourneyProgress): boolean {
  if (!level || !progress) return false;
  
  // Check if level order is less than or equal to current progress
  if (level.order <= progress.currentLevelOrder) {
    return true;
  }
  
  // All other levels (future levels) are not accessible
  return false;
}

// Fetch level and journey progress data
async function getLevelData(journeySlug: string, levelId: number, userId: number) {
    try {
      // Get the journey first to verify it exists and get its ID
      const journey = await prisma.journey.findUnique({
        where: { slug: journeySlug },
      });
  
      if (!journey) {
        return { error: "Journey not found" };
      }
  
      // Get the user's progress for this journey
      let journeyProgress = await prisma.journeyProgress.findUnique({
        where: {
          userId_journeyId: {
            userId,
            journeyId: journey.id,
          },
        },
      });
  
      // If no progress exists, create a default progress entry for this user
      if (!journeyProgress) {
        // Create default progress entry for the user
        journeyProgress = await prisma.journeyProgress.create({
          data: {
            userId,
            journeyId: journey.id,
            currentLevelOrder: 1,
            isCompleted: false,
          },
        });
      }
  
      // Get the level data
      const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: {
          levelProgress: {
            where: { userId },
          },
        },
      });
  
      if (!level) {
        return { error: "Level not found" };
      }
  
      // Check if this level belongs to the requested journey
      if (level.journeyId !== journey.id) {
        return { error: "Level does not belong to this journey" };
      }
  
      // Check if user has access to this level
      const hasAccess = checkLevelAccess(level as LevelWithProgress, journeyProgress);
  
      if (!hasAccess) {
        return { error: "accessDenied", journeyId: journey.id };
      }
  
      // Format level data with proper type handling
      const formattedLevel: LevelWithProgress = {
        ...level,
        hints: typeof level.hints === 'string' ? JSON.parse(level.hints) : level.hints,
        testCases: typeof level.testCases === 'string' ? JSON.parse(level.testCases) : level.testCases,
        isCompleted: level.levelProgress.length > 0 ? level.levelProgress[0].isCompleted : false,
      } as unknown as LevelWithProgress;
  
      return {
        level: formattedLevel,
        journeyProgress,
        journeyId: journey.id,
      };
    } catch (error) {
      console.error("Error fetching level data:", error);
      return { error: "Failed to fetch level data" };
    }
  }

// CORRECT NEXT.JS APP ROUTER PAGE COMPONENT PATTERN
// ------------------------------------------------
export default async function JourneyLevelPage({ 
  params 
}: { 
  params: { journeySlug: string; levelId: string }
}) {
  // Use the params object as is, just don't destructure it synchronously
  const { journeySlug, levelId } = await Promise.resolve(params);
  const levelIdNumber = parseInt(levelId, 10);
  
  const session = await getServerSession(authOptions);
  
  // Authentication checks
  if (!session) {
    redirect("/"); // Redirects to login if not authenticated
  }
  
  if (session.user?.active === false) {
    redirect("/verify"); // Redirects inactive users to verification page
  }
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
    },
  });
  
  if (!user) {
    redirect("/"); // Redirect if user not found
  }
  
  // Fetch level data
  const levelData = await getLevelData(journeySlug, levelIdNumber, user.id);
  
  // Handle specific errors
  if (levelData.error === "Journey not found") {
    redirect("/journeys");
  }
  
  if (levelData.error === "Level not found") {
    redirect(`/journeys/${journeySlug}`);
  }
  
  if (levelData.error === "accessDenied") {
    // Pass through to client with access denied flag
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardNavBar 
          email={user.email}
          userName={user.name} 
        />
        
        <LevelContentClient 
          user={user}
          journeySlug={journeySlug}
          levelId={levelIdNumber}
          level={null}
          journeyProgress={null}
          accessDenied={true}
          error={null}
        />
      </div>
    );
  }
  
  // Prepare data for client component with proper TypeScript handling
  const level = 'level' in levelData ? levelData.level : null;
  const journeyProgress = 'journeyProgress' in levelData ? levelData.journeyProgress : null;
  const error = levelData.error !== "accessDenied" ? levelData.error : null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavBar 
        email={user.email}
        userName={user.name}
      />
      
      <LevelContentClient 
        user={user}
        journeySlug={journeySlug}
        levelId={levelIdNumber}
        level={level ?? null}
        journeyProgress={journeyProgress ?? null}
        accessDenied={false}
        error={error ?? null}
      />
    </div>
  );
}