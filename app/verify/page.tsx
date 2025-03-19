"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/lib/userContext";
import { useErrorToast } from "@/components/errorMessage/ErrorToastContext";

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [resendStatus, setResendStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [userEmail, setUserEmail] = useState("");
  const [fetchingEmail, setFetchingEmail] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    isAuthenticated,
    isVerified,
    email,
    isLoading,
    resendVerificationEmail,
  } = useUser();
  const { showError } = useErrorToast();

  // Get token from URL params
  const token = searchParams?.get("token") || "";

  // Check if the user just registered
  const justRegistered = searchParams?.get("justRegistered") === "true";

  // Fetch email using token if available
  useEffect(() => {
    const fetchEmailFromToken = async () => {
      if (!token) return;

      setFetchingEmail(true);
      try {
        const response = await fetch(`/api/auth/verify/token?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          if (data.email) {
            setUserEmail(data.email);
          }
        } else {
          // Token invalid or expired
          console.error("Invalid token or token expired");
        }
      } catch (error) {
        console.error("Error fetching email from token:", error);
      } finally {
        setFetchingEmail(false);
      }
    };

    // If we have a token but no email yet, fetch it
    if (token && !isVerified && !userEmail) {
      fetchEmailFromToken();
    }
  }, [token, userEmail]);

  // Use email from context if available
  useEffect(() => {
    if (email && !userEmail) {
      setUserEmail(email);
    }
  }, [email, userEmail]);

  // Set initial success message when just registered
  useEffect(() => {
    if (
      justRegistered &&
      userEmail &&
      !resendStatus.success &&
      !resendStatus.error
    ) {
      setResendStatus({
        success:
          "Verification email sent. Please check your inbox for the verification link.",
      });
      // Set initial cooldown when just registered
      if (cooldownTime === 0) {
        setCooldownTime(30);
      }
    }
  }, [justRegistered, userEmail, resendStatus, cooldownTime]);

  // If user is authenticated and verified, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && isVerified) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, isVerified, router]);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTime]);

  const handleResendVerification = async () => {
    // Don't proceed if already loading, on cooldown, or no email
    if (loading || cooldownTime > 0 || !userEmail) return;

    setLoading(true);
    setResendStatus({});

    try {
      // Use our context function instead of direct fetch
      const result = await resendVerificationEmail(userEmail);

      if (result.success) {
        setResendStatus({ success: result.message });
        // Start 30 second cooldown
        setCooldownTime(30);
      } else {
        setResendStatus({ error: result.message });
        showError(result.message);
      }
    } catch (error) {
      const errorMessage =
        "Network error. Please check your connection and try again.";
      console.error("Error sending verification:", error);
      setResendStatus({ error: errorMessage });
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      showError("Failed to sign out. Please try again.");
    }
  };

  // Helper to format the button text
  const getButtonText = () => {
    if (loading) return "Sending...";
    if (cooldownTime > 0) return `Resend Available in ${cooldownTime}s`;
    return "Send Verification Email";
  };

  // Check if button should be disabled
  const isButtonDisabled =
    loading || cooldownTime > 0 || !userEmail || fetchingEmail;

  // Show loading state while fetching email from token
  if (fetchingEmail) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
          <p className="text-gray-600">
            Please wait while we verify your account details.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Account Verification Required
        </h1>

        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Your account needs verification
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please verify your email address before signing in. Click the
                  button below to receive a verification link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {resendStatus.success && (
          <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm border border-green-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Email Sent!
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>{resendStatus.success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {resendStatus.error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{resendStatus.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {userEmail ? (
            <div className="text-center text-sm text-gray-600">
              <p>
                We'll send a verification email to:{" "}
                <span className="font-medium">{userEmail}</span>
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-red-500">
              <p>No email address available. Please sign in again.</p>
            </div>
          )}

          <button
            onClick={handleResendVerification}
            disabled={isButtonDisabled}
            className={`w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md transition-transform transform hover:scale-105 
              ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {getButtonText()}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-3 text-gray-700 font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition-transform transform hover:scale-105"
          >
            Sign Out
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Click the button above to receive a verification email</li>
            <li>Check your email inbox (and spam folder if needed)</li>
            <li>Click the verification link in the email</li>
            <li>Once verified, you'll be able to sign in to your account</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
