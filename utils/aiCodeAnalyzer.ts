// utils/aiCodeAnalyzer.ts

interface LevelInfo {
    title: string;
    description: string;
    difficulty: string;
    solutionCode?: string;
  }
  
  interface AnalysisRequest {
    code: string;
    levelInfo: LevelInfo;
    expectedOutput: string;
    actualOutput: string;
    focusAreas?: string[];
  }
  
  interface AnalysisResponse {
    success: boolean;
    analysis?: {
      overall: string;
      strengths: string[];
      improvements: string[];
      tips: string[];
      efficiency?: string;
      readability?: string;
      pythonic?: string;
      comparison?: string;
    };
    error?: string;
  }
  
  // OpenAI response type
  interface OpenAIResponse {
    choices: {
      message: {
        content: string;
      };
    }[];
  }
  
  export async function analyzeCodeWithAI(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // Get the API key from environment variables
      const apiKey = process.env.OPENAI_API_KEY;
  
      if (!apiKey) {
        console.log("OpenAI API key not configured, skipping AI analysis");
        return {
          success: false,
          error: "AI analysis not available"
        };
      }
  
      // Prepare focus areas for the prompt
      const focusAreaPrompts = [];
      if (request.focusAreas?.includes('efficiency')) {
        focusAreaPrompts.push("Analyze code efficiency: Are there any performance issues or ways to optimize?");
      }
      if (request.focusAreas?.includes('readability')) {
        focusAreaPrompts.push("Analyze code readability: Is the code clear and easy to understand?");
      }
      if (request.focusAreas?.includes('pythonic')) {
        focusAreaPrompts.push("Analyze Pythonic style: Does the code follow Python best practices and idiomatic patterns?");
      }
  
      // Create comparison with reference solution if available
      let comparisonPrompt = "";
      if (request.levelInfo.solutionCode) {
        comparisonPrompt = `
  Reference solution:
  \`\`\`python
  ${request.levelInfo.solutionCode}
  \`\`\`
  
  Compare the student's solution to the reference solution. What are the main differences? Is the student's approach better or worse in any aspects?
  `;
      }
  
      // Construct the prompt for the AI
      const prompt = `
  You are an expert Python programming tutor. Analyze the following code submission for a programming exercise.
  
  ## Exercise Details
  Title: ${request.levelInfo.title}
  Description: ${request.levelInfo.description}
  Difficulty: ${request.levelInfo.difficulty}
  
  ## Student Code
  \`\`\`python
  ${request.code}
  \`\`\`
  
  ## Execution Results
  Expected output: ${request.expectedOutput}
  Actual output: ${request.actualOutput}
  
  ## Analysis Request
  Please provide a brief, constructive analysis that includes:
  1. Overall assessment (2-3 sentences)
  2. 2-3 specific strengths of the code
  3. 1-2 specific areas for improvement
  4. 1-2 specific tips that would help the student improve their coding skills
  ${focusAreaPrompts.join("\n")}
  ${comparisonPrompt}
  
  Format your response as JSON with the following structure:
  {
    "overall": "2-3 sentence overall assessment",
    "strengths": ["strength 1", "strength 2", ...],
    "improvements": ["area for improvement 1", "area for improvement 2", ...],
    "tips": ["specific tip 1", "specific tip 2", ...],
    ${request.focusAreas?.includes('efficiency') ? '"efficiency": "assessment of code efficiency",' : ''}
    ${request.focusAreas?.includes('readability') ? '"readability": "assessment of code readability",' : ''}
    ${request.focusAreas?.includes('pythonic') ? '"pythonic": "assessment of pythonic style",' : ''}
    ${request.levelInfo.solutionCode ? '"comparison": "comparison with reference solution"' : ''}
  }
  
  Keep your analysis supportive, educational, and targeted at beginner to intermediate Python programmers.
  `;
  
      // Call OpenAI API directly using fetch
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert Python programming tutor providing constructive feedback."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`OpenAI API returned status: ${response.status}`);
      }
  
      const data = await response.json() as OpenAIResponse;
      const content = data.choices[0]?.message?.content;
  
      if (!content) {
        return {
          success: false,
          error: "Empty response from AI service"
        };
      }
  
      try {
        // Extract JSON from the response (handling potential text around the JSON)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Could not find JSON in the response");
        }
        
        const analysis = JSON.parse(jsonMatch[0]);
        
        return {
          success: true,
          analysis
        };
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        return {
          success: false,
          error: "Failed to parse AI analysis"
        };
      }
    } catch (error) {
      console.error("Error in AI code analysis:", error);
      return {
        success: false,
        error: "AI analysis service unavailable"
      };
    }
  }
  
  // Alternative implementation using a generic AI service interface
  // This could be extended to support multiple AI providers
  export async function analyzeCodeWithGenericAI(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      // Configuration checks
      if (!process.env.AI_SERVICE_ENDPOINT || !process.env.AI_SERVICE_KEY) {
        console.log("AI service not configured, skipping analysis");
        return {
          success: false,
          error: "AI analysis not available"
        };
      }
  
      // Prepare the request payload
      const payload = {
        code: request.code,
        exercise: {
          title: request.levelInfo.title,
          description: request.levelInfo.description,
          difficulty: request.levelInfo.difficulty
        },
        expectedOutput: request.expectedOutput,
        actualOutput: request.actualOutput,
        focusAreas: request.focusAreas || ["general"],
        referenceSolution: request.levelInfo.solutionCode
      };
  
      // Call the external AI service
      const response = await fetch(process.env.AI_SERVICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_SERVICE_KEY}`
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Transform the external service response to our standard format
      return {
        success: true,
        analysis: {
          overall: data.overallAssessment,
          strengths: data.strengths,
          improvements: data.areasForImprovement,
          tips: data.tips,
          efficiency: data.metrics?.efficiency,
          readability: data.metrics?.readability,
          pythonic: data.metrics?.pythonic,
          comparison: data.comparisonWithReference
        }
      };
    } catch (error) {
      console.error("Error in generic AI code analysis:", error);
      return {
        success: false,
        error: "AI analysis service unavailable"
      };
    }
  }
  
  // Export the primary analysis function
  export default analyzeCodeWithAI;