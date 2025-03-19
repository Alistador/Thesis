"use client";

import { useEffect } from "react";
import {
  useSuccessToast,
  setupGlobalSuccessHandling,
} from "./SuccessToastContext";

/**
 * GlobalSuccessHandler - Client component that sets up global success handling
 * This component doesn't render anything visible
 */
export function GlobalSuccessHandler(): null {
  const successToastApi = useSuccessToast();

  useEffect(() => {
    // Set up global success handling
    setupGlobalSuccessHandling();

    // Expose the API to window for global access
    if (typeof window !== "undefined") {
      window.__successToastApi = successToastApi;
    }

    // Custom success event dispatcher
    window.dispatchSuccessEvent = (message: string): void => {
      const successEvent = new CustomEvent<{ message: string }>("success", {
        detail: { message },
      });
      window.dispatchEvent(successEvent);
    };

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        delete window.__successToastApi;
        delete window.dispatchSuccessEvent;
      }
    };
  }, [successToastApi]);

  // This component doesn't render anything
  return null;
}

// Add the dispatchSuccessEvent method to the window interface
declare global {
  interface Window {
    dispatchSuccessEvent?: (message: string) => void;
  }
}
