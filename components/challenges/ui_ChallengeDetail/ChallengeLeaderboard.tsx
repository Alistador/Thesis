import React from 'react';
import { BarChart, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TopPerformer } from '@/types/challenges';

interface ChallengeLeaderboardProps {
  leaderboard: TopPerformer[];
}

const ChallengeLeaderboard: React.FC<ChallengeLeaderboardProps> = ({ leaderboard }) => {
  return (
    <>
      {leaderboard.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            Challenge Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between text-sm p-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{index + 1}.</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{performer.user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{performer.user.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{performer.challengesWon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500">No leaderboard data available</p>
        </div>
      )}
    </>
  );
};

export default ChallengeLeaderboard;