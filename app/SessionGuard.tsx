"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface SessionGuardProps {
  children: ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { status } = useSession();
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);

  useEffect(() => {
    // Mark that we've tried to restore the session once
    if (status !== "loading" || hasAttemptedRestore) {
      setHasAttemptedRestore(true);
    }
  }, [status, hasAttemptedRestore]);

  // Only show content after we've tried to restore session once
  // This prevents multiple attempts when errors occur
  if (!hasAttemptedRestore && status === "loading") {
    return <div>Loading authentication state...</div>;
  }

  return <>{children}</>;
}
