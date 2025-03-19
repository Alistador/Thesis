"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Google logo
import { FaGithub } from "react-icons/fa"; // GitHub logo
import MagicButton from "../frontpage/MagicButton";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/modals/AuthModalContext";
import { useErrorToast } from "@/components/errorMessage/ErrorToastContext";
import { useSuccessToast } from "@/components/successMessage/SuccessToastContext";

const LogInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setIsAuthModalOpen } = useAuthModal();
  const { showError } = useErrorToast(); // Use the error toast hook
  const { showSuccess } = useSuccessToast(); // Use the success toast hook

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

  // Handle login submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        // Successful login - show success message before redirect
        showSuccess("Successfully signed in. Welcome back!");

        // Short delay to allow the success message to be seen
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
    } catch (err) {
      // Handle unexpected errors
      showError("Unable to sign in at this time. Please try again later.");
      console.error(err); // Log the actual error for debugging
    } finally {
      setLoading(false);
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
        // Successful sign-in with social provider
        showSuccess(
          `Successfully signed in with ${
            provider.charAt(0).toUpperCase() + provider.slice(1)
          }!`
        );

        // Short delay to allow the success message to be seen
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-8 bg-white rounded-3xl shadow-md max-w-md w-full border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Join other coders
      </h2>

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 w-full placeholder-gray-400"
          required
          disabled={loading}
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} // Toggle password visibility
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 w-full placeholder-gray-400"
            required
            autoComplete="current-password"
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
        <a
          href="/forgot-password"
          className="text-xs text-blue-600 mt-1 self-end hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <MagicButton
          title={loading ? "Signing In..." : "Sign In"}
          type="submit"
          disabled={loading}
        />
      </div>

      {/* Sign Up Link */}
      <p className="text-sm text-center text-gray-600">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="text-blue-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Create an account
        </button>
      </p>

      {/* Divider */}
      <div className="relative">
        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>

      {/* Social Sign-In Buttons */}
      <div className="flex gap-3">
        {/* Google Sign-In */}
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-gray-100 transition text-gray-700 border border-gray-300 w-full shadow-md"
          disabled={loading}
        >
          <FcGoogle className="w-5 h-5" />
          Google
        </button>

        {/* GitHub Sign-In */}
        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition text-white border border-gray-700 w-full shadow-md"
          disabled={loading}
        >
          <FaGithub className="w-5 h-5" />
          GitHub
        </button>
      </div>
    </form>
  );
};

export default LogInForm;
