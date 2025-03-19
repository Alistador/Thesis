"use client";

import { useEffect } from "react";
import { useErrorToast, setupGlobalErrorHandling } from "./ErrorToastContext";

/**
 * GlobalErrorHandler - Client component that sets up global error handling
 * This component doesn't render anything visible
 */
export function GlobalErrorHandler(): null {
  const errorToastApi = useErrorToast();

  useEffect(() => {
    // Set up global error handling
    setupGlobalErrorHandling();

    // Expose the API to window for global access
    if (typeof window !== "undefined") {
      window.__errorToastApi = errorToastApi;
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        delete window.__errorToastApi;
      }
    };
  }, [errorToastApi]);

  // This component doesn't render anything
  return null;
}
