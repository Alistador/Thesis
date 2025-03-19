"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/"); // Redirect to login page after 5 seconds
    }, 5000);

    return () => clearTimeout(timer); // Cleanup function
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#3B92F4] to-[#3A91F4]">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Password Reset Successful!
        </h1>
        <p className="text-gray-600">
          You will be redirected to the login page in a few seconds. If not,
          click the button below
        </p>

        <Link
          href="/"
          className="inline-block w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-md transition-transform transform hover:scale-105 text-center"
        >
          Return to Login
        </Link>
      </div>
    </main>
  );
}
