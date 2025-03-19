"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/auth/password-reset/${params.token}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      // Redirect to login after successful reset
      router.push("/password-reset/success");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility =
    (field: "password" | "confirm") => (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent the button from taking focus
      if (field === "password") {
        setShowPassword(!showPassword);
      } else {
        setShowConfirm(!showConfirm);
      }
    };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Choose a New Password
        </h1>
        <p className="text-gray-600 text-center">
          You can reset your password here
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition pr-10"
                placeholder="Enter new password"
              />
              <div
                className="absolute right-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={togglePasswordVisibility("password")}
                tabIndex={-1}
                aria-hidden="true"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition pr-10"
                placeholder="Confirm new password"
              />
              <div
                className="absolute right-3 text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={togglePasswordVisibility("confirm")}
                tabIndex={-1}
                aria-hidden="true"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
          </div>

          {error && (
            <p className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm text-center border border-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md transition-transform transform hover:scale-105 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
          >
            <span className="mr-1">←</span> Return to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
