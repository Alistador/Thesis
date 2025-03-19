// utils/challengeGenerator.ts

import { AIChallenge } from './challengeTypes';

// Define OpenAI API client types
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface GeneratedChallenge {
  title: string;
  description: string;
  starterCode: string;
  sampleInput: string;
  expectedOutput: string;
  solutionCode: string;
  testCases: {
    input: string;
    output: string;
  }[];
}

// Map language IDs to language names
const languageMap: Record<number, string> = {
  28: 'python',
  63: 'javascript',
  54: 'c++',
  62: 'java',
  50: 'c'
};

/**
 * Generate an AI-created coding challenge
 */
export async function generateAIChallenge(
  difficulty: string,
  challengeType: string,
  languageId: number
): Promise<GeneratedChallenge> {
  try {
    const language = languageMap[languageId] || 'python';
    
    // Create the prompt based on difficulty and challenge type
    const prompt = generateChallengePrompt(difficulty, challengeType, language);
    
    // Call OpenAI to generate the challenge
    const response = await callOpenAI(prompt);
    
    try {
      // Parse the JSON response
      const challengeData = JSON.parse(response);
      
      // Validate required fields
      if (!challengeData.title || !challengeData.description) {
        throw new Error('Generated challenge is missing required fields');
      }
      
      // Ensure test cases are provided
      if (!challengeData.testCases || !Array.isArray(challengeData.testCases) || challengeData.testCases.length === 0) {
        challengeData.testCases = [{
          input: challengeData.sampleInput || '',
          output: challengeData.expectedOutput || ''
        }];
      }
      
      return {
        title: challengeData.title,
        description: challengeData.description,
        starterCode: challengeData.starterCode || getDefaultStarterCode(language),
        sampleInput: challengeData.sampleInput || '',
        expectedOutput: challengeData.expectedOutput || '',
        solutionCode: challengeData.solutionCode || '',
        testCases: challengeData.testCases
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // If JSON parsing fails, try to extract content using regex
      const title = extractContent(response, 'title', 'Challenge Title');
      const description = extractContent(response, 'description', 'Solve this coding challenge');
      const starterCode = extractContent(response, 'starterCode', getDefaultStarterCode(language));
      const sampleInput = extractContent(response, 'sampleInput', '');
      const expectedOutput = extractContent(response, 'expectedOutput', '');
      const solutionCode = extractContent(response, 'solutionCode', '');
      
      return {
        title,
        description,
        starterCode,
        sampleInput,
        expectedOutput,
        solutionCode,
        testCases: [{
          input: sampleInput,
          output: expectedOutput
        }]
      };
    }
  } catch (error) {
    console.error("Error generating AI challenge:", error);
    
    // Return a fallback challenge if generation fails
    return getFallbackChallenge(difficulty, challengeType, languageId);
  }
}

/**
 * Generate a prompt for creating a coding challenge
 */
function generateChallengePrompt(
  difficulty: string,
  challengeType: string,
  language: string
): string {
  return `
You are an expert computer science instructor creating coding challenges.

Please create a ${difficulty} difficulty coding challenge for a ${challengeType} competition using ${language}.

The challenge should:
1. Be appropriate for ${difficulty} level programmers
2. Be clearly explained with examples
3. Have a unique and interesting problem to solve
4. Include test cases with inputs and expected outputs
5. For a "${challengeType}" challenge, the focus should be on ${
    challengeType === 'code_golf' 
      ? 'writing the shortest possible code (measured by character count)' 
      : challengeType === 'time_trial' 
      ? 'writing the fastest possible algorithm (best time complexity)' 
      : 'using the minimal memory possible (best space complexity)'
  }

Provide your response in valid JSON format with the following fields:
{
  "title": "Challenge title",
  "description": "Detailed problem description with examples",
  "starterCode": "Initial code template for the user",
  "sampleInput": "Example input for testing",
  "expectedOutput": "Expected output for the sample input",
  "solutionCode": "A correct solution to the problem",
  "testCases": [
    {
      "input": "Test case input 1",
      "output": "Expected output 1"
    },
    {
      "input": "Test case input 2",
      "output": "Expected output 2"
    }
  ]
}

Be creative but ensure the problem is well-defined and has a clear solution.
`;
}

/**
 * Call the OpenAI API to generate a challenge with retry logic
 */
async function callOpenAI(prompt: string, maxRetries = 3, delay = 1000): Promise<string> {
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
  
    if (!apiKey) {
      console.warn("OpenAI API key not found, using fallback challenge");
      throw new Error("API key not configured");
    }
  
    let lastError: Error | null = null;
    
    // Try multiple times
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add exponential backoff delay after first attempt
        if (attempt > 0) {
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          console.log(`Retry attempt ${attempt + 1}/${maxRetries}. Waiting ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
        
        // Call OpenAI API with gpt-3.5-turbo first, fall back to gpt-4 only for the final attempt
        // This improves reliability since gpt-3.5-turbo has much better availability
        const model = attempt < maxRetries - 1 ? "gpt-3.5-turbo" : "gpt-4";
        console.log(`Using model: ${model} for attempt ${attempt + 1}`);
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are an expert computer science instructor who creates programming challenges.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7, // Mid-range temperature for creativity
            max_tokens: 2000,
          }),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
  
        // Handle non-2xx responses
        if (!response.ok) {
          const errorText = await response.text();
          // Only throw for 5xx errors, which are server errors
          if (response.status >= 500) {
            lastError = new Error(`API returned status: ${response.status}, message: ${errorText}`);
            console.warn(`Attempt ${attempt + 1} failed: ${lastError.message}`);
            continue; // Try again
          } else {
            // For 4xx errors, which are client errors, don't retry
            throw new Error(`API returned status: ${response.status}, message: ${errorText}`);
          }
        }
  
        const data = (await response.json()) as OpenAIResponse;
        const content = data.choices[0]?.message?.content;
  
        if (!content) {
          throw new Error("No content in OpenAI response");
        }
  
        return content;
      } catch (error: any) {
        // Save the error for potential retry
        lastError = error;
        
        // Check if it's a network error or timeout - those are retriable
        const isRetriable = 
          error.name === 'AbortError' || 
          error.message.includes('network') || 
          error.message.includes('timeout') ||
          (error.message.includes('API returned status:') && error.message.includes('502'));
          
        if (!isRetriable) {
          throw error; // Don't retry non-retriable errors
        }
        
        console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
        
        // If we've reached the max retries, throw the last error
        if (attempt === maxRetries - 1) {
          console.error(`All ${maxRetries} attempts failed.`);
          throw lastError;
        }
      }
    }
    
    // This should never happen, but TypeScript requires a return
    throw lastError || new Error("Failed to call OpenAI API");
  }

/**
 * Extract content from non-JSON response
 */
function extractContent(
  text: string,
  fieldName: string,
  defaultValue: string
): string {
  // Try to match content between field delimiters
  const regex = new RegExp(`(?:"${fieldName}":|${fieldName}:)\\s*(?:"(.*?)(?:"|$)|(.+?)(?:,|\\n|$))`, 's');
  const match = text.match(regex);
  
  if (match) {
    return (match[1] || match[2] || '').trim();
  }
  
  // Try to match content inside code blocks
  if (fieldName === 'starterCode' || fieldName === 'solutionCode') {
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
    const matches = Array.from(text.matchAll(codeBlockRegex));
    
    if (matches.length > 0) {
      // First code block is often the starter code, second might be solution
      return fieldName === 'starterCode' 
        ? matches[0][1].trim()
        : (matches[1] ? matches[1][1].trim() : matches[0][1].trim());
    }
  }
  
  return defaultValue;
}

/**
 * Get default starter code for a language
 */
function getDefaultStarterCode(language: string): string {
  switch (language) {
    case 'python':
      return `# Write your solution here

def solve(input_str):
    # Parse input
    # Implement your solution
    return ""

# Read input and print output
if __name__ == "__main__":
    input_data = input()
    result = solve(input_data)
    print(result)
`;
    
    case 'javascript':
      return `// Write your solution here

function solve(inputStr) {
    // Parse input
    // Implement your solution
    return "";
}

// Process input from standard input
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const result = solve(line);
    console.log(result);
    rl.close();
});
`;
    
    case 'java':
      return `// Write your solution here

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        String result = solve(input);
        System.out.println(result);
        scanner.close();
    }
    
    public static String solve(String input) {
        // Parse input
        // Implement your solution
        return "";
    }
}
`;
    
    case 'c++':
      return `// Write your solution here

