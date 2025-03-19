"use client";

import { useEffect, useState } from "react";
import MagicButton from "../frontpage/MagicButton";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "../modals/AuthModalContext";
import { useErrorToast } from "@/components/errorMessage/ErrorToastContext";

const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { authMode, setAuthMode } = useAuthModal();
  const [mode, setMode] = useState<"signIn" | "register">(authMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Only for registration
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showError } = useErrorToast(); // Use the error toast hook

  // Disable scrolling when popup opens
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // Add CSS to hide browser's password toggle
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Chrome, Safari, Edge */
      input::-ms-reveal,
      input::-ms-clear,
      input::-webkit-contacts-auto-fill-button,
      input::-webkit-credentials-auto-fill-button {
        display: none !important;
        visibility: hidden;
        pointer-events: none;
      }
      
      /* Firefox */
      input[type="password"]::-moz-reveal-password-button {
        display: none !important;
      }

      /* Microsoft Edge */
      ::-ms-reveal {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle login or register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Indicate loading state

    if (authMode === "register") {
      // Handle registration
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        showError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      // Ensure passwords match
      if (password !== confirmPassword) {
        showError("Passwords do not match");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create an account");
        }

        // Redirect to the email verification page
        onClose(); // Close the modal after successful login

        // Use the redirect URL from API, adding justRegistered flag if needed
        const redirectUrl = data.redirect.includes("?")
          ? `${data.redirect}&justRegistered=true`
          : `${data.redirect}?justRegistered=true`;

        router.push(redirectUrl);
      } catch (err) {
        showError(
          err instanceof Error
            ? `${err.message}`
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Handle sign-in
      // Client-side validation
      if (!email.trim()) {
        showError("Email address is required");
        setLoading(false);
        return;
      }

      if (!password) {
        showError("Password is required");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      try {
        const response = await signIn("credentials", {
          email,
          password,
          redirect: false, // Handle redirect manually to better control error messages
        });

        if (response?.error) {
          // Handle specific error messages from the backend
          if (response.error.includes("verify your email")) {
            showError(
              "Please verify your email address before signing in. Check your inbox for a verification link or request a new one."
            );
          } else if (
            response.error.includes("No account found") ||
            response.error.includes("Invalid password")
          ) {
            // Keep generic error message for security reasons
            showError("Invalid email or password");
          } else if (
            response.error.includes(
              "sign in with the provider you originally used"
            )
          ) {
            showError(
              "This email is linked to a social account. Please sign in with the provider you originally used."
            );
          } else {
            // Handle any other backend errors
            showError(response.error);
          }
        } else {
          // Successful login - redirect manually
          onClose(); // Close the modal after successful login
          router.push("/dashboard");
        }
      } catch (err) {
        // Handle unexpected errors
        showError("Unable to sign in at this time. Please try again later.");
        console.error(err); // Log the actual error for debugging
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Google & GitHub OAuth login
  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const response = await signIn(provider, {
        redirect: false,
      });

      if (response?.error) {
        // Handle specific OAuth errors
        if (response.error.includes("No email provided")) {
          showError(
            `Unable to access your ${provider} email. Please check your permissions and try again.`
          );
        } else if (response.error.includes("OAuthAccountNotLinked")) {
          showError(
            `This email is already associated with another account. Please sign in using your original method.`
          );
        } else if (response.error.includes("Failed to retrieve user data")) {
          showError(
            `We couldn't retrieve your account information. Please try again or contact support.`
          );
        } else {
          showError(`Error signing in with ${provider}: ${response.error}`);
        }
      } else {
        // Success - redirect
        onClose(); // Close the modal after successful login
        router.push("/dashboard");
      }
    } catch (err) {
      showError(
        `Unable to sign in with ${provider} at this time. Please try again later.`
      );
      console.error(err); // Log the actual error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500/20 backdrop-blur-[3px] flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-lg max-w-2xl w-full h-[360px] border border-gray-200 p-8 flex flex-row gap-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={loading}
        >
          ✕
        </button>

        <div className="flex-1 flex flex-col gap-6">
          <div className="relative flex justify-center gap-8 border-b border-gray-300 pb-3">
            <button
              type="button"
              className={`text-lg font-semibold px-4 transition-all duration-300 ${
                authMode === "signIn" ? "text-blue-600" : "text-gray-400"
              }`}
              onClick={() => setAuthMode("signIn")}
              disabled={loading}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`text-lg font-semibold px-4 transition-all duration-300 ${
                authMode === "register" ? "text-blue-600" : "text-gray-400"
              }`}
              onClick={() => setAuthMode("register")}
              disabled={loading}
            >
              Register
            </button>

            <motion.div
              className="absolute bottom-0 h-1 bg-blue-600 rounded-full"
              initial={false}
              animate={{
                left: authMode === "register" ? "50%" : "0%",
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 w-[110%]"
              required
              disabled={loading}
            />
            <div className="relative w-[110%]">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  authMode === "register"
                    ? "Create a password"
                    : "Your password"
                }
                className="px-4 py-3 pr-10 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 w-full"
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {authMode === "register" && (
              <div className="relative w-[110%]">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="px-4 py-3 pr-10 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 w-full"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            )}

            <div className="flex justify-center w-[110%]">
              <MagicButton
                title={
                  loading
                    ? "Processing..."
                    : authMode === "register"
                    ? "Create My Account"
                    : "Sign In"
                }
                type="submit"
                disabled={loading}
              />
            </div>

            {authMode === "signIn" && (
              <p className="flex justify-center w-[110%] text-sm text-blue-600 mt-2 cursor-pointer hover:underline">
                Forgot Password?
              </p>
            )}
          </form>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center pr-4 gap-2">
            <div className="h-24 border-r border-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="h-24 border-r border-gray-300"></div>
          </div>

          <div className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center px-5 py-3 rounded-lg bg-white text-gray-800 border border-gray-300 w-64 shadow-md hover:bg-gray-100 transition"
              disabled={loading}
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              className="flex items-center justify-center px-5 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 w-64 shadow-md hover:bg-gray-800 transition"
              disabled={loading}
            >
              <FaGithub className="w-6 h-6 mr-3" />
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
