import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn("bg-white shadow-md rounded-lg p-4 border border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
