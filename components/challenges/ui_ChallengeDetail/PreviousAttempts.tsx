import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChallengeAttempt } from '@/types/challenges';
import { formatDate } from '@/lib/challenge-utils';

interface PreviousAttemptsProps {
  attempts: ChallengeAttempt[];
  setUserCode: (code: string) => void;
  setAiCode: (code: string) => void;
}

const PreviousAttempts: React.FC<PreviousAttemptsProps> = ({ 
  attempts, 
  setUserCode, 
  setAiCode 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Previous Attempts</CardTitle>
        <CardDescription>Recent submissions for this challenge</CardDescription>
      </CardHeader>
      <CardContent>
        {attempts.length > 0 ? (
          <ScrollArea className="h-[320px]">
            <div className="space-y-4 pr-4">
              {attempts.map((attempt) => (
                <Card key={attempt.id} className="border shadow-sm">
                  <CardHeader className="py-2 px-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            attempt.winner === 'user' 
                              ? 'default' 
                              : attempt.winner === 'ai' 
                              ? 'destructive' 
                              : 'outline'
                          }
                        >
                          {attempt.winner === 'user' ? 'Win' : attempt.winner === 'ai' ? 'Loss' : 'Tie'}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatDate(attempt.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setUserCode(attempt.userCode)}
                        >
                          Load Your Code
                        </Button>
                        {attempt.aiCode && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setAiCode(attempt.aiCode)}
                          >
                            Load AI Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 px-3">
                    <div className="grid grid-cols-3 text-xs">
                      <div>
                        <p className="text-slate-500">Time</p>
                        <p>{attempt.userExecutionTime?.toFixed(2) || 'N/A'} ms</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Memory</p>
                        <p>{attempt.userMemory || 'N/A'} KB</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="flex items-center">
                          {attempt.userCorrect ? (
                            <><CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Correct</>
                          ) : (
                            <><XCircle className="h-3 w-3 text-red-500 mr-1" /> Incorrect</>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">No attempts yet</p>
            <p className="text-sm text-slate-400">Run your code to see results here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviousAttempts;