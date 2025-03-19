"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardNavBar({
  className,
  email,
  userName,
}: {
  className?: string;
  email?: string | null;
  userName?: string | null;
}): React.ReactElement {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  // Get user initials for avatar
  const getInitials = () => {
    if (!userName) return "U";
    const nameParts = userName.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return userName.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { name: "Journeys", link: "/journeys" },
    { name: "Courses", link: "/courses" },
    { name: "Challenges", link: "/challenges" },
    { name: "Daily Challenge", link: "/challenges/daily-challenge" },
  ];

  const profileMenuItems = [
    { name: "My Profile", link: "/profile" },
    { name: "Settings", link: "/settings" },
    { name: "Achievements", link: "/achievements" },
    { name: "Help", link: "/help" },
    { name: "Sign Out", link: "/auth/signout", isSignOut: true },
  ];

  const handleSignOut = async () => {
    // Use NextAuth signOut function
    await signOut({ callbackUrl: "/" });
  };

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
            <Link href="/dashboard" className="ml-4">
              <Image
                src="/logo_new.png"
                alt="Tinkerithm Logo"
                width={180}
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

          {/* Right side - Profile & Notifications */}
          <div className="flex items-center space-x-6 mr-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                aria-label="Notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  3
                </span>
              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 rounded-full hover:bg-sky-50 p-1 transition-colors"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-medium">
                  {getInitials()}
                </div>
                <span className="text-sky-800 font-medium hidden sm:inline">
                  {userName || email || "User"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-sky-600 transition-transform duration-200 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-sky-100 transition-all">
                  {profileMenuItems.map((item, idx) => (
                    <div key={`profile-item-${idx}`}>
                      {item.isSignOut ? (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {item.name}
                          </button>
                        </>
                      ) : (
                        <Link
                          href={item.link}
                          className="block px-4 py-2 text-gray-700 hover:bg-sky-50 transition-colors"
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
