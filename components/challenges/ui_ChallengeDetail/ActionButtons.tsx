import React from 'react';
import { Flag, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  challengeStarted: boolean;
  result: any | null;
  isRunning: boolean;
  userCode: string;
  handleStartChallenge: () => void;
  handleResetChallenge: () => void;
  handleRun: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  challengeStarted, 
  result, 
  isRunning, 
  userCode, 
  handleStartChallenge, 
  handleResetChallenge, 
  handleRun 
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-end gap-4">
          {!challengeStarted && result === null ? (
            <Button 
              onClick={handleStartChallenge}
              disabled={isRunning} 
              size="lg"
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            >
              <Flag className="h-4 w-4 mr-2" /> Start Challenge
            </Button>
          ) : challengeStarted ? (
            <>
              <Button 
                onClick={handleResetChallenge}
                variant="outline"
                size="lg"
                className="w-full md:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Reset
              </Button>
              
              <Button 
                onClick={handleRun}
                disabled={isRunning || userCode.trim() === ''} 
                size="lg"
                className="w-full md:w-auto"
              >
                {isRunning ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Play className="h-4 w-4 mr-2" /> Submit Solution</>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleResetChallenge}
              size="lg"
              className="w-full md:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionButtons;