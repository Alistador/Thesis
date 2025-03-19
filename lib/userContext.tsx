"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

// Define the extended session type to include `id` & `active`
type CustomSession = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    active: boolean;
  };
};

// Define the user state interface
interface UserState {
  id?: string;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
}

// Define additional actions/methods the context will provide
interface UserContextType extends UserState {
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; message: string; redirect?: string }>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: {
    name?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State to track user information
  const [userState, setUserState] = useState<UserState>({
    isAuthenticated: false,
    isVerified: false,
    isLoading: true,
  });

  // Effect to update user state when session changes
  useEffect(() => {
    if (status === "loading") {
      setUserState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (status === "authenticated" && session) {
      const customSession = session as CustomSession; // ✅ Cast session as `CustomSession`
      const isVerified = customSession.user.active; // ✅ Now TypeScript recognizes `active`

      setUserState({
        id: customSession.user.id, // ✅ TypeScript recognizes `id`
        email: customSession.user.email || undefined,
        name: customSession.user.name || undefined,
        isAuthenticated: true,
        isVerified,
        isLoading: false,
      });

      // If user is not verified, redirect to verification page
      if (!isVerified) {
        // Instead of directly including email in URL, fetch a verification token
        if (customSession.user.email) {
          fetchVerificationToken(customSession.user.email);
        } else {
          router.push("/verify");
        }
      }
    } else {
      setUserState({
        isAuthenticated: false,
        isVerified: false,
        isLoading: false,
      });
    }
  }, [session, status, router]);

  // Fetch a verification token for redirecting to the verification page
  const fetchVerificationToken = async (email: string) => {
    try {
      const response = await fetch("/api/auth/verify/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          router.push(`/verify?token=${data.token}`);
        } else {
          router.push("/verify");
        }
      } else {
        // If token creation fails, redirect to verify page without a token
        router.push("/verify");
      }
    } catch (error) {
      console.error("Error creating verification token:", error);
      router.push("/verify");
    }
  };

  // Function to resend verification email
  const resendVerificationEmail = async (email: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Handle the redirect if provided
      if (response.ok && data.redirect) {
        return {
          success: true,
          message: data.message || "Verification email sent successfully",
          redirect: data.redirect,
        };
      }

      return response.ok
        ? {
            success: true,
            message: data.message || "Verification email sent successfully",
          }
        : {
            success: false,
            message: data.error || "Failed to send verification email",
          };
    } catch (error) {
      console.error("Error sending verification:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // Function to request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return response.ok
        ? {
            success: true,
            message: data.message || "Password reset email sent",
          }
        : {
            success: false,
            message: data.error || "Failed to send reset email",
          };
    } catch (error) {
      console.error("Error requesting password reset:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // Function to update user profile (uses PATCH instead of PUT)
  const updateUserProfile = async (data: { name?: string }) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH", // ✅ Changed to PATCH for partial updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setUserState((prev) => ({ ...prev, name: data.name || prev.name }));
        return {
          success: true,
          message: result.message || "Profile updated successfully",
        };
      } else {
        return {
          success: false,
          message: result.error || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  // Combine state and functions to create the context value
  const contextValue: UserContextType = {
    ...userState,
    resendVerificationEmail,
    requestPasswordReset,
    updateUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
