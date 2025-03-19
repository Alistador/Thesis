import React from 'react';
import { Flag, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Challenge, ChallengeTestCase } from '@/types/challenges';
import { formatChallengeType } from '@/lib/challenge-utils';

interface ChallengeDescriptionProps {
  challenge: Challenge & { challengeTypes: any[]; testCases: ChallengeTestCase[] };
}

const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm">{challenge?.description}</p>
      
      {challenge?.sampleInput && (
        <div>
          <h3 className="text-sm font-medium mb-1">Sample Input:</h3>
          <pre className="bg-slate-100 p-2 rounded text-sm overflow-x-auto">
            {challenge.sampleInput}
          </pre>
        </div>
      )}
      
      {challenge?.expectedOutput && (
        <div>
          <h3 className="text-sm font-medium mb-1">Expected Output:</h3>
          <pre className="bg-slate-100 p-2 rounded text-sm overflow-x-auto">
            {challenge.expectedOutput}
          </pre>
        </div>
      )}
      
      {challenge?.testCases && challenge.testCases.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-1">Test Cases:</h3>
          <div className="space-y-2">
            {challenge.testCases
              .filter(testCase => !testCase.isHidden)
              .map((testCase, index) => (
                <div key={testCase.id || index} className="bg-slate-100 p-2 rounded text-sm">
                  <div><strong>Input:</strong> {testCase.input}</div>
                  <div><strong>Expected:</strong> {testCase.expectedOutput}</div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Challenge specific tips based on type */}
      {challenge?.challengeTypes?.[0] && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {formatChallengeType(challenge.challengeTypes[0].type)} Tips
          </AlertTitle>
          <AlertDescription>
            {challenge.challengeTypes[0].type === 'code_golf' && 
              'Focus on writing the shortest code possible while still getting correct results.'}
            {challenge.challengeTypes[0].type === 'time_trial' && 
              'Optimize for execution speed. Consider time complexity and efficient algorithms.'}
            {challenge.challengeTypes[0].type === 'memory_optimization' && 
              'Minimize memory usage in your solution. Consider space complexity and efficient data structures.'}
            {challenge.challengeTypes[0].type === 'debugging' && 
              'Find and fix bugs in the provided code to make it work correctly.'}
            {challenge.challengeTypes[0].description}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Challenge Instructions */}
      <Alert className="border-blue-200 bg-blue-50">
        <Flag className="h-4 w-4 text-blue-500" />
        <AlertTitle>How to Compete</AlertTitle>
        <AlertDescription className="text-sm">
          <ol className="list-decimal pl-4 space-y-1 mt-2">
            <li>Click "Start Challenge" to begin</li>
            <li>The AI will start coding a solution in real time</li>
            <li>Write your solution in the editor</li>
            <li>Click "Submit Solution" when you're ready</li>
            <li>Your solution will be compared with the AI's</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ChallengeDescription;