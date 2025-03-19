// utils/judge0Service.ts

interface JudgeSubmissionResponse {
  token: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  status: {
    id: number;
    description: string;
  };
  memory?: number;
  time?: string;
  language_id: number;
}

// Use fallback values to prevent undefined errors
const RAPIDAPI_HOST =
  process.env.RAPIDAPI_HOST || "judge0-extra-ce.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const JUDGE0_API_URL = `https://${RAPIDAPI_HOST}`;

// Maximum number of polling attempts
const MAX_POLLING_ATTEMPTS = 30;
// Polling interval in milliseconds (1 second)
const POLLING_INTERVAL = 1000;
// Status IDs that indicate the submission is still processing
const PENDING_STATUS_IDS = [1, 2]; // 1=In Queue, 2=Processing

/**
 * Submit code to Judge0 and poll until execution is complete
 * @param sourceCode Source code to execute
 * @param languageId Programming language ID
 * @param stdin Optional input data
 * @returns The final execution result
 */
export async function submitCode(
  sourceCode: string,
  languageId: number,
  stdin: string = ""
): Promise<JudgeSubmissionResponse> {
  try {
    console.log("Using API host:", RAPIDAPI_HOST);
    console.log("API key defined:", !!RAPIDAPI_KEY);

    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not defined");
    }

    console.log("Submitting code to Judge0");
    console.log("Payload being sent to Judge0:", {
      source_code: "***redacted for log brevity***",
      language_id: languageId,
      stdin: stdin || "",
    });

    // Initial submission to get a token - don't wait
    const response = await fetch(`${JUDGE0_API_URL}/submissions`, {
      method: "POST",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Judge0 API error details:", errorJson);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorJson)}`
        );
      } catch (parseError) {
        console.error("Judge0 API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
    }

    const submissionData = await response.json();
    console.log("Submission created with token:", submissionData.token);

    // Now poll until execution completes
    return pollSubmissionResult(submissionData.token);
  } catch (error) {
    console.error("Error submitting code:", error);
    throw error;
  }
}

/**
 * Poll Judge0 for a submission result until it's completed
 * @param token Submission token to poll
 * @returns The final execution result
 */
async function pollSubmissionResult(token: string): Promise<JudgeSubmissionResponse> {
  console.log(`Starting polling for submission ${token}`);
  
  for (let attempt = 1; attempt <= MAX_POLLING_ATTEMPTS; attempt++) {
    console.log(`Polling attempt ${attempt}/${MAX_POLLING_ATTEMPTS} for token ${token}`);
    
    try {
      const result = await getSubmission(token);
      
      // Check if we have a final result
      if (result.status && !PENDING_STATUS_IDS.includes(result.status.id)) {
        console.log(`Execution completed with status: ${result.status.id} (${result.status.description})`);
        return result;
      }
      
      console.log(`Status still pending: ${result.status?.id} (${result.status?.description}). Waiting before next poll...`);
      
      // Wait before next polling attempt
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    } catch (error) {
      console.error(`Error during polling attempt ${attempt}:`, error);
      
      // If we're on the last attempt, throw the error
      if (attempt === MAX_POLLING_ATTEMPTS) {
        throw error;
      }
      
      // Otherwise wait and try again
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }
  }
  
  // If we've exhausted all polling attempts
  throw new Error(`Execution timed out after ${MAX_POLLING_ATTEMPTS} polling attempts`);
}

/**
 * Fetch a specific submission by token
 * @param token Submission token
 * @returns The submission details
 */
export async function getSubmission(
  token: string
): Promise<JudgeSubmissionResponse> {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not defined");
    }

    const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Judge0 API error details:", errorJson);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorJson)}`
        );
      } catch (parseError) {
        console.error("Judge0 API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw error;
  }
}

export async function getLanguages(): Promise<any[]> {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error("RAPIDAPI_KEY is not defined");
    }

    const response = await fetch(`${JUDGE0_API_URL}/languages`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Judge0 API error details:", errorJson);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorJson)}`
        );
      } catch (parseError) {
        console.error("Judge0 API error response:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching languages:", error);
    throw error;
  }
}