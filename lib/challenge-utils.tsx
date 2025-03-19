// lib/challenge-utils.tsx

/**
 * Utility functions for challenge components
 */
// Import the icons directly
import { Brain, Clock, Code, Cpu, Zap } from 'lucide-react';

/**
 * Returns the appropriate icon for a challenge type
 * Note: We're using .tsx extension for this file since it contains JSX
 */
export const getChallengeTypeIcon = (type: string): React.ReactElement  => {
  switch (type) {
    case 'code_golf': return <Zap className="h-5 w-5" />;
    case 'time_trial': return <Clock className="h-5 w-5" />;
    case 'memory_optimization': return <Cpu className="h-5 w-5" />;
    case 'debugging': return <Code className="h-5 w-5" />;
    default: return <Brain className="h-5 w-5" />;
  }
};

/**
 * Formats a challenge type name (e.g., "code_golf" -> "Code Golf")
 */
export const formatChallengeType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Returns the appropriate color for a difficulty level
 */
export const getDifficultyColor = (difficulty: string | null): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'hard': return 'bg-red-100 text-red-800';
    case 'expert': return 'bg-purple-100 text-purple-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

/**
 * Formats time in seconds to MM:SS display
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};