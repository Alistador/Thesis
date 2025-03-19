import React from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Challenge } from '@/types/challenges';
import { getChallengeTypeIcon, formatChallengeType, formatTime, getDifficultyColor } from '@/lib/challenge-utils';

interface ChallengeHeaderProps {
  challenge: Challenge & { challengeTypes: any[] };
  challengeStarted: boolean;
  challengeTimer: number;
  router: any;
}

const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({
  challenge,
  challengeStarted,
  challengeTimer,
  router
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/challenges')} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {challenge?.title}
          </h1>
          {challenge?.challengeTypes && (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {challenge.challengeTypes.map((type) => (
                <Badge key={type.id} className="flex items-center gap-1">
                  {getChallengeTypeIcon(type.type)}
                  {formatChallengeType(type.type)}
                </Badge>
              ))}
              {challenge.difficulty && (
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Challenge Timer */}
      {challengeStarted && (
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-amber-500" />
          <span className="text-lg font-mono">{formatTime(challengeTimer)}</span>
        </div>
      )}
    </div>
  );
};

export default ChallengeHeader;