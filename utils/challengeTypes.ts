// utils/challengeTypes.ts
import { Challenge as PrismaChallenge } from '@prisma/client';

/**
 * Challenge type definition for AI challenge service
 * Compatible with Prisma Challenge model and included relations
 */
export interface AIChallenge {
  id: string;
  title: string | null;
  description: string | null;
  difficulty: string | null;
  sampleInput: string | null;
  expectedOutput: string | null;
  
  // Required relations
  challengeTypes: {
    id: number;
    type: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }[];
  
  // Optional relations
  testCases?: {
    id: number;
    challengeId: string;
    input: string | null;
    expectedOutput: string | null;
    isHidden: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }[];
  
  // Other optional fields
  starterCode?: string | null;
  initialCode?: string | null;
  solutionCode?: string | null;
  isActive?: boolean;
  timeLimit?: number | null;
  memoryLimit?: number | null;
}

/**
 * Response from AI challenge service
 */
export interface AIResponse {
  code: string;
  executionTime: number | null;
  memory: number | null;
  correct: boolean;
  explanation: string;
}

/**
 * User metrics for challenge attempt
 */
export interface UserMetrics {
  executionTime: number | null;
  memory: number | null;
  codeLength: number;
  correct: boolean;
}

/**
 * AI metrics for challenge attempt
 */
export interface AIMetrics {
  executionTime: number | null;
  memory: number | null;
  codeLength: number;
  correct: boolean;
}

/**
 * Challenge result winner type
 */
export type WinnerType = "user" | "ai" | "tie";