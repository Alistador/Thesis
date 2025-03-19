"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Volume2, ChevronDown, Maximize2, Minimize2, CheckCircle, AlertCircle, Info, BookOpen } from "lucide-react";
import { useErrorToast } from "@/components/errorMessage/ErrorToastContext";

// Import our modular components
import InstructionsPanel from "./InstructionsPanel";
import { HorizontalResizeHandle } from "./ResizeHandle";
import OutputPanel from "./OutputPanel";
import AIChat from "@/components/ai/AIchat";
import EditorSidebar from "./EditorSidebar";
import GuidedTutorial from "./GuidedTutorial";
import { useTutorial } from "./tutorialService";

interface CodeEditorProps {
  defaultCode?: string;
  initialCode?: string; // Previously submitted code if available
  languageId?: number;
  journeySlug?: string; // Added journey slug for integration
  levelId?: number | null; // Added level ID for integration
  title?: string;
  description?: string;
  difficulty?: string;
  expectedOutput?: string;
  hints?: string[]; // Added hints
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>; // Added test cases
  testResult?: "pending" | "success" | "failure" | null;
  setTestResult?: (result: "pending" | "success" | "failure" | null) => void;
  onCodeSuccess?: (code: string) => void; // Added callback for successful code execution
  backUrl?: string; // URL to navigate back to
  tutorialId?: string; // ID of the tutorial to show for this challenge
  autoShowTutorial?: boolean; // Whether to show tutorial automatically on first visit
  solutionCode?: string; // Solution code to show in the instructions panel
}

