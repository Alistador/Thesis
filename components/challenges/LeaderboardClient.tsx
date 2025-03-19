'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, Trophy, Clock, BarChart, Medal, Zap, Cpu, Code, Brain
} from 'lucide-react';
import { UserRank } from '@/types/challenges';

// Modified TopPerformer interface to match the actual data structure
interface TopPerformer {
  id: number;
  userId: number;
  challengesWon: number;
  user: {
    name: string | null;
    id?: number; // Make id optional to match the data structure
  };
}

interface LeaderboardClientProps {
  session: Session | null;
  initialLeaderboard: TopPerformer[];
  initialUserRank: UserRank;
  initialChallengeTypes: string[];
}

export default function LeaderboardClient({ 
  session, 
  initialLeaderboard,
  initialUserRank,
  initialChallengeTypes 
}: LeaderboardClientProps) {
  const [leaderboard, setLeaderboard] = useState<TopPerformer[]>(initialLeaderboard || []);
  const [userRank, setUserRank] = useState<UserRank | null>(initialUserRank || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeFrame, setTimeFrame] = useState<string>('all');
  const [challengeType, setChallengeType] = useState<string>('');
  const [challengeTypes] = useState<string[]>(initialChallengeTypes || []);
  
  const isFiltered = useMemo(() => 
    challengeType !== '' || timeFrame !== 'all', 
    [challengeType, timeFrame]
  );
  
  // Effect to filter leaderboard when filters change
  useEffect(() => {
    // Skip API call if no filters are active
    if (!isFiltered) {
      setLeaderboard(initialLeaderboard);
      setUserRank(initialUserRank);
      return;
    }
    
    const fetchFilteredLeaderboard = async () => {
      setLoading(true);
      try {
        // Build URL with query parameters
        const params = new URLSearchParams();
        if (challengeType) params.append('type', challengeType);
        if (timeFrame !== 'all') params.append('timeFrame', timeFrame);
        
        const url = `/api/challenges/leaderboard${params.toString() ? `?${params.toString()}` : ''}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.userRank);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilteredLeaderboard();
  }, [challengeType, timeFrame, initialLeaderboard, initialUserRank, isFiltered]);
  
  // Memoize challenge type icon to prevent re-renders
  const getChallengeTypeIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'code_golf': return <Zap className="h-4 w-4" />;
      case 'time_trial': return <Clock className="h-4 w-4" />;
      case 'memory_optimization': return <Cpu className="h-4 w-4" />;
      case 'debugging': return <Code className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  }, []);
  
  // Memoize the formatting function
  const formatChallengeType = useMemo(() => (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, []);
  
  // Calculate user stats safely
  const userWins = userRank?.stats?.challengesWon || 0;
  const userAttempts = userRank?.stats?.totalChallengesAttempted || 0;
  const userWinRate = userAttempts > 0 ? Math.round((userWins / userAttempts) * 100) : 0;
  
  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" asChild className="p-2">
          <Link href="/challenges">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenge Leaderboards</h1>
          <p className="text-muted-foreground">
            See how you rank against other coders in AI challenges
          </p>
        </div>
      </div>
      
      {/* User rank card */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <UserStatsSkeletons />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard 
                title="Your Rank" 
                value={userRank?.rank || 'N/A'} 
                suffix={userRank?.rank ? `/ ${leaderboard.length}` : undefined}
              />
              <StatCard title="Total Wins" value={userWins} />
              <StatCard title="Win Rate" value={`${userWinRate}%`} />
              <StatCard title="Challenges Attempted" value={userAttempts} />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select
          value={challengeType}
          onValueChange={setChallengeType}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Challenge Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Challenge Types</SelectItem>
            {challengeTypes.map(type => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  {getChallengeTypeIcon(type)}
                  <span>{formatChallengeType(type)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={timeFrame}
          onValueChange={setTimeFrame}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            {challengeType 
              ? `${formatChallengeType(challengeType)} Leaderboard` 
              : 'Global Leaderboard'
            }
            {timeFrame !== 'all' && (
              <Badge variant="outline" className="ml-2">
                {timeFrame === 'week' ? 'Past Week' : 'Past Month'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {challengeType 
              ? `Top performers in ${formatChallengeType(challengeType)} challenges` 
              : 'Top performers across all challenge types'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LeaderboardSkeletons />
          ) : leaderboard.length > 0 ? (
            <LeaderboardTable 
              leaderboard={leaderboard} 
              currentUserId={session?.user?.id} 
            />
          ) : (
            <EmptyLeaderboard />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Extracted components for better maintainability

function UserStatsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
}

function StatCard({ title, value, suffix }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardSkeletons() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

interface LeaderboardTableProps {
  leaderboard: TopPerformer[];
  currentUserId?: string | null;
}

function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="py-3 px-4 text-left font-medium">Rank</th>
            <th className="py-3 px-4 text-left font-medium">User</th>
            <th className="py-3 px-4 text-right font-medium">Wins</th>
            <th className="py-3 px-4 text-right font-medium">Win Rate</th>
            <th className="py-3 px-4 text-right font-medium">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === parseInt(currentUserId as string);
            
            return (
              <tr 
                key={index}
                className={`border-b ${isCurrentUser ? 'bg-blue-50' : ''} 
                  ${index < 3 ? 'bg-orange-50/30' : ''}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                    ) : index === 1 ? (
                      <Medal className="h-5 w-5 text-gray-400 mr-1" />
                    ) : index === 2 ? (
                      <Medal className="h-5 w-5 text-amber-600 mr-1" />
                    ) : (
                      <span className="w-6 text-center">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={isCurrentUser ? 'bg-blue-200' : ''}>
                        {entry.user?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {entry.user?.name || 'Anonymous'}
                        {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  {entry.challengesWon}
                </td>
                <td className="py-3 px-4 text-right">
                  {/* Use a placeholder for win rate or calculate if data is available */}
                  N/A
                </td>
                <td className="py-3 px-4 text-right">
                  {/* Use a placeholder for attempts */}
                  N/A
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyLeaderboard() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🏆</div>
      <h3 className="text-xl font-semibold mb-2">No leaderboard data yet</h3>
      <p className="text-muted-foreground mb-6">
        Be the first to compete in this challenge type!
      </p>
      <Button asChild>
        <Link href="/challenges">Browse Challenges</Link>
      </Button>
    </div>
  );
}