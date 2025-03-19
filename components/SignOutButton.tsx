"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Create a clean absolute URL to the root path
      const cleanUrl = `${window.location.origin}/`;

      // Use Next-Auth's signOut with the absolute URL to ensure no parameters are carried over
      await signOut({ callbackUrl: cleanUrl });
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
    >
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
