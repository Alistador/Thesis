// TutorialService.ts
import { useState, useEffect } from 'react';

export interface TutorialStep {
  title?: string;
  content: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  targetElement?: string;
  highlightSize?: { width: number; height: number };
  highlightOffset?: { top: number; left: number };
}

// Define tutorial steps for different parts of the editor
const editorTutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to the lesson environment!",
    content: "This guided tutorial will help you understand how to use the code editor. Click Next to continue.",
    position: "center"
  },
  {
    title: "Instructions Panel",
    content: "This panel contains information about the lesson. It explains concepts and provides instructions for completing the coding task.",
    targetElement: "div[class*='bg-white'][class*='border-r'][class*='p-6']", 
    position: "right"
  },
  {
    title: "Challenge Information",
    content: "Here you can see the difficulty level of the challenge and what you need to do.",
    targetElement: "div.mb-6:has(span.text-lg)",
    position: "right",
    highlightSize: { width: 400, height: 100 }
  },
  {
    title: "Hints Section",
    content: "If you get stuck, you can expand this section to see helpful hints. Click on it to toggle hints visibility.",
    targetElement: "button:has(span.text-lg:contains('🔍'))",
    position: "right"
  },
  {
    title: "Solution Section",
    content: "After you've tried to solve the problem, you can check the solution here to learn the correct approach.",
    targetElement: "div.mb-6:has(span.text-lg:contains('🎯'))",
    position: "right"
  },
  {
    title: "Code Editor",
    content: "This is where you'll write your code. The editor highlights syntax and provides helpful formatting.",
    targetElement: ".monaco-editor",
    position: "left",
    highlightOffset: { top: 0, left: 0 }
  },
  {
    title: "Write your code here",
    content: "Type your solution in the editor. For this exercise, you need to replace the '?' with a value.",
    targetElement: ".monaco-editor .view-line:nth-child(2)",
    position: "bottom",
    highlightSize: { width: 200, height: 20 }
  },
  {
    title: "Run Code Button",
    content: "Click this button to execute your code and see the output.",
    targetElement: "button.bg-blue-600:has(svg[data-lucide='Play'])",
    position: "left",
    highlightSize: { width: 120, height: 40 }
  },
  {
    title: "Ask AI",
    content: "Need help? Click here to ask the AI assistant for guidance on your code.",
    targetElement: "button:contains('Ask AI')",
    position: "left"
  },
  {
    title: "Test Cases",
    content: "This tab will show you if your code passes the required tests.",
    targetElement: "button:contains('TEST CASES')",
    position: "top"
  },
  {
    title: "Console Output",
    content: "The console shows the output of your code and any errors that might occur.",
    targetElement: "button:contains('CONSOLE')",
    position: "top"
  },
  {
    title: "Happy Coding!",
    content: "You're all set! Complete the task by writing the correct code and running it to see the results.",
    position: "center"
  }
];

// Define tutorial steps for the Python variables lesson
const pythonVariablesTutorialSteps: TutorialStep[] = [
  {
    title: "Learning Python Variables",
    content: "In this lesson, you'll learn about variables in Python and how to use them.",
    position: "center"
  },
  {
    title: "Variables Introduction",
    content: "Variables are containers that hold data values. They are used to store, manipulate, and display information.",
    targetElement: "div[class*='bg-white'][class*='border-r'][class*='p-6'] p.mb-6",
    position: "right"
  },
  {
    title: "Challenge",
    content: "In this exercise, you need to understand how to declare and initialize variables in Python.",
    targetElement: "div.mb-6:has(span.text-lg)",
    position: "right",
    highlightSize: { width: 400, height: 100 }
  },
  {
    title: "Code Editor",
    content: "You'll need to replace the '?' with a value to complete the exercise.",
    targetElement: ".monaco-editor .view-line:nth-child(2)",
    position: "left"
  },
  {
    title: "Running Your Code",
    content: "Once you've replaced the '?' with a value, click the Run Code button to test your solution.",
    targetElement: "button.bg-blue-600:has(svg[data-lucide='Play'])",
    position: "left",
    highlightSize: { width: 120, height: 40 }
  },
  {
    title: "Expected Output",
    content: "Your goal is to make the output match the expected output shown in the test cases.",
    targetElement: "div:contains('Expected Output')",
    position: "top",
    highlightSize: { width: 300, height: 60 }
  },
  {
    title: "Happy Coding!",
    content: "You're now ready to solve Python variable challenges! Experiment with different values and see how they affect your code output.",
    position: "center"
  }
];

