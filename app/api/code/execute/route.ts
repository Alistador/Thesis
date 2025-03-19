// app/api/code/execute/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"; 
import { submitCode } from "@/utils/judge0Service"; // Using the updated service with polling
import { validateCode } from "@/utils/codeValidationService";
import { PrismaClient } from "@prisma/client";
import { analyzeCodeWithAI } from "@/utils/aiCodeAnalyzer"; 

const prisma = new PrismaClient();

// Define a type for submission data
interface SubmissionData {
  sourceCode: string;
  languageId: number;
  stdin: string | null;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: number;
  executionTime: number | null;
  memory: number | null;
  userId: number;
  levelId: number | null;
}

export async function POST(request: NextRequest) {
  try {
    // Debug: Log the request method and URL
    console.log(`Processing ${request.method} request to ${request.url}`);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("Authentication failed: No session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Validate request body before parsing JSON
    let requestData;
    try {
      requestData = await request.json();
      console.log("Request body successfully parsed");
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    // Validate required fields
    const { code, language_id } = requestData;
    if (!code || language_id === undefined) {
      console.error("Missing required fields:", { code: !!code, language_id: !!language_id });
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: "Both code and language_id are required" 
      }, { status: 400 });
    }
    
    // Extract optional fields with defaults
    const stdin = requestData.stdin || "";
    
    // Handle either challenge_id or level_id - they refer to the same thing
    let level_id = requestData.level_id || requestData.challenge_id || null;
    const journey_slug = requestData.journey_slug || null;
    
    console.log("Request data validated:", { 
      codeLength: code.length, 
      language_id, 
      hasStdin: !!stdin,
      level_id,
      journey_slug,
    });

    const userId = parseInt(session.user.id as string);
    console.log("User ID:", userId);

    // Submit code to Judge0 with polling until execution completes
    console.log("Submitting code to Judge0 with polling...");
    try {
      const result = await submitCode(code, language_id, stdin);
      
      // Guard against null responses from Judge0
      if (!result) {
        console.error("Judge0 returned null response");
        return NextResponse.json({ 
          error: "Code execution service unavailable", 
          details: "The code execution service returned an invalid response" 
        }, { status: 503 });
      }
      
      console.log("Judge0 final response received:", { 
        status: result.status?.id,
        hasStdout: !!result.stdout,
        hasStderr: !!result.stderr,
        hasCompileOutput: !!result.compile_output
      });

      // Ensure result.status exists and has an id property
      if (!result.status || typeof result.status.id !== 'number') {
        console.error("Invalid status in Judge0 response:", result.status);
        return NextResponse.json({ 
          error: "Invalid response from code execution service", 
          details: "The response didn't include a valid status" 
        }, { status: 500 });
      }

      // Define base submission data with proper typing and validation
      const submissionData: SubmissionData = {
        sourceCode: code,
        languageId: language_id,
        stdin: stdin || null,
        stdout: result.stdout || null,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        message: result.message || null,
        status: result.status.id,
        executionTime: result.time
          ? Math.round(parseFloat(result.time) * 1000)
          : null,
        memory: result.memory || null,
        userId: userId,
        levelId: null // Initialize as null
      };

      console.log("Submission data prepared");

      // Track validation results
      let validationResults = [];
      let allTestsPassed = false;
      let level = null;
      let aiAnalysis = null;

      // If level_id and journey_slug are provided, get the level and perform validation
      if (level_id && journey_slug) {
        console.log("Processing level-specific data and validation");
        
        // Find the journey using the slug
        const journey = await prisma.journey.findUnique({
          where: { slug: journey_slug }
        });

        if (!journey) {
          console.log("Journey not found");
          return NextResponse.json({ error: "Journey not found" }, { status: 404 });
        }
        
        console.log("Journey found:", journey.id);
        
        // Find the level using the level ID and journey ID
        const levelIdNum = typeof level_id === 'string' ? parseInt(level_id, 10) : level_id;
        
        level = await prisma.level.findFirst({
          where: { 
            id: levelIdNum,
            journeyId: journey.id
          }
        });

        if (!level) {
          console.log("Level not found");
          return NextResponse.json({ error: "Level not found" }, { status: 404 });
        }
        
        console.log("Level found:", level.id);
        
        // Add levelId to submission data
        submissionData.levelId = level.id;

        // Parse test cases
        const testCases = level.testCases ? JSON.parse(level.testCases as string) : [];
        
        // Skip validation if there are no test cases
        if (testCases.length > 0) {
          console.log(`Running ${testCases.length} test cases for validation`);
          
          // First check if code compiles and runs without errors
          const hasExecutionErrors = result.stderr || result.compile_output || result.status.id !== 3;
          
          if (hasExecutionErrors) {
            console.log("Code has execution errors, skipping further validation");
            validationResults = [{
              passed: false,
              message: `Code execution error: ${result.stderr || result.compile_output || "Unknown error"}`,
              testCase: { type: "execution", description: "Basic code execution" }
            }];
            allTestsPassed = false;
          } else {
            // Run all test cases through the validation service
            validationResults = await validateCode(code, testCases, language_id);
            allTestsPassed = validationResults.every(result => result.passed);
            
            console.log("Validation complete. All tests passed:", allTestsPassed);
          }
          const userRequestedAiAnalysis = requestData.includeAiAnalysis || false;
          
          // If validation passed and AI analysis is desired, perform it
          if (allTestsPassed && (userRequestedAiAnalysis || level.enableAiAnalysis)) {
            console.log("Running AI code analysis");
            
            try {
              aiAnalysis = await analyzeCodeWithAI({
                code,
                levelInfo: {
                  title: level.title,
                  description: level.description,
                  difficulty: level.difficulty,
                  solutionCode: level.solutionCode?? undefined
                },
                expectedOutput: level.expectedOutput,
                actualOutput: result.stdout || "",
                focusAreas: ["efficiency", "readability", "pythonic"]
              });
              
              console.log("AI analysis complete:", !!aiAnalysis);
            } catch (error) {
              console.error("AI analysis error:", error);
              // Continue without AI analysis if it fails
            }
          }
        } else {
          console.log("No test cases found, using simple output comparison");
          
          // If no test cases, fall back to simple output comparison
          const normalizedActual = (result.stdout || "").trim();
          const normalizedExpected = (level.expectedOutput || "").trim();
          
          const outputMatches = normalizedActual === normalizedExpected;
          
          validationResults = [{
            passed: outputMatches,
            message: outputMatches 
              ? "Output matches expected result" 
              : `Expected "${normalizedExpected}", got "${normalizedActual}"`,
            testCase: { type: "output", description: "Basic output comparison" }
          }];
          
          allTestsPassed = outputMatches;
          console.log("Basic output comparison result:", allTestsPassed);
        }

        // If all tests passed, update level progress
        if (allTestsPassed) {
          console.log("Updating level progress for successful submission");
          
          // Check if level is already completed
          const existingProgress = await prisma.levelProgress.findUnique({
            where: {
              userId_levelId: {
                userId: userId,
                levelId: level.id
              }
            }
          });

          const isAlreadyCompleted = existingProgress?.isCompleted || false;
          console.log("Level already completed:", isAlreadyCompleted);

          // Update or create level progress record
          await prisma.levelProgress.upsert({
            where: {
              userId_levelId: {
                userId: userId,
                levelId: level.id
              }
            },
            update: {
              attempts: { increment: 1 },
              lastSubmittedCode: code,
              // Only update completion status if not already completed
              ...(!isAlreadyCompleted && {
                isCompleted: true,
                completedAt: new Date()
              })
            },
            create: {
              userId: userId,
              levelId: level.id,
              attempts: 1,
              lastSubmittedCode: code,
              isCompleted: true,
              completedAt: new Date()
            }
          });

          // Only update journey progress if this is the first time completing the level
          if (!isAlreadyCompleted) {
            console.log("Updating journey progress");
            // Get the next level in sequence
            const nextLevel = await prisma.level.findFirst({
              where: {
                journeyId: journey.id,
                order: { gt: level.order }
              },
              orderBy: { order: 'asc' }
            });

            console.log("Next level:", nextLevel?.id);

            // Update journey progress
            await prisma.journeyProgress.upsert({
              where: {
                userId_journeyId: {
                  userId: userId,
                  journeyId: journey.id
                }
              },
              update: {
                // Only update currentLevelOrder if next level exists and is higher than current
                ...(nextLevel && nextLevel.order > level.order && {
                  currentLevelOrder: nextLevel.order
                }),
                // Mark journey as completed if this was the last level and no next level exists
                ...(!nextLevel && { isCompleted: true })
              },
              create: {
                userId: userId,
                journeyId: journey.id,
                currentLevelOrder: nextLevel ? nextLevel.order : level.order,
                isCompleted: !nextLevel
              }
            });

            // Check for and award any achievements
            await checkForAchievements(userId, journey.id);
          }
        }
      } else {
        console.log("No level/journey provided, skipping validation");
        
        // If no level specified, just use basic execution result
        validationResults = [{
          passed: result.status.id === 3, // Status 3 = Accepted
          message: result.status.id === 3
            ? "Code executed successfully"
            : `Execution error: ${result.stderr || result.compile_output || "Unknown error"}`,
          testCase: { type: "execution", description: "Basic code execution" }
        }];
        
        allTestsPassed = result.status.id === 3;
      }

      // Store submission in your database
      console.log("Storing submission in database");
      try {
        // Check if CodeSubmission exists in the database
        const models = await prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'CodeSubmission'`;
        const codeSubmissionExists = Array.isArray(models) && models.length > 0;
        
        let submission;
        
        if (codeSubmissionExists) {
          submission = await prisma.codeSubmission.create({
            data: submissionData
          });
          console.log("Submission stored successfully:", submission.id);
        } else {
          console.log("CodeSubmission table doesn't exist, skipping submission storage");
          // Create a mock submission object for the response
          submission = {
            id: 0,
            createdAt: new Date()
          };
        }
        
        // Return comprehensive results
        return NextResponse.json({
          submissionId: submission.id,
          result, // The original Judge0 execution result
          success: allTestsPassed, // Overall success boolean
          validationResults, // Detailed test case results
          aiAnalysis: aiAnalysis?.success ? aiAnalysis.analysis : null, // AI analysis if available
          level: level ? {
            id: level.id,
            title: level.title,
            expectedOutput: level.expectedOutput
          } : null
        });
      } catch (error) {
        console.error("Database error:", error);
        
        // Return execution and validation results without saving to the database
        return NextResponse.json({
          submissionId: null,
          result,
          success: allTestsPassed,
          validationResults,
          aiAnalysis: aiAnalysis?.success ? aiAnalysis.analysis : null,
          level: level ? {
            id: level.id,
            title: level.title,
            expectedOutput: level.expectedOutput
          } : null,
          warning: "Submission could not be stored in database, but code execution succeeded"
        });
      }
    } catch (error: any) {
      console.error("Error during Judge0 execution:", error);
      return NextResponse.json({
        error: "Code execution failed",
        message: error.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error executing code:", error);
    return NextResponse.json({
      error: "Failed to execute code", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Function to check for and award achievements (unchanged from original)
async function checkForAchievements(userId: number, journeyId: number) {
  try {
    console.log("Checking for achievements", { userId, journeyId });
    // Get all the user's level completions for this journey
    const completedLevels = await prisma.levelProgress.count({
      where: {
        userId: userId,
        isCompleted: true,
        level: {
          journeyId: journeyId
        }
      }
    });

    // Get total levels in the journey
    const totalLevels = await prisma.level.count({
      where: {
        journeyId: journeyId
      }
    });

    console.log("Achievement progress", { completedLevels, totalLevels });

    // Check for journey completion achievement
    if (completedLevels === totalLevels) {
      console.log("Journey completed, awarding achievement");
      // Find the journey completion achievement
      const journeyCompletionAchievement = await prisma.achievement.findFirst({
        where: {
          type: "journey_completion",
          criteria: {
            path: ["journeyId"],
            equals: journeyId
          }
        }
      });

      if (journeyCompletionAchievement) {
        console.log("Found journey completion achievement:", journeyCompletionAchievement.id);
        // Award the achievement if not already awarded
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: userId,
              achievementId: journeyCompletionAchievement.id
            }
          },
          update: {}, // No updates needed if it exists
          create: {
            userId: userId,
            achievementId: journeyCompletionAchievement.id,
            awardedAt: new Date()
          }
        });
      }
    }

    // Check for level milestone achievements (e.g., complete 5 levels)
    const levelMilestones = [1, 5, 10, 20, 50];
    for (const milestone of levelMilestones) {
      if (completedLevels >= milestone) {
        console.log(`Milestone ${milestone} reached`);
        // Find the level milestone achievement
        const levelMilestoneAchievement = await prisma.achievement.findFirst({
          where: {
            type: "level_milestone",
            criteria: {
              path: ["count"],
              equals: milestone
            }
          }
        });

        if (levelMilestoneAchievement) {
          console.log("Found milestone achievement:", levelMilestoneAchievement.id);
          // Award the achievement if not already awarded
          await prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId: userId,
                achievementId: levelMilestoneAchievement.id
              }
            },
            update: {}, // No updates needed if it exists
            create: {
              userId: userId,
              achievementId: levelMilestoneAchievement.id,
              awardedAt: new Date()
            }
          });
        }
      }
    }

  } catch (error) {
    console.error("Error checking for achievements:", error);
    // Don't throw the error - we don't want to fail the submission if achievement checking fails
  }
}