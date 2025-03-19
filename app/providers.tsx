// app/providers.tsx
"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { UserContextProvider } from "@/lib/userContext";

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <UserContextProvider>{children}</UserContextProvider>
    </SessionProvider>
  );
}
