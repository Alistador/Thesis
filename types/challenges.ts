// types/challenges.ts

import { Session } from "next-auth";

// User interface matching what your client expects
export interface User {
  id: number;
  name: string | null;
}

// Challenge Type
export interface ChallengeType {
  id: number;
  type: string;
  description: string;
}

// Challenge Stats - Define a more specific type for the stats
export interface ChallengeStats {
  successRate: number;
  attempts: number;
}

// Challenge
export interface Challenge {
  id: string;  // Changed from number to string to match database storage
  title: string | null;
  description: string | null;
  starterCode: string | null;
  languageId: number | null;
  difficulty: string | null;
  sampleInput: string | null;
  expectedOutput: string | null;
  timeLimit: number | null;
  memoryLimit: number | null;
  isActive?: boolean;
  initialCode?: string | null;
  solutionCode: string | null;
  challengeTypes: ChallengeType[];
  stats?: ChallengeStats[]; // Use the defined ChallengeStats type
}

// User Statistics
export interface UserStats {
  id: number;
  userId: number;
  challengesWon: number;
  totalChallengesAttempted: number;
  challengesTied?: number;
  codeGolfRating?: number;
  timeTrialRating?: number;
  memoryOptRating?: number;
  debuggingRating?: number;
  updatedAt?: Date;
  rank?: number; // Add rank property
}

// Top Performer for leaderboards
export interface TopPerformer {
  id: number;
  userId: number;
  challengesWon: number;
  user: User;
}

// User Rank with Stats
export interface UserRank {
  rank: number;
  stats: UserStats | null;
}

// Challenge Attempt
export interface ChallengeAttempt {
  id: number;
  createdAt: Date;
  userCode: string;
  aiCode: string;
  userExecutionTime: number | null;
  userMemory: number | null;
  aiExecutionTime: number | null;
  aiMemory: number | null;
  userCorrect: boolean;
  aiCorrect: boolean;
  winner: string; // "user", "ai", or "tie"
  userId: number;
  challengeId: string;
}

// Challenge Test Case
export interface ChallengeTestCase {
  id: number;
  challengeId: string;
  input: string | null;
  expectedOutput: string | null;
  isHidden: boolean;
}

// Programming Language
export interface Language {
  id: number;
  name: string;
  version: string;
}

// Props for Challenges Client Component
export interface ChallengesClientProps {
  session: Session;
  initialChallenges: Challenge[];
  initialUserStats: UserStats | null;
  initialTopPerformers: TopPerformer[];
  initialChallengeTypes: string[];
}

// Props for Leaderboard Client Component
export interface LeaderboardClientProps {
  session: Session;
  initialLeaderboard: TopPerformer[];
  initialUserRank: UserRank;
  initialChallengeTypes: string[];
}

// Props for Challenge Detail Client Component
export interface ChallengeDetailClientProps {
  session: Session;
  challenge: Challenge & {
    testCases: ChallengeTestCase[];
  };
  userAttempts: ChallengeAttempt[];
  leaderboard: TopPerformer[];
  languages: Language[];
}