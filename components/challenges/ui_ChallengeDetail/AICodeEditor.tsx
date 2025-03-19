import React from 'react';
import { Editor } from '@monaco-editor/react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Language } from '@/types/challenges';

interface AICodeEditorProps {
  aiCode: string;
  selectedLanguage: Language;
  aiIsThinking: boolean;
  aiCompletionTime: number | null;
  formatTime: (seconds: number) => string;
  challengeStarted: boolean;
  aiProgress: number;
  handleAiEditorDidMount: (editor: any) => void;
}

const AICodeEditor: React.FC<AICodeEditorProps> = ({ 
  aiCode, 
  selectedLanguage, 
  aiIsThinking, 
  aiCompletionTime, 
  formatTime, 
  challengeStarted, 
  aiProgress, 
  handleAiEditorDidMount 
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              AI Code
              {aiIsThinking && (
                <Badge variant="outline" className="ml-2 animate-pulse">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> 
                  Coding...
                </Badge>
              )}
              {aiCompletionTime !== null && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" /> 
                  Done in {formatTime(aiCompletionTime)}
                </Badge>
              )}
            </CardTitle>
          </div>
          
          {/* AI Progress Bar */}
          {challengeStarted && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${aiProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${aiProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div className="border rounded-md h-[400px] overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage={
              selectedLanguage?.name?.toLowerCase().includes('python')
                ? 'python'
                : selectedLanguage?.name?.toLowerCase().includes('javascript')
                ? 'javascript'
                : 'python'
            }
            value={aiCode}
            onMount={handleAiEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AICodeEditor;