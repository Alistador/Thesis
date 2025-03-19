"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import ErrorToast from "./ErrorToast";

// Define the type for the context value
interface ErrorToastContextType {
  showError: (message: string) => void;
  clearError: () => void;
}

// Define the type for provider options
interface ErrorToastProviderOptions {
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
}

// Define the type for provider props
interface ErrorToastProviderProps {
  children: ReactNode;
  options?: ErrorToastProviderOptions;
}

// Create context with null initial value and type assertion
const ErrorToastContext = createContext<ErrorToastContextType | null>(null);

/**
 * ErrorToastProvider - Context provider for managing error toasts throughout the application
 */
export const ErrorToastProvider: React.FC<ErrorToastProviderProps> = ({
  children,
  options = {},
}) => {
  const [error, setError] = useState<string>("");

  const showError = (message: string): void => {
    setError(message);
  };

  const clearError = (): void => {
    setError("");
  };

  // Default options
  const defaultOptions: ErrorToastProviderOptions = {
    duration: 5,
    position: "top-right",
    ...options,
  };

  return (
    <ErrorToastContext.Provider value={{ showError, clearError }}>
      {children}
      <ErrorToast
        error={error}
        onClose={clearError}
        duration={defaultOptions.duration}
        position={defaultOptions.position}
        className={defaultOptions.className}
      />
    </ErrorToastContext.Provider>
  );
};

/**
 * Custom hook to use the error toast
 * @returns {ErrorToastContextType} The error toast context
 * @throws {Error} If used outside of an ErrorToastProvider
 */
export const useErrorToast = (): ErrorToastContextType => {
  const context = useContext(ErrorToastContext);
  if (!context) {
    throw new Error("useErrorToast must be used within an ErrorToastProvider");
  }
  return context;
};

// Declare module augmentation for window object
declare global {
  interface Window {
    __errorToastApi?: ErrorToastContextType;
  }
}

/**
 * Utility function to handle errors globally
 */
export const setupGlobalErrorHandling = (): void => {
  // Only run in client-side code
  if (typeof window !== "undefined") {
    const originalConsoleError = console.error;

    // Override console.error to show errors in toast
    console.error = (...args: any[]): void => {
      // Call the original console.error first
      originalConsoleError.apply(console, args);

      // Get the first argument that might be an error
      const errorArg = args[0];

      // Try to extract a meaningful error message
      let errorMessage = "An unexpected error occurred";

      if (typeof errorArg === "string") {
        errorMessage = errorArg;
      } else if (errorArg instanceof Error) {
        errorMessage = errorArg.message;
      } else if (errorArg && typeof errorArg === "object") {
        errorMessage = String(errorArg);
      }

      // We need to get the current context - this will only work if you set up a global variable
      if (window.__errorToastApi) {
        window.__errorToastApi.showError(errorMessage);
      }
    };

    // Setup error boundary for uncaught errors
    window.addEventListener("error", (event: ErrorEvent): void => {
      if (window.__errorToastApi) {
        window.__errorToastApi.showError(
          event.error?.message || "Uncaught error occurred"
        );
      }
    });

    // Handle promise rejections
    window.addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent): void => {
        if (window.__errorToastApi) {
          window.__errorToastApi.showError(
            event.reason?.message || "Promise rejection occurred"
          );
        }
      }
    );
  }
};
