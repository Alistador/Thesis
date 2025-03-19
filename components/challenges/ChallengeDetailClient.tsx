'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Challenge, 
  ChallengeAttempt, 
  TopPerformer, 
  Language, 
  ChallengeTestCase 
} from '@/types/challenges';

// Import Components
import ChallengeHeader from '@/components/challenges/ui_ChallengeDetail/ChallengeHeader';
import ChallengeDescription from '@/components/challenges/ui_ChallengeDetail/ChallengeDescription';
import ChallengeResults from '@/components/challenges/ui_ChallengeDetail/ChallengeResults';
import ChallengeLeaderboard from '@/components/challenges/ui_ChallengeDetail/ChallengeLeaderboard';
import PreviousAttempts from '@/components/challenges/ui_ChallengeDetail/PreviousAttempts';
import UserCodeEditor from '@/components/challenges/ui_ChallengeDetail/UserCodeEditor';
import AICodeEditor from '@/components/challenges/ui_ChallengeDetail/AICodeEditor';
import ActionButtons from '@/components/challenges/ui_ChallengeDetail/ActionButtons';

// Import Utilities
import { formatTime } from '@/lib/challenge-utils';

// Types
interface ResultData {
  winner: 'user' | 'ai' | 'tie';
  userMetrics: {
    correct: boolean;
    executionTime?: number;
    memory?: number;
    codeLength: number;
  };
  aiMetrics: {
    correct: boolean;
    executionTime?: number;
    memory?: number;
    codeLength: number;
  };
  aiSolution?: {
    code: string;
  };
  attempt?: ChallengeAttempt;
}

// Main props interface
interface ChallengeDetailClientProps {
  session: Session;
  challenge: Challenge & {
    testCases: ChallengeTestCase[];
  };
  userAttempts: ChallengeAttempt[];
  leaderboard: TopPerformer[];
  languages: Language[];
}

