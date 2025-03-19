import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define prop types for the ErrorToast component
interface ErrorToastProps {
  /**
   * The error message to display
   */
  error: string;
  /**
   * Function to call when closing the toast
   */
  onClose: () => void;
  /**
   * Duration in seconds before auto-close (default: 5)
   */
  duration?: number;
  /**
   * Position of the toast
   */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * ErrorToast - A reusable toast notification component for displaying errors
 */
const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onClose,
  duration = 5,
  position = "top-right",
  className = "",
}) => {
  // Auto-close the toast after duration
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClose();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [error, onClose, duration]);

  // Position styles
  const getPositionStyles = (): string => {
    switch (position) {
      case "top-left":
        return "top-5 left-5";
      case "bottom-right":
        return "bottom-5 right-5";
      case "bottom-left":
        return "bottom-5 left-5";
      case "top-right":
      default:
        return "top-5 right-5";
    }
  };

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`fixed ${getPositionStyles()} bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300 z-50 w-[300px] flex items-center gap-3 ${className}`}
        >
          {/* Error Icon */}
          <div className="text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.766-1.36 2.72-1.36 3.486 0l6.857 12.162c.77 1.367-.213 3.06-1.743 3.06H3.143c-1.53 0-2.512-1.693-1.743-3.06L8.257 3.1zM10 12a1 1 0 100 2 1 1 0 000-2zm0-6a1 1 0 00-1 1v3a1 1 0 102 0V7a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Error Message */}
          <span className="text-sm font-medium">{error}</span>

          {/* Close Button */}
          <button
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close error notification"
          >
            ✕
          </button>

          {/* Reverse Loading Bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-red-500 rounded-b-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
