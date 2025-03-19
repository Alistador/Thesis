"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuthModal } from "@/components/modals/AuthModalContext";
import { ReactNode } from "react";
import Image from "next/image";

export const NavigationBar = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: ReactNode;
  }[];
  className?: string;
}) => {
  const { setIsAuthModalOpen, setAuthMode } = useAuthModal();

  return (
    <nav
      className={cn(
        "fixed w-full top-0 z-50 bg-white border-b border-sky-100 shadow-lg",
        className
      )}
    >
      <div className="w-full mx-auto px-2">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo & Navigation */}
          <div className="flex items-center space-x-12">
            <Link href="/" className="ml-4">
              {/* Using img tag instead of Next.js Image component */}
              <Image
                src="/logo_new.png"
                alt="Tinkerithm Logo"
                width={180} // Adjust size
                height={40}
              />
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((navItem, idx) => (
                <div
                  key={`link-${idx}`}
                  className="relative group px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="absolute inset-0 bg-sky-100 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200" />
                  <Link
                    href={navItem.link}
                    className="relative z-10 text-sky-700 group-hover:text-sky-900 transition-colors text-base font-medium"
                  >
                    {navItem.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Auth Actions */}
          <div className="flex items-center space-x-6 mr-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/help"
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </Link>
              <Link
                href="/support"
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-sky-100 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-200" />
              <button
                onClick={() => {
                  setAuthMode("signIn");
                  setIsAuthModalOpen(true);
                }}
                className="relative z-10 text-sky-700 group-hover:text-sky-900 px-4 py-2 rounded-lg text-base font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
            <button
              onClick={() => {
                setAuthMode("register");
                setIsAuthModalOpen(true);
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
