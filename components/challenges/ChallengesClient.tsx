// /components/challenges/ChallengesClient.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clock, Zap, Cpu, Code, Search, Trophy, Brain, BarChart 
} from 'lucide-react';

// Import types from the types file
import { 
  Challenge, 
  ChallengeType, 
  UserStats, 
  TopPerformer,
  ChallengesClientProps
} from '@/types/challenges';

export default function ChallengesClient({ 
  session, 
  initialChallenges, 
  initialUserStats, 
  initialTopPerformers,
  initialChallengeTypes
}: ChallengesClientProps) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges || []);
  const [userStats, setUserStats] = useState<UserStats | null>(initialUserStats || null);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>(initialChallenges || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [challengeTypes, setChallengeTypes] = useState<string[]>(initialChallengeTypes || []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>(initialTopPerformers || []);

  // Filter challenges when search query, difficulty, or tab changes
  useEffect(() => {
    if (!challenges.length) return;
    
    let results = [...challenges];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(challenge => 
        challenge.title?.toLowerCase().includes(query) || 
        challenge.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      results = results.filter(challenge => 
        challenge.difficulty === selectedDifficulty
      );
    }
    
    // Filter by challenge type (tab)
    if (activeTab !== 'all') {
      results = results.filter(challenge => 
        challenge.challengeTypes.some(type => type.type === activeTab)
      );
    }
    
    setFilteredChallenges(results);
  }, [searchQuery, selectedDifficulty, activeTab, challenges]);

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'code_golf':
        return <Zap className="h-4 w-4" />;
      case 'time_trial':
        return <Clock className="h-4 w-4" />;
      case 'memory_optimization':
        return <Cpu className="h-4 w-4" />;
      case 'debugging':
        return <Code className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string | null | undefined) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'hard':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'expert':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const formatChallengeType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Challenges</h1>
          <p className="text-muted-foreground">
            Test your coding skills against AI in various challenge formats
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="text-right mr-2">
              <div className="font-medium">{session.user?.name || 'User'}</div>
              <div className="text-sm text-muted-foreground">
                Rank: {userStats?.rank || 'N/A'}
              </div>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {(session.user?.name?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Challenge Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : challenges.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Wins</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : userStats?.challengesWon || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : userStats?.totalChallengesAttempted ? (
                `${Math.round((userStats.challengesWon / userStats.totalChallengesAttempted) * 100)}%`
              ) : (
                '0%'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : userStats?.updatedAt ? (
                `Last attempt: ${new Date(userStats.updatedAt).toLocaleDateString()}`
              ) : (
                'No recent activity'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search challenges..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Challenge Type Tabs */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="mb-4 flex h-auto flex-wrap">
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          {challengeTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-1">
              {getChallengeTypeIcon(type)}
              {formatChallengeType(type)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Challenge Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{challenge.title || 'Untitled'}</CardTitle>
                      {challenge.difficulty && (
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {challenge.challengeTypes.map((type) => (
                        <Badge key={type.id} variant="outline" className="flex items-center gap-1">
                          {getChallengeTypeIcon(type.type)}
                          {formatChallengeType(type.type)}
                        </Badge>
                      ))}
                    </div>
                    <CardDescription className="mt-2 line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {challenge.stats && challenge.stats[0] && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Success Rate:</div>
                        <div>{challenge.stats[0].successRate}%</div>
                        <div>Attempts:</div>
                        <div>{challenge.stats[0].attempts}</div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/challenges/${challenge.id}`}>
                        Start Challenge
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </TabsContent>

        {/* Additional TabsContent for each challenge type */}
        {challengeTypes.map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {getChallengeTypeIcon(type)}
                {formatChallengeType(type)} Challenges
              </h2>
              <p className="text-muted-foreground">
                {type === 'code_golf' && 'Write the shortest possible code to solve the problem.'}
                {type === 'time_trial' && 'Create the fastest executing solution possible.'}
                {type === 'memory_optimization' && 'Optimize your code to use minimal memory.'}
                {type === 'debugging' && 'Find and fix bugs in the provided code.'}
              </p>
            </div>
            
            {/* Challenge cards filtered by type - same rendering logic as "all" */}
            {filteredChallenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{challenge.title || 'Untitled'}</CardTitle>
                        {challenge.difficulty && (
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2 line-clamp-2">
                        {challenge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {challenge.stats && challenge.stats[0] && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Success Rate:</div>
                          <div>{challenge.stats[0].successRate}%</div>
                          <div>Attempts:</div>
                          <div>{challenge.stats[0].attempts}</div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/challenges/${challenge.id}`}>
                          Start Challenge
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No challenges found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Top Performers Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </h2>
        
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(performer.user?.name?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{performer.user?.name || 'Anonymous'}</div>
                        <div className="text-sm text-muted-foreground">
                          {performer.challengesWon} wins
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
            
            <div className="mt-6">
              <Button variant="outline" asChild className="w-full">
                <Link href="/challenges/leaderboard">
                  View Full Leaderboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}