"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import SuccessToast from "./SuccessToast";

// Define the type for the context value
interface SuccessToastContextType {
  showSuccess: (message: string) => void;
  clearSuccess: () => void;
}

// Define the type for provider options
interface SuccessToastProviderOptions {
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

// Define the type for provider props
interface SuccessToastProviderProps {
  children: ReactNode;
  options?: SuccessToastProviderOptions;
}

// Create context with null initial value and type assertion
const SuccessToastContext = createContext<SuccessToastContextType | null>(null);

/**
 * SuccessToastProvider - Context provider for managing success toasts throughout the application
 */
export const SuccessToastProvider: React.FC<SuccessToastProviderProps> = ({
  children,
  options = {},
}) => {
  const [success, setSuccess] = useState<string>("");

  const showSuccess = (message: string): void => {
    setSuccess(message);
  };

  const clearSuccess = (): void => {
    setSuccess("");
  };

  // Default options
  const defaultOptions: SuccessToastProviderOptions = {
    duration: 5,
    position: "top-right",
    ...options,
  };

  return (
    <SuccessToastContext.Provider value={{ showSuccess, clearSuccess }}>
      {children}
      <SuccessToast
        success={success}
        onClose={clearSuccess}
        duration={defaultOptions.duration}
        position={defaultOptions.position}
        className={defaultOptions.className}
      />
    </SuccessToastContext.Provider>
  );
};

/**
 * Custom hook to use the success toast
 * @returns {SuccessToastContextType} The success toast context
 * @throws {Error} If used outside of a SuccessToastProvider
 */
export const useSuccessToast = (): SuccessToastContextType => {
  const context = useContext(SuccessToastContext);
  if (!context) {
    throw new Error(
      "useSuccessToast must be used within a SuccessToastProvider"
    );
  }
  return context;
};

// Declare module augmentation for window object
declare global {
  interface Window {
    __successToastApi?: SuccessToastContextType;
  }
}

/**
 * Utility function to handle success messages globally
 */
export const setupGlobalSuccessHandling = (): void => {
  // Only run in client-side code
  if (typeof window !== "undefined") {
    // Create a global success method
    const originalConsoleLog = console.log;

    // You could override console.log, but that would be noisy
    // Instead, we'll create a custom success logger
    window.console.success = (...args: any[]): void => {
      // Call the original console.log for debugging
      originalConsoleLog.apply(console, ["✅ SUCCESS:"].concat(args));

      // Get the first argument that might be a success message
      const successArg = args[0];

      // Try to extract a meaningful success message
      let successMessage = "Operation completed successfully";

      if (typeof successArg === "string") {
        successMessage = successArg;
      } else if (successArg && typeof successArg === "object") {
        successMessage = "Operation completed successfully";
      }

      // Use the global success toast API if available
      if (window.__successToastApi) {
        window.__successToastApi.showSuccess(successMessage);
      }
    };

    // You could also create custom event listeners for success events
    window.addEventListener("success", ((event: Event): void => {
      // Cast the event to CustomEvent to access the detail property
      const customEvent = event as CustomEvent<{ message?: string }>;
      if (window.__successToastApi) {
        window.__successToastApi.showSuccess(
          customEvent.detail?.message || "Operation completed successfully"
        );
      }
    }) as EventListener);
  }
};

// Add the success method to the console interface
declare global {
  interface Console {
    success?: (...args: any[]) => void;
  }
}
