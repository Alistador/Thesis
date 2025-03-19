import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AuthProvider } from "./providers";
import { SessionGuard } from "./SessionGuard"; // Adjust import path as needed

import { AuthModalProvider } from "@/components/modals/AuthModalContext";
import { AuthModal } from "@/components/modals/AuthModal";
import { ErrorToastProvider } from "@/components/errorMessage/ErrorToastContext";
import { SuccessToastProvider } from "@/components/successMessage/SuccessToastContext";
import { GlobalSuccessHandler } from "@/components/successMessage/GlobalSuccessHandler";
import { GlobalErrorHandler } from "@/components/errorMessage/GlobalErrorHandler";
import { ProgressProvider } from '@/contexts/ProgressContext';

const inter = Inter({ subsets: ["latin"] });

// Define page metadata
export const metadata: Metadata = {
  title: "My Thesis",
  description: "My Codelearn Website",
};

// Root Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/jsm-logo.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <ErrorToastProvider>
          <SuccessToastProvider>
            <AuthProvider>
              <SessionGuard>
                <ProgressProvider>
                  <AuthModalProvider>
                    {children}
                    <AuthModal />
                    <GlobalErrorHandler />
                    <GlobalSuccessHandler />
                  </AuthModalProvider>
                </ProgressProvider>
              </SessionGuard>
            </AuthProvider>
          </SuccessToastProvider>
        </ErrorToastProvider>
      </body>
    </html>
  );
}