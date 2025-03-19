import React from "react";

interface MagicButtonProps {
  title: string;
  icon?: React.ReactNode;
  position?: "left" | "right";
  handleClick?: () => void;
  otherClasses?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean; // ✅ Add disabled prop
}

const MagicButton: React.FC<MagicButtonProps> = ({
  title,
  icon,
  position,
  handleClick,
  otherClasses,
  type = "button", // Default type
  disabled = false, // Default to false
}) => {
  return (
    <button
      type={type} // Apply type
      className={`relative inline-flex h-12 w-full md:w-60 md:mt-2 overflow-hidden rounded-lg p-[1px] focus:outline-none
        transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-lg hover:shadow-blue-500/50"
        }`}
      onClick={handleClick}
      disabled={disabled} // ✅ Apply disabled state
    >
      {/* Animated Border with Space Blue Theme */}
      <span
        className={`absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#001F3F_0%,#007BFF_50%,#4B0082_100%)]
        ${disabled ? "hidden" : ""}`} // ✅ Hide animation if disabled
      />

      {/* Button Content with Blue Gradient */}
      <span
        className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg
             bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-500 px-5 py-2 text-sm font-medium text-white backdrop-blur-3xl gap-2
             ${disabled ? "cursor-not-allowed bg-gray-500" : ""}
             ${otherClasses}`}
      >
        {position === "left" && icon}
        {title}
        {position === "right" && icon}
      </span>
    </button>
  );
};

export default MagicButton;
