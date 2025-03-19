'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DailyChallengeClientProps {
  session: any;
  existingChallengeId?: string;
  lastAttemptedAt?: Date;
}

export default function DailyChallengeClient({ 
  session, 
  existingChallengeId, 
  lastAttemptedAt 
}: DailyChallengeClientProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateChallenge = async () => {
    try {
      setIsGenerating(true);
      
      if (existingChallengeId) {
        // If user already has a daily challenge, redirect to it
        router.push(`/challenges/${existingChallengeId}`);
        return;
      }
      
      // Request a new daily challenge
      const response = await fetch('/api/challenges/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate daily challenge');
      }
      
      const data = await response.json();
      
      if (data.challengeId) {
        // Redirect to the challenge page
        router.push(`/challenges/${data.challengeId}`);
      } else {
        throw new Error('No challenge ID in response');
      }
    } catch (error) {
      console.error('Error generating daily challenge:', error);
      alert('Failed to generate daily challenge. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not attempted yet';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daily Coding Challenge</h1>
      
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>Challenge of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Test your coding skills with a new AI-generated challenge every day. 
            Daily challenges are tailored to your skill level and help you improve consistently.
          </p>
          
          {existingChallengeId && (
            <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-200">
              <p className="text-green-800 font-medium">
                You already have a daily challenge for today!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Last attempted: {formatDate(lastAttemptedAt)}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateChallenge} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingChallengeId ? 'Continue Today\'s Challenge' : 'Generate Daily Challenge'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mt-6 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>Benefits of Daily Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>AI-generated challenges that adapt to your skill level</li>
            <li>Build consistency with a new challenge every day</li>
            <li>Track your progress and improvement over time</li>
            <li>Practice a variety of programming concepts and patterns</li>
            <li>Compete with the AI to improve your problem-solving speed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}