// Main Component
export default function ChallengeDetailClient({ 
  session, 
  challenge,
  userAttempts,
  leaderboard,
  languages
}: ChallengeDetailClientProps) {
  const router = useRouter();
  const userEditorRef = useRef<any>(null);
  const aiEditorRef = useRef<any>(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages.find(lang => lang.name.includes('Python')) || 
    (languages.length > 0 ? languages[0] : { id: 28, name: 'Python (3.8.1)', version: '3.8.1' })
  );
  const [userCode, setUserCode] = useState<string>(challenge.initialCode || challenge.starterCode || '# Write your solution here\n\n');
  const [aiCode, setAiCode] = useState<string>('# AI is waiting for the challenge to start...\n# Click "Start Challenge" to begin the competition');
  const [aiIsThinking, setAiIsThinking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>(userAttempts || []);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Challenge management states
  const [challengeStarted, setChallengeStarted] = useState<boolean>(false);
  const [challengeTimer, setChallengeTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiCompletionTime, setAiCompletionTime] = useState<number | null>(null);

  // Editor initialization
  const handleUserEditorDidMount = (editor: any) => {
    userEditorRef.current = editor;
  };
  
  const handleAiEditorDidMount = (editor: any) => {
    aiEditorRef.current = editor;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Handle starting the challenge
  const handleStartChallenge = () => {
    if (challengeStarted) return;
    
    setChallengeStarted(true);
    setAiIsThinking(true);
    setResult(null);
    setError(null);
    
    // Reset the user code to starter code if needed
    setUserCode(challenge.initialCode || challenge.starterCode || '# Write your solution here\n\n');
    
    // Start the AI coding simulation
    simulateAiCoding();
    
    // Start timer
    const interval = setInterval(() => {
      setChallengeTimer(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Reset the challenge
  const handleResetChallenge = () => {
    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Reset all states
    setChallengeStarted(false);
    setChallengeTimer(0);
    setAiIsThinking(false);
    setAiProgress(0);
    setAiCompletionTime(null);
    setResult(null);
    setError(null);
    
    // Reset code
    setUserCode(challenge.initialCode || challenge.starterCode || '# Write your solution here\n\n');
    setAiCode('# AI is waiting for the challenge to start...\n# Click "Start Challenge" to begin the competition');
  };

  // Submit user solution and compare with AI
// Submit user solution and compare with AI
// Updated handleRun function with better error handling
const handleRun = async () => {
    if (!challenge || isRunning || !userCode.trim() || !challengeStarted) return;
    
    try {
      setIsRunning(true);
      setError(null);
      setResult(null);
      
      // Clear timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          code: userCode,
          languageId: selectedLanguage.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Extract detailed error information if available
        const errorMessage = data.error || 'Failed to run code';
        const errorDetails = data.details || data.message || '';
        throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
      }
      
      // Check if the user's code had execution errors
      if (data.userExecutionError) {
        // Still set the result but also display the error
        setResult(data);
        setChallengeStarted(false);
        
        // Set a user-friendly error message
        const statusId = data.userExecutionError.statusId;
        let errorMessage = 'Your code encountered an error during execution.';
        
        // Map status codes to user-friendly messages
        switch (statusId) {
          case 11:
            errorMessage = 'Runtime Error (NZEC): Your program exited with a non-zero status. This could be due to an unhandled exception or error in your code.';
            break;
          case 5:
            errorMessage = 'Time Limit Exceeded: Your code took too long to execute.';
            break;
          case 6:
            errorMessage = 'Compilation Error: Check your syntax and ensure your code compiles correctly.';
            break;
          case 7:
            errorMessage = 'Memory Limit Exceeded: Your program used too much memory.';
            break;
          case 10:
            errorMessage = 'Your output doesn\'t match the expected result. Check your logic.';
            break;
          default:
            errorMessage = `Execution Error (Status ${statusId}): ${data.userExecutionError.message || 'Something went wrong with your code.'}`;
        }
        
        // Show the error message with stack trace if available
        if (data.userExecutionError.stderr) {
          setError(`${errorMessage}\n\nError details:\n${data.userExecutionError.stderr}`);
        } else {
          setError(errorMessage);
        }
        
        // Switch to results tab to show error
        setActiveTab('results');
        return;
      }
      
      setResult(data);
      setChallengeStarted(false);
      
      // The AI code should already be set by the simulateAiCoding function,
      // but we can update it here if needed for consistency
      if (data.aiMetrics && !aiCode.includes("Solution completed!")) {
        setAiCode(aiCode + '\n\n# Solution completed!');
      }
      
      // Add to attempts if not already in the list
      if (data.attempt) {
        setAttempts(prev => [data.attempt, ...prev]);
      }
      
      // Switch to results tab
      setActiveTab('results');
    } catch (err) {
      console.error('Error running code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // Still switch to results tab to show the error
      setActiveTab('results');
    } finally {
      setIsRunning(false);
    }
  };


// simulateAiCoding function with difficulty-based typing speed
// simulateAiCoding function with character-by-character typing animation
// simulateAiCoding function with delayed AI response
// simulateAiCoding function with enhanced difficulty-based behavior
const simulateAiCoding = async () => {
    setAiIsThinking(true);
    setAiCode('# AI is analyzing the problem...');
    setAiProgress(5);
    
    // Define valid difficulty levels
    type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
    
    // Get the challenge difficulty level and ensure it's a valid type
    let rawDifficulty = challenge.difficulty?.toLowerCase() || 'medium';
    
    // Convert to valid difficulty type
    const difficultyLevel: DifficultyLevel = 
      ['beginner', 'easy', 'medium', 'hard', 'expert'].includes(rawDifficulty) 
        ? rawDifficulty as DifficultyLevel 
        : 'medium';
    
    // Define timing parameters based on difficulty
    const timingParams = {
      beginner: {
        analysisTime: 3000,
        solutionDelay: 25000,  // Delay before actually requesting solution (25 seconds)
        charDelayBase: 80,     // Milliseconds per character (base)
        charDelayVariance: 60, // Random variance in milliseconds
        pauseLineProb: 0.7,    // Probability of pausing at end of line
        pauseLineDuration: [400, 1200], // Range of pause duration in ms
        pauseProbPerChar: 0.015, // Probability of small pauses while "thinking"
        pauseCharDuration: [80, 250], // Range for thinking pauses
        progressStepTime: 1200,
      },
      easy: {
        analysisTime: 2500,
        solutionDelay: 18000,  // 18 seconds
        charDelayBase: 60,
        charDelayVariance: 40,
        pauseLineProb: 0.6,
        pauseLineDuration: [300, 900],
        pauseProbPerChar: 0.01,
        pauseCharDuration: [60, 200],
        progressStepTime: 1000,
      },
      medium: {
        analysisTime: 2000,
        solutionDelay: 12000,  // 12 seconds
        charDelayBase: 40,
        charDelayVariance: 30,
        pauseLineProb: 0.4,
        pauseLineDuration: [200, 700],
        pauseProbPerChar: 0.008,
        pauseCharDuration: [50, 150],
        progressStepTime: 800,
      },
      hard: {
        analysisTime: 1500,
        solutionDelay: 8000,   // 8 seconds
        charDelayBase: 25,
        charDelayVariance: 20,
        pauseLineProb: 0.3,
        pauseLineDuration: [150, 500],
        pauseProbPerChar: 0.005,
        pauseCharDuration: [40, 120],
        progressStepTime: 600,
      },
      expert: {
        analysisTime: 1000,
        solutionDelay: 5000,   // 5 seconds
        charDelayBase: 15,
        charDelayVariance: 10,
        pauseLineProb: 0.2,
        pauseLineDuration: [100, 300],
        pauseProbPerChar: 0.003,
        pauseCharDuration: [30, 80],
        progressStepTime: 400,
      }
    };
    
    // Define thought processes based on difficulty level
    const beginnerThoughts = [
      '# Thinking about how to approach this',
      '# Let me try using a simple loop',
      '# Maybe I need an if statement here',
      '# I should check for edge cases',
      '# Hmm, not sure if this will work',
      '# Let me add some debug prints',
      '# Wait, I think I\'m on the wrong track',
      '# Starting over with a different approach',
      '# This seems easier than I thought',
      '# Let me double-check my logic'
    ];

    const intermediateThoughts = [
      '# Considering time complexity',
      '# Checking for edge cases',
      '# Maybe I could optimize this loop',
      '# Evaluating different algorithms',
      '# Looking for a cleaner approach',
      '# Balancing readability and performance',
      '# Let me refactor this section',
      '# This should handle most test cases'
    ];

    const expertThoughts = [
      '# Optimizing for O(n) time complexity',
      '# Using dynamic programming',
      '# Applying memoization technique',
      '# Implementing an efficient algorithm',
      '# Balancing time and space complexity',
      '# This solution should be optimal',
      '# Handling all edge cases'
    ];

    // Select appropriate thought process based on difficulty
    const thoughtProcess = difficultyLevel === 'beginner' ? beginnerThoughts :
                        difficultyLevel === 'easy' ? beginnerThoughts :
                        difficultyLevel === 'medium' ? intermediateThoughts :
                        difficultyLevel === 'hard' ? expertThoughts :
                        difficultyLevel === 'expert' ? expertThoughts :
                        intermediateThoughts;
    
    // Select appropriate timing based on difficulty
    const timing = timingParams[difficultyLevel];
    
    // Helper function for random pauses
    const randomPause = (min: number, max: number) => {
      return new Promise(resolve => {
        setTimeout(resolve, Math.floor(min + Math.random() * (max - min)));
      });
    };
    
    try {
      // Show progressive status updates for "thinking" phase
      await new Promise(resolve => setTimeout(resolve, timing.progressStepTime));
      setAiCode('# AI is analyzing the problem...\n# Identifying key requirements...');
      setAiProgress(15);
      
      await new Promise(resolve => setTimeout(resolve, timing.progressStepTime));
      setAiCode('# AI is analyzing the problem...\n# Identifying key requirements...\n# Designing an approach...');
      setAiProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, timing.progressStepTime));
      setAiCode('# AI is analyzing the problem...\n# Identifying key requirements...\n# Designing an approach...\n# Starting to code solution...\n\n');
      setAiProgress(45);
  
      // Create a function to show "thinking" during the delay period with appropriate thoughts
      let thinkingInterval: NodeJS.Timeout | null = null;
      const startThinking = () => {
        let dots = 0;
        let thinkingLines = ['', '', '', ''];
        
        // Randomly update thoughts while waiting
        thinkingInterval = setInterval(() => {
          // Use the difficulty-appropriate thoughts
          const thoughts = thoughtProcess;
          
          // Randomly update one of the thinking lines
          if (Math.random() > 0.7) {
            const lineToUpdate = Math.floor(Math.random() * thinkingLines.length);
            thinkingLines[lineToUpdate] = thoughts[Math.floor(Math.random() * thoughts.length)];
          }
          
          // Add thinking animation dots
          dots = (dots + 1) % 4;
          const dotString = '.'.repeat(dots);
          
          // Update the displayed code
          setAiCode(
            '# AI is analyzing the problem...\n# Identifying key requirements...\n# Designing an approach...\n# Starting to code solution...\n\n' +
            thinkingLines.filter(line => line).join('\n') + 
            (thinkingLines.some(line => line) ? '\n' : '') +
            `# Thinking${dotString}`
          );
        }, 500);
      };
      
      // Start the thinking animation
      startThinking();
      
      // Introduce a strategic delay before requesting the solution
      // This varies by difficulty level
      await new Promise(resolve => setTimeout(resolve, timing.solutionDelay));
      
      // Now make the API call to get the actual AI solution
      const aiRequestPromise = fetch('/api/challenges/ai-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          languageId: selectedLanguage.id,
          difficulty: difficultyLevel
        }),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to get AI solution');
        return res.json();
      });
      
      // Clean up the thinking interval
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
      }
      
      // Get the AI solution
      const aiSolutionData = await aiRequestPromise;
      let solutionCode = aiSolutionData?.code || '# AI could not generate a solution for this challenge';
      
      // Start with current text displayed
      let currentDisplay = '# AI is analyzing the problem...\n# Identifying key requirements...\n# Designing an approach...\n# Starting to code solution...\n\n';
      
      // Set initial progress for typing phase
      setAiProgress(50);
      
      // Calculate total characters for progress updates
      const totalChars = solutionCode.length;
      let charsTyped = 0;
      
      // Add ability to simulate typing mistakes based on difficulty
      const simulateTypingMistake = () => {
        if (difficultyLevel === 'beginner') {
          return Math.random() < 0.05; // 5% chance for beginners
        } else if (difficultyLevel === 'easy') {
          return Math.random() < 0.03; // 3% chance for easy
        } else if (difficultyLevel === 'medium') {
          return Math.random() < 0.015; // 1.5% chance for medium
        } else {
          return Math.random() < 0.005; // 0.5% chance for experts
        }
      };

      // Function to correct typing mistakes
      const correctMistake = async (currentText: string) => {
        // Determine how many characters to delete (1-3)
        const charsToDelete = Math.floor(Math.random() * 3) + 1;
        
        // Delete characters one by one with a delay
        for (let i = 0; i < charsToDelete && currentText.length > 0; i++) {
          currentText = currentText.slice(0, -1);
          setAiCode(currentText);
          
          // Brief pause between deletions
          await new Promise(resolve => setTimeout(resolve, timing.charDelayBase));
        }
        
        return currentText;
      };

      // Track consecutive mistakes to avoid infinite loops
      let consecutiveMistakes = 0;
      
      // Character-by-character typing animation
      for (let i = 0; i < solutionCode.length; i++) {
        // Possibly make a typing mistake (only if not too many consecutive mistakes)
        if (simulateTypingMistake() && consecutiveMistakes < 2) {
          // Type a wrong character
          const mistakeChars = "qwertyuiop[]asdfghjkl;'zxcvbnm,./";
          const wrongChar = mistakeChars.charAt(Math.floor(Math.random() * mistakeChars.length));
          
          currentDisplay += wrongChar;
          setAiCode(currentDisplay);
          
          // Pause briefly as if noticing the mistake
          await new Promise(resolve => setTimeout(resolve, timing.charDelayBase * 2));
          
          // Correct the mistake
          currentDisplay = await correctMistake(currentDisplay);
          consecutiveMistakes++;
        } else {
          // Reset consecutive mistakes counter
          consecutiveMistakes = 0;
          
          // Add the correct character
          currentDisplay += solutionCode[i];
          setAiCode(currentDisplay);
          charsTyped++;
          
          // Update progress as we type
          const progressPercentage = 50 + (charsTyped / totalChars * 45);
          setAiProgress(Math.min(95, progressPercentage));
        }
        
        // Random delay for this character
        const charDelay = timing.charDelayBase + Math.random() * timing.charDelayVariance;
        await new Promise(resolve => setTimeout(resolve, charDelay));
        
        // Special pauses
        const currentChar = solutionCode[i];
        
        // Longer pause at the end of lines
        if (currentChar === '\n') {
          if (Math.random() < timing.pauseLineProb) {
            await randomPause(timing.pauseLineDuration[0], timing.pauseLineDuration[1]);
          }
        } 
        // Pause after certain punctuation
        else if ([';', '{', '}', ')', '('].includes(currentChar)) {
          if (Math.random() < timing.pauseProbPerChar * 3) {
            await randomPause(timing.pauseCharDuration[0], timing.pauseCharDuration[1]);
          }
        }
        // Longer pause when starting a new code block (indentation after colon in Python)
        else if (currentChar === ':' && solutionCode[i+1] === '\n') {
          await randomPause(timing.pauseLineDuration[0], timing.pauseLineDuration[1]);
        }
        // Random thinking pauses
        else if (Math.random() < timing.pauseProbPerChar) {
          await randomPause(timing.pauseCharDuration[0], timing.pauseCharDuration[1]);
        }
        
        // Extra pause to think for more complex statements (if, for, while)
        if (i >= 2) {
          const lastThreeChars = solutionCode.substring(i-2, i+1);
          if (lastThreeChars === 'if ' || lastThreeChars === 'for' || lastThreeChars === 'whi') {
            if (difficultyLevel === 'beginner' || difficultyLevel === 'easy') {
              await randomPause(timing.pauseLineDuration[0], timing.pauseLineDuration[1]);
            }
          }
        }
      }
      
      // Add a small final delay to simulate completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAiIsThinking(false);
      setAiProgress(100);
      
      // Store the timestamp when AI finished
      setAiCompletionTime(challengeTimer);
      
    } catch (error) {
      console.error('Error getting AI solution:', error);
      setAiCode('# Error occurred while generating AI solution.\n# Please try again.');
      setAiIsThinking(false);
      setAiProgress(0);
    }
  };

  // Main render
  return (
    <div className="container py-6 max-w-7xl">
      {/* Header */}
      <ChallengeHeader 
        challenge={challenge} 
        challengeStarted={challengeStarted} 
        challengeTimer={challengeTimer}
        router={router}
      />
      
      {/* Main content: description, editors, and results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Challenge description and results */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Challenge Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-4">
                  <ChallengeDescription challenge={challenge} />
                </TabsContent>
                
                <TabsContent value="results" className="mt-4">
                  <ChallengeResults 
                    result={result} 
                    error={error} 
                    challengeStarted={challengeStarted} 
                    handleResetChallenge={handleResetChallenge}
                  />
                </TabsContent>
                
                <TabsContent value="leaderboard" className="mt-4">
                  <ChallengeLeaderboard leaderboard={leaderboard} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Previous attempts */}
          <PreviousAttempts 
            attempts={attempts} 
            setUserCode={setUserCode} 
            setAiCode={setAiCode}
          />
        </div>
        
        {/* Right column: Dual code editors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dual editor layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User code editor */}
            <UserCodeEditor 
              userCode={userCode}
              setUserCode={setUserCode}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              languages={languages}
              challengeStarted={challengeStarted}
              result={result}
              handleUserEditorDidMount={handleUserEditorDidMount}
            />
            
            {/* AI code editor */}
            <AICodeEditor 
              aiCode={aiCode}
              selectedLanguage={selectedLanguage}
              aiIsThinking={aiIsThinking}
              aiCompletionTime={aiCompletionTime}
              formatTime={formatTime}
              challengeStarted={challengeStarted}
              aiProgress={aiProgress}
              handleAiEditorDidMount={handleAiEditorDidMount}
            />
          </div>
          
          {/* Action buttons */}
          <ActionButtons 
            challengeStarted={challengeStarted}
            result={result}
            isRunning={isRunning}
            userCode={userCode}
            handleStartChallenge={handleStartChallenge}
            handleResetChallenge={handleResetChallenge}
            handleRun={handleRun}
          />
        </div>
      </div>
    </div>
  );
}