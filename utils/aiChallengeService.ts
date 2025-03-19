// utils/aiChallengeService.ts
import { submitCode } from './judge0Service';
import { AIChallenge, AIResponse } from './challengeTypes';

// Define the OpenAI API client type
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Map language IDs to language names
const languageMap: Record<number, string> = {
  28: 'python',
  63: 'javascript',
  54: 'c++',
  62: 'java',
  50: 'c'
  // Add more as needed
};

/**
 * Generate an AI solution for a coding challenge
 */
export async function generateAIResponse(
  challenge: AIChallenge,
  languageId: number
): Promise<AIResponse> {
  try {
    const language = languageMap[languageId] || 'python';
    const challengeType = challenge.challengeTypes[0]?.type || 'generic';
    
    // Create the prompt based on challenge type
    const prompt = generateAIPrompt(challenge, language, challengeType);
    
    // Call AI API to generate solution
    const aiSolution = await getAISolution(prompt);
    
    // Clean the code (remove markdown code blocks if present)
    const cleanedCode = aiSolution.replace(/```[\w]*\n|```/g, "").trim();
    
    // Execute the AI's solution to get metrics
    const executionResult = await submitCode(cleanedCode, languageId, challenge.sampleInput || "");
    
    // Determine if AI solution is correct
    const isCorrect = executionResult?.status?.id === 3 && 
                      executionResult?.stdout?.trim() === challenge.expectedOutput?.trim();
    
    // Prepare the final response
    const response: AIResponse = {
      code: cleanedCode,
      executionTime: executionResult?.time ? parseFloat(executionResult.time) * 1000 : null,
      memory: executionResult?.memory ? parseInt(executionResult.memory.toString()) : null,
      correct: isCorrect,
      explanation: "AI solution generated based on optimization for " + 
                 (challengeType === 'code_golf' 
                   ? 'minimum code length' 
                   : challengeType === 'time_trial' 
                   ? 'fastest execution time' 
                   : 'memory efficiency')
    };
    
    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Return a fallback response
    return {
      code: "# AI couldn't generate a solution for this challenge",
      executionTime: null,
      memory: null,
      correct: false,
      explanation: "Failed to generate AI solution due to an error."
    };
  }
}

/**
 * Generate a prompt for the AI based on challenge details
 */
function generateAIPrompt(
  challenge: AIChallenge,
  language: string,
  challengeType: string
): string {
  // Create the system prompt based on challenge type
  let systemPrompt = `You are an expert programmer specializing in solving coding challenges. Create a solution in ${language} for the following problem:`;
  
  // Add optimization hints based on challenge type
  switch (challengeType) {
    case 'code_golf':
      systemPrompt += ` Focus on writing the shortest possible code while still being correct. Aim for minimal character count.`;
      break;
    case 'time_trial':
      systemPrompt += ` Focus on writing the fastest possible code with optimal time complexity.`;
      break;
    case 'memory_optimization':
      systemPrompt += ` Focus on writing code with minimal memory usage and optimal space complexity.`;
      break;
    case 'debugging':
      systemPrompt += ` The following code contains bugs. Fix the bugs to make the code work correctly.`;
      break;
  }
  
  // Build the user message with challenge details
  let userMessage = `
Challenge: ${challenge.title}

Description:
${challenge.description}

${challenge.sampleInput ? `Input Example:\n${challenge.sampleInput}\n` : ''}
${challenge.expectedOutput ? `Expected Output:\n${challenge.expectedOutput}\n` : ''}

${challenge.testCases && challenge.testCases.length > 0 
  ? `Test Cases:\n${JSON.stringify(challenge.testCases, null, 2)}\n` 
  : ''}

Please provide ONLY the code solution without explanations. Make sure it's optimized for ${challengeType === 'code_golf' 
  ? 'minimum code length' 
  : challengeType === 'time_trial' 
  ? 'fastest execution time' 
  : 'memory efficiency'}.
`;

  return `
You are an expert ${language} programmer specializing in solving coding challenges.

${challengeType === 'code_golf' 
  ? 'You are participating in a code golf competition where your goal is to write the shortest possible valid code.' 
  : challengeType === 'time_trial' 
  ? 'You are participating in a time trial competition where your goal is to write the fastest executing code possible.' 
  : challengeType === 'memory_optimization'
  ? 'You are participating in a memory optimization competition where your goal is to minimize memory usage.'
  : challengeType === 'debugging'
  ? 'You are participating in a debugging competition where your goal is to fix bugs in the provided code.'
  : 'You are solving a coding challenge.'}

Here is the challenge:

Title: ${challenge.title}

Description:
${challenge.description}

${challenge.sampleInput ? `Input Example:\n${challenge.sampleInput}\n` : ''}
${challenge.expectedOutput ? `Expected Output:\n${challenge.expectedOutput}\n` : ''}

${challenge.testCases && challenge.testCases.length > 0 
  ? `Test Cases:\n${JSON.stringify(challenge.testCases, null, 2)}\n` 
  : ''}

Provide ONLY the ${language} code solution, with NO explanations or markdown formatting.
`;
}

