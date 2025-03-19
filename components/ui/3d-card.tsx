"use client";

import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  ReactNode,
  ElementType,
  forwardRef,
} from "react";
import { motion } from "framer-motion";

interface MouseEnterContextType {
  mouseEnter: boolean;
  setMouseEnter: React.Dispatch<React.SetStateAction<boolean>>;
}

const MouseEnterContext = createContext<MouseEnterContextType>({
  mouseEnter: false,
  setMouseEnter: () => {},
});

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = "",
  containerClassName = "",
}) => {
  const [mouseEnter, setMouseEnter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const handleMouseEnter = () => {
    setMouseEnter(true);
    if (containerRef.current)
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  const handleMouseLeave = () => {
    setMouseEnter(false);
    if (containerRef.current)
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <MouseEnterContext.Provider value={{ mouseEnter, setMouseEnter }}>
      <div
        className={`flex items-center justify-center ${containerClassName}`}
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`flex items-center justify-center relative transition-all duration-200 ease-linear ${className}`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </motion.div>
      </div>
    </MouseEnterContext.Provider>
  );
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
};

// Simpler interface for CardItemProps
interface CardItemProps {
  children: ReactNode;
  className?: string;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  as?: ElementType;
  [key: string]: any; // Allow any additional props
}

// The CardItem component with simpler typescript handling
export const CardItem = forwardRef<HTMLElement, CardItemProps>(
  (
    {
      as: Component = "div",
      children,
      className = "",
      translateX = 0,
      translateY = 0,
      translateZ = 0,
      rotateX = 0,
      rotateY = 0,
      rotateZ = 0,
      ...rest
    },
    forwardedRef
  ) => {
    const { mouseEnter } = useContext(MouseEnterContext);
    const localRef = useRef<HTMLElement>(null);
    const ref = (forwardedRef || localRef) as React.RefObject<HTMLElement>;

    useEffect(() => {
      if (!ref.current) return;
      if (mouseEnter) {
        ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
      } else {
        ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
      }
    }, [
      mouseEnter,
      translateX,
      translateY,
      translateZ,
      rotateX,
      rotateY,
      rotateZ,
      ref,
    ]);

    return (
      <Component
        ref={ref}
        className={`w-fit transition duration-200 ease-linear ${className}`}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

CardItem.displayName = "CardItem";