#include <iostream>
#include <string>

std::string solve(std::string input) {
    // Parse input
    // Implement your solution
    return "";
}

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::string result = solve(input);
    std::cout << result << std::endl;
    return 0;
}
`;
    
    case 'c':
      return `// Write your solution here

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* solve(char* input) {
    // Parse input
    // Implement your solution
    static char result[1000];
    // Fill result
    return result;
}

int main() {
    char input[1000];
    fgets(input, 1000, stdin);
    // Remove newline if present
    if (input[strlen(input) - 1] == '\\n') {
        input[strlen(input) - 1] = '\\0';
    }
    char* result = solve(input);
    printf("%s\\n", result);
    return 0;
}
`;
    
    default:
      return `# Write your solution here\n`;
  }
}

/**
 * Get a fallback challenge if generation fails
 */
function getFallbackChallenge(
  difficulty: string,
  challengeType: string,
  languageId: number
): GeneratedChallenge {
  const language = languageMap[languageId] || 'python';
  
  return {
    title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${challengeType.replace('_', ' ')} challenge`,
    description: `In this challenge, you need to calculate the sum of all integers from 1 to N.
    
Input: A single line containing an integer N (1 ≤ N ≤ 10000)
Output: The sum of all integers from 1 to N
    
Example:
Input: 5
Output: 15
    
Explanation: 1 + 2 + 3 + 4 + 5 = 15`,
    starterCode: getDefaultStarterCode(language),
    sampleInput: "5",
    expectedOutput: "15",
    solutionCode: language === 'python' 
      ? `def solve(input_str):\n    n = int(input_str.strip())\n    return str(n * (n + 1) // 2)\n\nif __name__ == "__main__":\n    input_data = input()\n    result = solve(input_data)\n    print(result)`
      : `function solve(inputStr) {\n    const n = parseInt(inputStr.trim());\n    return String(n * (n + 1) / 2);\n}`,
    testCases: [
      { input: "5", output: "15" },
      { input: "10", output: "55" },
      { input: "100", output: "5050" }
    ]
  };
}