/**
 * Call the OpenAI API to get a solution
 */
async function getAISolution(prompt: string): Promise<string> {
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
  
    if (!apiKey) {
      console.warn("OpenAI API key not found, using fallback solution");
      return getFallbackSolution();
    }
  
    try {
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // You can use gpt-4 for more advanced solutions
          messages: [
            {
              role: "system",
              content: "You are an expert programmer who provides optimized coding solutions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more deterministic outputs
          max_tokens: 1500,
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned status: ${response.status}, message: ${errorText}`);
      }
  
      const data = (await response.json()) as OpenAIResponse;
      const content = data.choices[0]?.message?.content;
  
      if (!content) {
        throw new Error("No content in AI response");
      }
  
      // Log success for debugging purposes
      console.log("Successfully generated AI solution");
      
      return content;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Return fallback solution on error
      return getFallbackSolution();
    }
  }

/**
 * Generate dynamic AI solutions with varying difficulty levels
 */
export async function generateDynamicAIResponse(
  challenge: AIChallenge,
  languageId: number,
  skillLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
): Promise<AIResponse> {
  // Adjust the AI's performance based on skill level
  const perfectionLevel = skillLevel === 'beginner' ? 0.6 : 
                          skillLevel === 'intermediate' ? 0.8 : 0.95;
  
  // Get a perfect solution first
  const perfectSolution = await generateAIResponse(challenge, languageId);
  
  // For beginner and intermediate AI, we might introduce inefficiencies
  if (skillLevel !== 'expert' && perfectSolution.correct) {
    // Higher chance to degrade the solution for lower skill levels
    const shouldDegrade = Math.random() > perfectionLevel;
    
    if (shouldDegrade) {
      const challengeType = challenge.challengeTypes[0]?.type || 'generic';
      
      // Degrade the solution based on challenge type
      switch (challengeType) {
        case 'code_golf':
          // Add unnecessary code to increase length
          perfectSolution.code = addUnnecessaryCode(perfectSolution.code, languageId, skillLevel);
          // Adjust execution time to reflect less optimized code
          perfectSolution.executionTime = perfectSolution.executionTime 
            ? perfectSolution.executionTime * (1 + Math.random() * (skillLevel === 'beginner' ? 0.5 : 0.3))
            : null;
          break;
          
        case 'time_trial':
          // Make the solution slower (more significantly for beginners)
          perfectSolution.executionTime = perfectSolution.executionTime 
            ? perfectSolution.executionTime * (1 + Math.random() * (skillLevel === 'beginner' ? 0.7 : 0.4))
            : null;
          // Also make the code less efficient but still correct
          perfectSolution.code = addInefficientAlgorithm(perfectSolution.code, languageId, skillLevel);
          break;
          
        case 'memory_optimization':
          // Increase memory usage (more significantly for beginners)
          perfectSolution.memory = perfectSolution.memory 
            ? perfectSolution.memory * (1 + Math.random() * (skillLevel === 'beginner' ? 0.6 : 0.35))
            : null;
          // Make the code use more memory but still correct
          perfectSolution.code = addMemoryInefficiency(perfectSolution.code, languageId, skillLevel);
          break;
          
        case 'debugging':
          // Less optimized but still correct code
          perfectSolution.code = addClumsinessToCode(perfectSolution.code, languageId, skillLevel);
          perfectSolution.executionTime = perfectSolution.executionTime 
            ? perfectSolution.executionTime * (1 + Math.random() * (skillLevel === 'beginner' ? 0.4 : 0.2))
            : null;
          break;
          
        default:
          // For any other challenge type
          perfectSolution.code = addClumsinessToCode(perfectSolution.code, languageId, skillLevel);
          perfectSolution.executionTime = perfectSolution.executionTime 
            ? perfectSolution.executionTime * (1 + Math.random() * (skillLevel === 'beginner' ? 0.5 : 0.3))
            : null;
      }
    }
  }
  
  return perfectSolution;
}

/**
 * Provide a fallback solution in case the AI call fails
 */
function getFallbackSolution(): string {
  return `
# Fallback solution - AI service unavailable
def solve(input_str):
    # Simple fallback solution
    return input_str.strip()

# Read input and print output
if __name__ == "__main__":
    input_data = input()
    print(solve(input_data))
`;
}

/**
 * Helper function to add unnecessary code to increase length
 * More verbose for beginners, less for intermediate
 */
function addUnnecessaryCode(code: string, languageId: number, skillLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate'): string {
  const language = languageMap[languageId] || 'python';
  const verbosityLevel = skillLevel === 'beginner' ? 'high' : 'medium';
  
  if (language === 'python') {
    // Begin with comments that reflect the skill level
    let comments = [];
    
    if (verbosityLevel === 'high') {
      comments = [
        "# This is my solution to the challenge",
        "# First, I'll define the main function",
        "# I'll add some helper variables to make the code easier to understand",
        "# This approach might not be the most efficient but it works correctly"
      ];
    } else {
      comments = [
        "# Solution for the challenge",
        "# Adding a few helper variables for clarity"
      ];
    }
    
    // Add unnecessary variables based on skill level
    let extraCode = '';
    if (verbosityLevel === 'high') {
      extraCode = `
# Extra debug code
debug_mode = False
enable_logging = False

# Helper function that isn't really needed
def log_progress(step_name):
    if debug_mode and enable_logging:
        print(f"Step completed: {step_name}")

# Configuration variables
MAX_ITERATIONS = 1000
EPSILON = 0.00001
`;
    } else {
      extraCode = `
# Debug flag
debug_mode = False
if debug_mode:
    print("Debug mode enabled")
`;
    }
    
    // Combine everything in a way that doesn't break the original code
    return `${comments.join('\n')}\n${extraCode}\n${code}\n\n# End of solution`;
    
  } else if (language === 'javascript') {
    // JavaScript version with similar patterns
    let comments = [];
    
    if (verbosityLevel === 'high') {
      comments = [
        "// This is my solution to the JavaScript challenge",
        "// I'll implement the main algorithm below",
        "// Adding some helper variables for readability",
        "// This might not be the shortest approach but it's easier to understand"
      ];
    } else {
      comments = [
        "// Solution for the challenge",
        "// Adding a few helper variables for clarity"
      ];
    }
    
    // Add unnecessary variables based on skill level
    let extraCode = '';
    if (verbosityLevel === 'high') {
      extraCode = `
// Configuration and debug settings
const DEBUG_MODE = false;
const ENABLE_LOGGING = false;
const MAX_ITERATIONS = 1000;
const EPSILON = 0.00001;

// Helper function that isn't really needed
function logProgress(stepName) {
    if (DEBUG_MODE && ENABLE_LOGGING) {
        console.log(\`Step completed: \${stepName}\`);
    }
}
`;
    } else {
      extraCode = `
// Debug flag
const debugMode = false;
if (debugMode) {
    console.log("Debug mode enabled");
}
`;
    }
    
    // Combine everything
    return `${comments.join('\n')}\n${extraCode}\n${code}\n\n// End of solution`;
  }
  
  // For other languages, just return the original code with some comments
  return `// Solution for ${language} challenge\n${code}\n// End of solution`;
}

/**
 * Helper function to add time inefficiency to algorithms
 * Creates clumsy but working algorithms
 */
function addInefficientAlgorithm(code: string, languageId: number, skillLevel: 'beginner' | 'intermediate' | 'expert'): string {
  const language = languageMap[languageId] || 'python';
  
  // For time trial challenges, we want to add inefficient but correct algorithms
  // that novice programmers might use
  
  if (language === 'python') {
    // Check if the code contains sorting operations
    if (code.includes('sort(') || code.includes('sorted(')) {
      if (skillLevel === 'beginner') {
        // Replace built-in sort with a bubble sort implementation
        return code.replace(
          /(\w+)\.sort\(\)/g, 
          `# Using bubble sort instead of built-in sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

$1 = bubble_sort($1)`
        );
      } else if (skillLevel === 'intermediate') {
        // Use a less efficient selection sort
        return code.replace(
          /(\w+)\.sort\(\)/g,
          `# Using selection sort
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

$1 = selection_sort($1)`
        );
      }
    }
    
    // Check for list comprehensions and replace with for loops
    if (code.includes('[') && code.includes('for') && code.includes('if')) {
      if (skillLevel === 'beginner') {
        return code.replace(
          /\[(.*?) for (.*?) in (.*?) if (.*?)\]/g,
          `# Converting list comprehension to an explicit loop
result = []
for $2 in $3:
    if $4:
        result.append($1)
result`
        );
      }
    }
  } else if (language === 'javascript') {
    // Similar inefficiency patterns for JavaScript
    if (code.includes('.sort(') || code.includes('Array.sort')) {
      if (skillLevel === 'beginner') {
        return code.replace(
          /(\w+)\.sort\((.*?)\)/g,
          `// Using bubble sort instead of built-in sort
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

bubbleSort($1)`
        );
      }
    }
  }
  
  // If no specific patterns were matched, just add some inefficient loops
  if (skillLevel === 'beginner' && language === 'python') {
    return `# Adding some extra computation to simulate a beginner's approach
result = None  # This will store our final answer

def solve_challenge():
    global result
    # Original solution
${code.split('\n').map(line => '    ' + line).join('\n')}

# Call the solution function and return its result
solve_challenge()
${code.includes('return') ? 'result' : ''}`;
  }
  
  return code;
}

/**
 * Helper function to add memory inefficiency
 * Creates working but memory-hungry code
 */
function addMemoryInefficiency(code: string, languageId: number, skillLevel: 'beginner' | 'intermediate' | 'expert'): string {
  const language = languageMap[languageId] || 'python';
  
  if (language === 'python') {
    if (skillLevel === 'beginner') {
      // Add unnecessary data structures and copies
      return `# Adding some memory-inefficient practices for a beginner solution
# Store everything in memory for "easier" access
all_results = []
all_intermediate_steps = []

${code}

# Store copies of results in case we need them later (we don't, but beginners might not know that)
result_copy = all_results.copy() if all_results else []
`;
    } else if (skillLevel === 'intermediate') {
      // Less inefficient but still not optimal
      return `# Adding slightly inefficient memory usage
cache = {}  # A cache that's not really needed but feels "safer" to have

${code}

# Save a copy of final result, unnecessarily
final_result_copy = result.copy() if 'result' in locals() and isinstance(result, list) else []
`;
    }
  } else if (language === 'javascript') {
    if (skillLevel === 'beginner') {
      return `// Adding memory-inefficient practices for a beginner solution
// Store everything in arrays "just in case"
const allResults = [];
const allIntermediateSteps = [];

${code}

// Make unnecessary copies
const resultsCopy = [...allResults];
`;
    }
  }
  
  return code;
}

/**
 * Helper function to add general clumsiness to code
 * Creates working but novice-looking code
 */
function addClumsinessToCode(code: string, languageId: number, skillLevel: 'beginner' | 'intermediate' | 'expert'): string {
  const language = languageMap[languageId] || 'python';
  
  if (language === 'python') {
    if (skillLevel === 'beginner') {
      // Typical beginner patterns - verbose variable names, extra comments, etc.
      return code
        // Replace short variable names with unnecessarily long ones
        .replace(/\bi\b(?=\s*=|\s*\+|\s*in)/g, 'index_counter')
        .replace(/\bj\b(?=\s*=|\s*\+|\s*in)/g, 'inner_index')
        .replace(/\bn\b(?=\s*=)/g, 'length_of_array')
        // Add extra printing that's commented out
        .replace(/(\s*)(return\s+.*)/g, '$1# Print result for debugging\n$1# print("Result:", $2)\n$1$2')
        // Add excessive type hints and comments
        .replace(/(\s*)(def\s+\w+\(.*?\))/g, '$1# Function to process input and generate output\n$1$2')
        // Add extra variables for clarity
        .replace(/return\s+(\w+)\s*([+\-*/])\s*(\w+)/g, 'final_result = $1 $2 $3\nreturn final_result');
    } else if (skillLevel === 'intermediate') {
      // More subtle inefficiencies
      return code
        // Add slightly more type checking than needed
        .replace(/(\s*)(def\s+\w+\(.*?\))/g, '$1# Function with added robustness\n$1$2')
        // Slightly verbose variable names
        .replace(/\b([a-z])\b(?=\s*=|\s*\+|\s*in)/g, '$1_var')
        // Slightly more error checking than needed
        .replace(/return\s+(.+)/g, 'result = $1\nreturn result');
    }
  } else if (language === 'javascript') {
    // Similar patterns for JavaScript
    if (skillLevel === 'beginner') {
      return code
        .replace(/\bi\b(?=\s*=|\s*\+|\s*in)/g, 'indexCounter')
        .replace(/\bj\b(?=\s*=|\s*\+|\s*in)/g, 'innerIndex')
        .replace(/\bn\b(?=\s*=)/g, 'lengthOfArray')
        .replace(/(\s*)(function\s+\w+\(.*?\))/g, '$1// Function to process input and generate output\n$1$2')
        .replace(/return\s+(\w+)\s*([+\-*/])\s*(\w+)/g, 'const finalResult = $1 $2 $3;\nreturn finalResult;');
    }
  }
  
  return code;
}