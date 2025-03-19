import React from 'react';
import { AlertCircle, CheckCircle, Trophy, XCircle, Medal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Types
interface Metrics {
  correct: boolean;
  executionTime?: number;
  memory?: number;
  codeLength: number;
}

interface AISolution {
  code: string;
}

interface UserExecutionError {
  statusId: number;
  description: string;
  message: string | null;
  stderr: string | null;
}

interface ResultData {
  winner: 'user' | 'ai' | 'tie';
  userMetrics: Metrics;
  aiMetrics: Metrics;
  aiSolution?: AISolution;
  userExecutionError?: UserExecutionError;
  attempt?: any;
}

interface ChallengeResultsProps {
  result: ResultData | null;
  error: string | null;
  challengeStarted: boolean;
  handleResetChallenge: () => void;
}

const ChallengeResults: React.FC<ChallengeResultsProps> = ({ 
  result, 
  error, 
  challengeStarted, 
  handleResetChallenge 
}) => {
  // Function to render a user-friendly error message based on status code
  const renderErrorMessage = (error: UserExecutionError) => {
    let message = "Error executing your code.";
    
    switch (error.statusId) {
      case 11:
        message = "Runtime Error (NZEC): Your program exited with a non-zero status. This could be due to an unhandled exception or error in your code.";
        break;
      case 5:
        message = "Time Limit Exceeded: Your code took too long to execute.";
        break;
      case 6:
        message = "Compilation Error: Check your syntax and ensure your code compiles correctly.";
        break;
      case 7:
        message = "Memory Limit Exceeded: Your program used too much memory.";
        break;
      case 10:
        message = "Your output doesn't match the expected result. Check your logic.";
        break;
      default:
        message = `Execution Error (Status ${error.statusId}): ${error.description || 'Something went wrong with your code.'}`;
    }
    
    return message;
  };
  
  return (
    <>
      {result ? (
        <div className="space-y-4">
          {/* Show execution error alert if there was an error */}
          {result.userExecutionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Execution Error</AlertTitle>
              <AlertDescription>
                <div className="text-sm mt-1">
                  {renderErrorMessage(result.userExecutionError)}
                </div>
                {result.userExecutionError.stderr && (
                  <div className="mt-2 p-2 bg-slate-800 text-white rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {result.userExecutionError.stderr}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              Result:
              {result.userExecutionError ? (
                <span className="text-red-600 ml-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" /> Execution Failed
                </span>
              ) : result.winner === 'user' ? (
                <span className="text-green-600 ml-2 flex items-center">
                  <Trophy className="h-4 w-4 mr-1" /> You Win!
                </span>
              ) : result.winner === 'ai' ? (
                <span className="text-blue-600 ml-2 flex items-center">
                  <Medal className="h-4 w-4 mr-1" /> AI Wins
                </span>
              ) : (
                <span className="text-orange-600 ml-2">Tie</span>
              )}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Your Results</h4>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-slate-500">Status:</span>{' '}
                    {result.userExecutionError ? (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Error
                      </span>
                    ) : result.userMetrics.correct ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Correct
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Incorrect
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="text-slate-500">Execution Time:</span>{' '}
                    {result.userExecutionError ? 'N/A' : result.userMetrics.executionTime?.toFixed(2) || 'N/A'} ms
                  </p>
                  <p>
                    <span className="text-slate-500">Memory Usage:</span>{' '}
                    {result.userExecutionError ? 'N/A' : result.userMetrics.memory || 'N/A'} KB
                  </p>
                  <p>
                    <span className="text-slate-500">Code Length:</span>{' '}
                    {result.userMetrics.codeLength} chars
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">AI Results</h4>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-slate-500">Status:</span>{' '}
                    {result.aiMetrics.correct ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Correct
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" /> Incorrect
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="text-slate-500">Execution Time:</span>{' '}
                    {result.aiMetrics.executionTime?.toFixed(2) || 'N/A'} ms
                  </p>
                  <p>
                    <span className="text-slate-500">Memory Usage:</span>{' '}
                    {result.aiMetrics.memory || 'N/A'} KB
                  </p>
                  <p>
                    <span className="text-slate-500">Code Length:</span>{' '}
                    {result.aiMetrics.codeLength} chars
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleResetChallenge} 
              className="w-full mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <div className="whitespace-pre-wrap">{error}</div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="text-center py-8">
          {challengeStarted ? (
            <p className="text-slate-500">Challenge in progress. Submit your solution when ready.</p>
          ) : (
            <p className="text-slate-500">Start the challenge to see results</p>
          )}
        </div>
      )}
    </>
  );
};

export default ChallengeResults;