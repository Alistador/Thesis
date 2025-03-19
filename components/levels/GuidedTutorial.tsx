import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  title?: string;
  content: string;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  targetElement?: string; // CSS selector for the element to highlight
  highlightSize?: { width: number, height: number }; // Optional custom highlight size
  highlightOffset?: { top: number, left: number }; // Optional offset for the highlight
  index: number;
  totalSteps: number;
}

interface GuidedTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: Omit<TutorialStep, 'index' | 'totalSteps'>[];
  lessonTitle?: string;
  allowSkip?: boolean;
}

const GuidedTutorial: React.FC<GuidedTutorialProps> = ({
  isOpen,
  onClose,
  onComplete,
  steps,
  lessonTitle = "Learn a short lesson",
  allowSkip = true,
}) => {
  // Remove limit on steps to support 6 steps (changed from "slice(0, 5)" to use all steps)
  const limitedSteps = steps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const totalSteps = limitedSteps.length;
  const currentStep = {
    ...limitedSteps[currentStepIndex],
    index: currentStepIndex + 1,
    totalSteps
  };

  // Handle tutorial visibility
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateHighlightPosition();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Update highlight position whenever step changes
  useEffect(() => {
    if (isVisible) {
      updateHighlightPosition();
    }
  }, [currentStepIndex, isVisible]);

  // Also update on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        updateHighlightPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  // Helper function to find elements with complex selectors
  const findElement = (selector: string): Element | null => {
    try {
      // Direct querySelector if no special cases
      if (!selector.includes(':has(') && !selector.includes(':contains(')) {
        return document.querySelector(selector);
      }
  
      // Handle `:contains('🔍')`
      if (selector.includes(':contains(')) {
        const match = selector.match(/(.+?):contains\('(.+?)'\)/);
        if (match) {
          const [, baseSelector, textContent] = match;
          const elements = document.querySelectorAll(baseSelector);
  
          for (const el of elements) {
            if (el.textContent?.includes(textContent)) {
              return el;
            }
          }
        }
      }
  
      // Handle `:has(span.text-lg:contains('🔍'))`
      if (selector.includes(':has(')) {
        const match = selector.match(/(.+?):has\((.+?)\)/);
        if (match) {
          const [, baseSelector, childSelector] = match;
          const baseElements = document.querySelectorAll(baseSelector);
  
          for (const el of baseElements) {
            if (el.querySelector(childSelector)) {
              return el;
            }
          }
        }
      }
  
      return null;
    } catch (error) {
      console.error(`Invalid selector: ${selector}`, error);
      return null;
    }
  };
  

  const updateHighlightPosition = () => {
    const step = limitedSteps[currentStepIndex];
    
    if (!step.targetElement) {
      // Center in screen if no target
      setHighlightPosition({ top: 0, left: 0, width: 0, height: 0 });
      setPopupPosition({ 
        top: window.innerHeight / 2 - 100, 
        left: window.innerWidth / 2 - 200 
      });
      return;
    }
    
    const targetEl = findElement(step.targetElement);
    
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const highlightWidth = step.highlightSize?.width || rect.width + 20;
      const highlightHeight = step.highlightSize?.height || rect.height + 20;
      
      // Apply any offset defined in the step
      const offsetTop = step.highlightOffset?.top || 0;
      const offsetLeft = step.highlightOffset?.left || 0;
      
      // Set highlight position
      setHighlightPosition({
        top: rect.top - 10 + offsetTop + window.scrollY,
        left: rect.left - 10 + offsetLeft + window.scrollX,
        width: highlightWidth,
        height: highlightHeight
      });
      
      // Calculate popup position based on step.position
      const popupWidth = 400;
      const popupHeight = 180;
      let top, left;
      
      switch(step.position || 'bottom') {
        case 'top':
          top = rect.top - popupHeight - 20 + window.scrollY;
          left = rect.left + (rect.width / 2) - (popupWidth / 2) + window.scrollX;
          break;
        case 'bottom':
          top = rect.bottom + 20 + window.scrollY;
          left = rect.left + (rect.width / 2) - (popupWidth / 2) + window.scrollX;
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (popupHeight / 2) + window.scrollY;
          left = rect.left - popupWidth - 20 + window.scrollX;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (popupHeight / 2) + window.scrollY;
          left = rect.right + 20 + window.scrollX;
          break;
        case 'top-left':
          top = rect.top - popupHeight - 20 + window.scrollY;
          left = rect.left + window.scrollX;
          break;
        case 'top-right':
          top = rect.top - popupHeight - 20 + window.scrollY;
          left = rect.right - popupWidth + window.scrollX;
          break;
        case 'bottom-left':
          top = rect.bottom + 20 + window.scrollY;
          left = rect.left + window.scrollX;
          break;
        case 'bottom-right':
          top = rect.bottom + 20 + window.scrollY;
          left = rect.right - popupWidth + window.scrollX;
          break;
        default: // center or invalid position
          top = rect.top + (rect.height / 2) - (popupHeight / 2) + window.scrollY;
          left = rect.left + (rect.width / 2) - (popupWidth / 2) + window.scrollX;
      }
      
      // Ensure popup stays within viewport bounds
      if (left < 20) left = 20;
      if (left + popupWidth > window.innerWidth - 20) 
        left = window.innerWidth - popupWidth - 20;
      if (top < 20) top = 20;
      if (top + popupHeight > window.innerHeight - 20)
        top = window.innerHeight - popupHeight - 20;
      
      setPopupPosition({ top, left });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  // Center modal if no target element
  const isCentered = !limitedSteps[currentStepIndex].targetElement;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay with cutout for highlighted element */}
      <div className="fixed inset-0 bg-opacity-70">
        {/* Cutout / highlight */}
        {!isCentered && (
          <div 
            className="absolute rounded-md border-2 border-blue-400 bg-transparent pointer-events-none"
            style={{
              top: `${highlightPosition.top}px`,
              left: `${highlightPosition.left}px`,
              width: `${highlightPosition.width}px`,
              height: `${highlightPosition.height}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          />
        )}
      </div>

      {/* Tutorial popup */}
      <div
        className={`fixed bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden ${
          isCentered ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={isCentered ? {} : {
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`
        }}
      >
        {/* Header with optional title */}
        {(currentStep.title || lessonTitle) && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {currentStep.title || lessonTitle}
            </h3>
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-base text-gray-700">
            {currentStep.content}
          </div>
        </div>
        
        {/* Footer with navigation buttons */}
        <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
          <div>
            {allowSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded hover:bg-gray-100 text-blue-600"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isLastStep ? `${currentStep.index === totalSteps ? 'Finish' : `Last (${currentStep.index}/${totalSteps})`}` : `Next (${currentStep.index}/${totalSteps})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTutorial;