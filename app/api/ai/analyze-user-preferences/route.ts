import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define the OpenAI API client type
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You must be logged in to use this feature" },
      { status: 401 }
    );
  }

  try {
    const { preferences } = await request.json();

    // Validate input
    if (!preferences) {
      return NextResponse.json(
        { error: "Missing user preferences" },
        { status: 400 }
      );
    }

    // Make sure we have at least some preferences to analyze
    const { language, reason, experience, commitment } = preferences;
    if (!language && !reason && !experience && !commitment) {
      return NextResponse.json({
        analysis: {
          title: "Welcome to CodePlatform!",
          summary: "We're excited to have you join our coding community.",
          recommendations: [
            "Complete your profile to get personalized recommendations",
            "Explore our beginner-friendly tutorials",
            "Join our community forums to connect with other learners",
          ],
        },
      });
    }

    // Prepare the prompt for the AI
    const prompt = generateAIPrompt(preferences);

    // Call AI API (OpenAI/ChatGPT or similar)
    const analysis = await getAIAnalysis(prompt);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}

// Generate a prompt for the AI based on user preferences
function generateAIPrompt(preferences: any) {
  const { source, language, reason, experience, commitment } = preferences;

  // Map preference values to more readable descriptions
  const languageMap: Record<string, string> = {
    python: "Python programming",
    java: "Java programming",
    html: "HTML/web development",
    none: "undecided on a programming language",
  };

  const reasonMap: Record<string, string> = {
    explore: "exploring what coding is",
    challenge: "challenging their brain",
    career: "boosting their career",
    fun: "having fun",
    education: "supporting their education",
    apps: "building their own apps",
    creative: "expanding creative skills",
    other: "other reasons",
  };

  const experienceMap: Record<string, string> = {
    beginner: "a complete beginner",
    refresher: "having some experience but needing a refresher",
    confident: "confident in their coding skills",
    expert: "expert at coding",
  };

  const commitmentMap: Record<string, string> = {
    "5min": "5 minutes per day",
    "15min": "15 minutes per day",
    "30min": "30 minutes per day",
    "60min": "60 minutes per day",
  };

  // Create a prompt that describes the user's preferences
  return `
You are an expert coding mentor helping a new user on our CodePlatform.
The user has completed our onboarding process and selected the following preferences:

${language ? `- They want to learn: ${languageMap[language] || language}` : ""}
${
  reason
    ? `- Their reason for learning to code: ${reasonMap[reason] || reason}`
    : ""
}
${
  experience
    ? `- Their experience level: ${experienceMap[experience] || experience}`
    : ""
}
${
  commitment
    ? `- Their time commitment: ${commitmentMap[commitment] || commitment}`
    : ""
}
${source ? `- They heard about us from: ${source}` : ""}

Based on this information, please provide:
1. A personalized title to welcome them (keep it short and enthusiastic)
2. A brief analysis of their profile and learning path (2-3 sentences)
3. Three specific recommendations for next steps they should take on our platform

Format your response as a valid JSON object with the following structure:
{
  "title": "Welcome title here",
  "summary": "Brief analysis here",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Do not include any additional text or explanation outside of this JSON object.
`;
}

// Call the AI API to get an analysis
async function getAIAnalysis(prompt: string) {
  // Get the API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OpenAI API key not found, using fallback analysis");
    return getFallbackAnalysis();
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
        model: "gpt-3.5-turbo", // You can use gpt-4 for more advanced analysis
        messages: [
          {
            role: "system",
            content:
              "You are a helpful coding mentor who provides personalized learning advice.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      throw new Error("Invalid AI response format");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return getFallbackAnalysis();
  }
}

// Provide a fallback analysis in case the AI call fails
function getFallbackAnalysis() {
  return {
    title: "Welcome to Tinkerithm",
    summary:
      "We're excited to have you join our coding community. Based on your preferences, we've customized a learning path that should help you achieve your goals efficiently.",
    recommendations: [
      "Start with our interactive tutorials that match your experience level",
      "Set up your coding environment with our step-by-step guide",
      "Join our community forum to connect with other learners",
    ],
  };
}