export default function ModularCodeEditor({
  defaultCode = 'print("Hello Python!")',
  initialCode, // Use previously submitted code if available
  languageId = 28, // Python 3.10
  journeySlug,
  levelId = null,
  title = "The Language",
  description = "Python is one of the world's easiest and most popular programming languages.",
  difficulty = "Beginner",
  expectedOutput = "Hello Python!",
  hints = [],
  testCases = [],
  testResult = null,
  setTestResult,
  onCodeSuccess,
  backUrl = "/dashboard",
  tutorialId = "editor-intro", // Default tutorial ID
  autoShowTutorial = true, // Show tutorial by default
  solutionCode,
}: CodeEditorProps) {
  // Use initialCode if available, otherwise fallback to defaultCode
  const [code, setCode] = useState(initialCode || defaultCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcases" | "console">("testcases");
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [outputPanelHeight, setOutputPanelHeight] = useState(220); // Default height
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [showStatusIndicator, setShowStatusIndicator] = useState(false);
  const [hasRunCode, setHasRunCode] = useState<boolean>(false);

  // AI chat state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Get tutorial state and handlers
  const {
    isTutorialOpen,
    currentTutorialSteps,
    hasSeenTutorial,
    openTutorial,
    closeTutorial,
    completeTutorial
  } = useTutorial(tutorialId);

  // Access the error toast context
  const { clearError } = useErrorToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset code if initialCode or defaultCode changes
  useEffect(() => {
    setCode(initialCode || defaultCode);
  }, [initialCode, defaultCode]);
  
  // Show tutorial automatically on first visit if enabled
  useEffect(() => {
    if (autoShowTutorial && !hasSeenTutorial && tutorialId) {
      const timer = setTimeout(() => {
        openTutorial(tutorialId);
      }, 800); // Slight delay to let UI render first
      
      return () => clearTimeout(timer);
    }
  }, [autoShowTutorial, hasSeenTutorial, tutorialId, openTutorial]);

  // Updated height management effect
  useEffect(() => {
    const updateHeights = () => {
      if (!containerRef.current || !editorContainerRef.current) return;

      const viewportHeight = window.innerHeight;
      const headerHeight = 60; // Adjust based on actual header size
      const tabHeaderHeight = 40;
      const collapsedOutputHeight = 40; // When collapsed

      // If collapsed, use the small height; otherwise, use the full output height
      const currentOutputHeight = isOutputCollapsed
        ? collapsedOutputHeight
        : outputPanelHeight;

      // Calculate the available height for the editor
      const availableHeight =
        viewportHeight - headerHeight - tabHeaderHeight - currentOutputHeight;

      // Ensure a minimum editor height
      const minEditorHeight = 200; // Adjust as needed
      const finalEditorHeight = Math.max(availableHeight, minEditorHeight);

      // Apply height dynamically
      editorContainerRef.current.style.height = `${finalEditorHeight}px`;

      // Adjust output panel height if needed
      if (!isOutputCollapsed) {
        const maxOutputHeight = Math.floor(viewportHeight * 0.4);
        if (outputPanelHeight > maxOutputHeight) {
          setOutputPanelHeight(maxOutputHeight);
        }
      }
    };

    updateHeights();
    window.addEventListener("resize", updateHeights);
    return () => window.removeEventListener("resize", updateHeights);
  }, [isOutputCollapsed, outputPanelHeight]);

  // Function to show status message with auto-dismiss
  const showStatusMessageWithTimeout = (message: string, duration = 5000) => {
    // Clear any existing timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    
    setStatusMessage(message);
    setShowStatusIndicator(true);
    
    // Set new timeout to hide the message
    statusTimeoutRef.current = setTimeout(() => {
      setShowStatusIndicator(false);
    }, duration);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);
  
  // Update status message when test result changes to pending
  useEffect(() => {
    if (testResult === "pending") {
      showStatusMessageWithTimeout("Running tests...", 10000); // Longer timeout for pending state
    } else if (testResult === null) {
      setStatusMessage("");
      setShowStatusIndicator(false);
    }
    // Success and failure cases are handled directly in the executeCode function
  }, [testResult]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    showStatusMessageWithTimeout("Running your code...", 10000);
    setHasRunCode(true);
    
    // Clear any existing error messages
    clearError();
    
    // Update test result state if available
    if (setTestResult) {
      setTestResult("pending");
    }

    // Expand output panel if it's collapsed when running code
    if (isOutputCollapsed) {
      setIsOutputCollapsed(false);
    }
    
    // Switch to console tab to show live feedback
    setActiveTab("console");

    try {
      // Build request payload
      const payload: any = {
        code,
        language_id: languageId,
      };
      
      // Add optional parameters if they exist
      if (journeySlug) payload.journey_slug = journeySlug;
      if (levelId) payload.level_id = levelId;

      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        showStatusMessageWithTimeout("Error executing code");
        throw new Error(data.error || "Something went wrong");
      }

      setOutput(data.result.stdout || "No output");
      
      // Handle errors
      if (data.result.stderr || data.result.compile_output) {
        setError(
          data.result.stderr
            ? `❌ Runtime Error:\n${data.result.stderr}`
            : `⚠️ Compilation Error:\n${data.result.compile_output}`
        );
        
        showStatusMessageWithTimeout("Code execution failed. Check the console for details.");
        
        // Update test result if available
        if (setTestResult) {
          setTestResult("failure");
        }
        
        // Switch to console to show the error
        setActiveTab("console");
        return;
      }
      
      // Check if overall test was successful
      if (data.success) {
        // If success callback provided, call it
        if (onCodeSuccess) {
          onCodeSuccess(code);
        }
        
        // Update test result if available
        if (setTestResult) {
          setTestResult("success");
        }
        
        // Show success message with auto-dismiss
        showStatusMessageWithTimeout("All tests passed! Great job!");
        
        // Switch to test cases tab to show the results
        setActiveTab("testcases");
      } else {
        // Update test result if available
        if (setTestResult) {
          setTestResult("failure");
        }
        
        // Show failure message with auto-dismiss
        showStatusMessageWithTimeout("Some tests failed. Check the test cases for details.");
        
        // Switch to test cases tab to show the failures
        setActiveTab("testcases");
      }
      
    } catch (error: any) {
      setError(`Error: ${error.message}`);
      showStatusMessageWithTimeout(`Error: ${error.message}`);
      
      // Update test result if available
      if (setTestResult) {
        setTestResult("failure");
      }
    } finally {
      setIsRunning(false);
    }
  };

  // AI chat handler
  const handleAIChatClick = () => {
    setIsAIChatOpen(true);
  };
  
  // Tutorial handler
  const handleShowTutorial = () => {
    openTutorial(tutorialId);
  };
  
  // Get language name based on languageId
  const getLanguageName = (id: number) => {
    switch (id) {
      case 28: // Python 3
        return "Python";
      case 63: // JavaScript
        return "JavaScript";
      case 62: // Java
        return "Java";
      case 71: // HTML
        return "HTML";
      default:
        return "Code";
    }
  };
  
  // Get editor language based on languageId
  const getEditorLanguage = (id: number) => {
    switch (id) {
      case 28: // Python 3
        return "python";
      case 63: // JavaScript
        return "javascript";
      case 62: // Java
        return "java";
      case 71: // HTML
        return "html";
      default:
        return "python";
    }
  };

  return (
    <div
      className="mt-0 h-screen w-full flex relative overflow-hidden"
      ref={containerRef}
    >
      {/* Left Sidebar */}
      <EditorSidebar 
        onShowTutorial={handleShowTutorial} 
        backUrl={backUrl} 
      />
      
      {/* Instructions Panel */}
      <InstructionsPanel
        title={title}
        description={description}
        difficulty={difficulty}
        width={leftPanelWidth}
        hints={hints}
        testResult={testResult}
        solutionCode={solutionCode}
      />

      {/* Resize Handle */}
      <HorizontalResizeHandle
        position={leftPanelWidth}
        onResize={setLeftPanelWidth}
        containerRef={containerRef}
      />

      {/* Right Editor Panel */}
      <div
        className="flex-1 flex flex-col h-full overflow-hidden"
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        {/* Language Selector */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white border-b border-gray-700">
          <div className="flex items-center">
            <span>{getLanguageName(languageId)}</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleShowTutorial}
              className="p-1 text-gray-400 hover:text-white"
              title="Show Tutorial"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white">
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div ref={editorContainerRef} className="relative flex-grow">
          <Editor
            height="100%"
            language={getEditorLanguage(languageId)}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: "on",
              renderLineHighlight: "all",
              fontFamily: "monospace",
            }}
          />

          {/* Status indicator */}
          {showStatusIndicator && statusMessage && (
            <div 
              className={`absolute top-4 right-4 px-3 py-2 rounded-md shadow-lg flex items-center text-sm ${
                testResult === "success" ? 'bg-green-600' : 
                testResult === "failure" ? 'bg-red-600' : 
                'bg-blue-600'
              } text-white transition-opacity duration-300 ease-in-out`}
            >
              {testResult === "success" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : testResult === "failure" ? (
                <AlertCircle className="w-4 h-4 mr-2" />
              ) : (
                <Info className="w-4 h-4 mr-2" />
              )}
              {statusMessage}
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={handleAIChatClick}
              className="px-4 py-2 bg-gray-700 text-white rounded shadow-lg flex items-center hover:bg-gray-600"
            >
              <span className="mr-2">💬</span> Ask AI
            </button>
            <button
              onClick={executeCode}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow-lg flex items-center hover:bg-blue-700 disabled:opacity-75 disabled:hover:bg-blue-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div
          className="border-t border-gray-700 bg-gray-900 text-white transition-height duration-300 ease-in-out"
          style={{
            height: isOutputCollapsed ? "40px" : `${outputPanelHeight}px`,
            overflow: isOutputCollapsed ? "hidden" : "visible", // Prevent content from pushing down
          }}
        >
          {/* Tab Headers */}
          <div className="flex items-center border-b border-gray-700 bg-gray-800">
            <button
              onClick={() => setActiveTab("testcases")}
              className={`px-4 py-2 text-sm ${
                activeTab === "testcases"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              TEST CASES {testResult === "success" && <span className="ml-1 text-green-400">✓</span>}
              {testResult === "failure" && <span className="ml-1 text-red-400">✗</span>}
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-4 py-2 text-sm ${
                activeTab === "console"
                  ? "border-b-2 border-blue-500 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              CONSOLE {error && <span className="ml-1 text-red-400">!</span>}
            </button>
            <div className="ml-auto px-4">
              <button
                onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
                className="hover:text-white"
              >
                {isOutputCollapsed ? (
                  <Maximize2 className="w-4 h-4 text-gray-400 hover:text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-gray-400 hover:text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Output Content */}
          {!isOutputCollapsed && (
            <div className="h-[calc(100%-38px)]">
              <OutputPanel
                activeTab={activeTab}
                output={output}
                expectedOutput={expectedOutput}
                error={error}
                isRunning={isRunning}
                testCases={testCases}
                testResult={testResult}
              />
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
      {isAIChatOpen && (
        <AIChat code={code} onClose={() => setIsAIChatOpen(false)} />
      )}
      
      {/* Guided Tutorial */}
      {isTutorialOpen && (
        <GuidedTutorial
          isOpen={isTutorialOpen}
          onClose={closeTutorial}
          onComplete={completeTutorial}
          steps={currentTutorialSteps}
          lessonTitle={title}
          allowSkip={true}
        />
      )}
    </div>
  );
}