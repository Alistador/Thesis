"use client";

import React from "react";
import { Clipboard, CheckCircle, XCircle } from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface TestCasesViewProps {
  output: string;
  expectedOutput: string;
  isRunning: boolean;
  testCases?: TestCase[];
  testResult?: "pending" | "success" | "failure" | null;
}

interface ConsoleViewProps {
  output: string;
  error: string;
  isRunning: boolean;
}

interface OutputPanelProps {
  activeTab: "testcases" | "console";
  output: string;
  expectedOutput?: string;
  error?: string;
  isRunning: boolean;
  testCases?: TestCase[];
  testResult?: "pending" | "success" | "failure" | null;
}

// Console View Component
const ConsoleView = ({ output, error, isRunning }: ConsoleViewProps) => {
  const formatConsoleOutput = (text: string) => {
    if (!text) return "";

    // Split by newlines and add console prompt to each line
    return text
      .split("\n")
      .map((line, index) => `> ${line}`)
      .join("\n");
  };

  return (
    <div className="p-4 h-full overflow-auto bg-gray-900">
      <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
        {isRunning ? "> Running..." : formatConsoleOutput(output) || "> Ready"}
      </pre>
      {error && (
        <pre className="text-sm text-red-400 font-mono mt-2 whitespace-pre-wrap">
          {error}
        </pre>
      )}
    </div>
  );
};

// Test Cases View Component
const TestCasesView = ({
  output,
  expectedOutput,
  isRunning,
  testCases,
  testResult
}: TestCasesViewProps) => {
  const formatConsoleOutput = (text: string) => {
    if (!text) return "";

    // Split by newlines and add console prompt to each line
    return text
      .split("\n")
      .map((line, index) => `> ${line}`)
      .join("\n");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-700 bg-gray-800">
        <div className="w-1/2 p-2 text-gray-400 text-sm">Output</div>
        <div className="w-1/2 p-2 text-gray-400 text-sm border-l border-gray-700">
          Expected Output
        </div>
      </div>

      <div className="flex flex-1 overflow-auto">
        <div className="w-1/2 p-4 relative bg-gray-900">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
            {isRunning
              ? "> Running..."
              : formatConsoleOutput(output) || "> Run your code to see output"}
          </pre>
          
          {/* Show result indicator */}
          {testResult && !isRunning && (
            <div className="absolute top-2 right-2">
              {testResult === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : testResult === "failure" ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          )}
        </div>

        <div className="w-1/2 p-4 bg-gray-850 border-l border-gray-700">
          <pre className="text-sm text-yellow-400 font-mono whitespace-pre-wrap">
            {expectedOutput || "No expected output defined"}
          </pre>
        </div>
      </div>
      
      {/* Test Cases Panel - shown if test cases are available */}
      {testCases && testCases.length > 0 && (
        <div className="border-t border-gray-700">
          <div className="p-2 bg-gray-800 text-gray-400 text-sm">
            Test Cases
          </div>
          <div className="max-h-40 overflow-y-auto bg-gray-900">
            {testCases.map((testCase, index) => (
              <div 
                key={index}
                className="p-3 border-b border-gray-800 flex items-start"
              >
                <div className="flex-grow">
                  <div className="text-sm text-gray-300 mb-1">
                    {testCase.description}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold">Input:</span> {testCase.input || "None"}
                  </div>
                  <div className="text-xs text-gray-400">
                    <span className="font-semibold">Expected:</span> {testCase.expectedOutput}
                  </div>
                </div>
                
                {/* Status indicator for this test case */}
                <div className="ml-2">
                  {testResult === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : testResult === "failure" ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function OutputPanel({
  activeTab,
  output,
  expectedOutput = "",
  error = "",
  isRunning,
  testCases = [],
  testResult
}: OutputPanelProps) {
  const copyOutputToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col h-full relative">
      <button
        onClick={copyOutputToClipboard}
        className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
        title="Copy output"
      >
        <Clipboard className="w-4 h-4" />
      </button>

      {activeTab === "testcases" && (
        <TestCasesView
          output={output}
          expectedOutput={expectedOutput}
          isRunning={isRunning}
          testCases={testCases}
          testResult={testResult}
        />
      )}

      {activeTab === "console" && (
        <ConsoleView output={output} error={error} isRunning={isRunning} />
      )}
    </div>
  );
}