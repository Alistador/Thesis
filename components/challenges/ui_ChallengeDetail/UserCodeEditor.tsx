import React from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Language } from '@/types/challenges';

interface ResultData {
  winner: 'user' | 'ai' | 'tie';
  userMetrics: any;
  aiMetrics: any;
  aiSolution?: { code: string };
  attempt?: any;
}

interface UserCodeEditorProps {
  userCode: string;
  setUserCode: (code: string) => void;
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  languages: Language[];
  challengeStarted: boolean;
  result: ResultData | null;
  handleUserEditorDidMount: (editor: any) => void;
}

const UserCodeEditor: React.FC<UserCodeEditorProps> = ({ 
  userCode, 
  setUserCode, 
  selectedLanguage, 
  setSelectedLanguage, 
  languages, 
  challengeStarted, 
  result, 
  handleUserEditorDidMount 
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            Your Code
            <Select
              value={selectedLanguage?.id?.toString()}
              onValueChange={(value) => {
                if (challengeStarted) return; // Prevent changing language during challenge
                const lang = languages.find(l => l.id.toString() === value);
                if (lang) setSelectedLanguage(lang);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id.toString()}>
                    {lang.name} {lang.version && `(${lang.version})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* User status indicator */}
            {challengeStarted && (
              <Badge variant="outline" className="ml-2">
                Coding...
              </Badge>
            )}
          </CardTitle>
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
            value={userCode}
            onChange={(value) => setUserCode(value || '')}
            onMount={handleUserEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: !challengeStarted && result === null, // Editor is read-only until challenge starts
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCodeEditor;