import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define prop types for the SuccessToast component
interface SuccessToastProps {
  /**
   * The success message to display
   */
  success: string;
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
 * SuccessToast - A reusable toast notification component for displaying success messages
 */
const SuccessToast: React.FC<SuccessToastProps> = ({
  success,
  onClose,
  duration = 5,
  position = "top-right",
  className = "",
}) => {
  // Auto-close the toast after duration
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [success, onClose, duration]);

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
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`fixed ${getPositionStyles()} bg-white text-gray-800 p-4 rounded-lg shadow-lg border border-gray-300 z-50 w-[300px] flex items-center gap-3 ${className}`}
        >
          {/* Success Icon */}
          <div className="text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Success Message */}
          <span className="text-sm font-medium">{success}</span>

          {/* Close Button */}
          <button
            className="ml-auto text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close success notification"
          >
            ✕
          </button>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-lg"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessToast;
