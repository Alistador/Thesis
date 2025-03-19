"use client";

import { createContext, useContext, useState } from "react";

type AuthModalContextType = {
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (state: boolean) => void;
  authMode: "signIn" | "register";
  setAuthMode: (mode: "signIn" | "register") => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

export const AuthModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "register">("signIn");

  return (
    <AuthModalContext.Provider
      value={{ isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context)
    throw new Error("useAuthModal must be used within AuthModalProvider");
  return context;
};
