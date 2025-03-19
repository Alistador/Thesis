// types/levelTypes.ts
export interface LevelData {
    id: number;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    defaultCode: string;
    expectedOutput: string;
    testCases?: TestCase[];
    hints?: string[];
    solutionCode?: string;
    languageId?: number; // Default to 28 for Python 3.10
  }
  
  export interface TestCase {
    input: string;
    expectedOutput: string;
    description: string;
  }