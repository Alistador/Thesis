"use client";
import { useAuthModal } from "./AuthModalContext";
import AuthForm from "../authentication/RegistrationPopup";

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuthModal();
  if (!isAuthModalOpen) return null;

  return <AuthForm onClose={() => setIsAuthModalOpen(false)} />;
};

// Export as default
export default AuthForm;