// Specific tutorial for the Numbers lesson
const pythonNumbersTutorialSteps: TutorialStep[] = [
  {
    title: "Python Numbers",
    content: "In this lesson, you'll learn about different types of numbers in Python.",
    position: "center"
  },
  {
    title: "Number Types",
    content: "Python supports different types of numbers, including integers (whole numbers) and floats (decimal numbers).",
    targetElement: "div[class*='bg-white'][class*='border-r'][class*='p-6'] p.mb-6",
    position: "right"
  },
  {
    title: "Integer Example",
    content: "Integers are whole numbers without decimals. For example: 1, 42, -10.",
    targetElement: "div[class*='bg-white'][class*='border-r'][class*='p-6'] pre:contains('int')",
    position: "right",
    highlightSize: { width: 300, height: 40 }
  },
  {
    title: "Float Example",
    content: "Floats are numbers with decimal points. For example: 3.14, 0.5, -2.75.",
    targetElement: "div[class*='bg-white'][class*='border-r'][class*='p-6'] pre:contains('float')",
    position: "right",
    highlightSize: { width: 300, height: 40 }
  },
  {
    title: "Your Task",
    content: "Replace the '?' with a number value to assign to the variable.",
    targetElement: ".monaco-editor .view-line:nth-child(2)",
    position: "left"
  },
  {
    title: "Run Your Code",
    content: "After entering a number, run your code to see if it works correctly.",
    targetElement: "button.bg-blue-600:has(svg[data-lucide='Play'])",
    position: "left",
    highlightSize: { width: 120, height: 40 }
  },
  {
    title: "Happy Coding!",
    content: "You're now ready to work with numbers in Python! Try experimenting with different numeric values and mathematical operations.",
    position: "center"
  }
];

// More lesson-specific tutorials can be added here

export interface TutorialMap {
  [key: string]: TutorialStep[];
}

// Map of tutorials by their ID
const tutorialMap: TutorialMap = {
  'editor-intro': editorTutorialSteps,
  'python-variables': pythonVariablesTutorialSteps,
  'python-numbers': pythonNumbersTutorialSteps,
  // Add more tutorials as needed
};

// Custom hook to manage tutorial state
export const useTutorial = (defaultTutorialId: string = '') => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentTutorialId, setCurrentTutorialId] = useState(defaultTutorialId);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  
  // Get steps for current tutorial
  const currentTutorialSteps = currentTutorialId ? tutorialMap[currentTutorialId] || [] : [];
  
  // Check if user has seen this tutorial before
  useEffect(() => {
    if (currentTutorialId) {
      const seenTutorials = localStorage.getItem('seenTutorials');
      if (seenTutorials) {
        const seenList = JSON.parse(seenTutorials);
        setHasSeenTutorial(seenList.includes(currentTutorialId));
      }
    }
  }, [currentTutorialId]);
  
  // Mark tutorial as seen
  const markTutorialAsSeen = () => {
    if (currentTutorialId) {
      const seenTutorials = localStorage.getItem('seenTutorials');
      let seenList = seenTutorials ? JSON.parse(seenTutorials) : [];
      
      if (!seenList.includes(currentTutorialId)) {
        seenList.push(currentTutorialId);
        localStorage.setItem('seenTutorials', JSON.stringify(seenList));
      }
      
      setHasSeenTutorial(true);
    }
  };
  
  // Open a specific tutorial
  const openTutorial = (tutorialId: string) => {
    if (tutorialMap[tutorialId]) {
      setCurrentTutorialId(tutorialId);
      setIsTutorialOpen(true);
    } else {
      console.error(`Tutorial with ID "${tutorialId}" not found`);
    }
  };
  
  // Close the tutorial
  const closeTutorial = () => {
    setIsTutorialOpen(false);
  };
  
  // Complete the tutorial
  const completeTutorial = () => {
    markTutorialAsSeen();
    setIsTutorialOpen(false);
  };
  
  return {
    isTutorialOpen,
    currentTutorialSteps,
    hasSeenTutorial,
    openTutorial,
    closeTutorial,
    completeTutorial
  };
};

export default tutorialMap;