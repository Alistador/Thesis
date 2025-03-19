"use client";

import { useState } from "react";
import { UserCircle, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

interface DashboardHeaderProps {
  email: string | null | undefined;
  userName?: string | null;
}

export default function DashboardHeader({
  email,
  userName,
}: DashboardHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <Link href="/dashboard" className="font-bold text-blue-600">
          <Image
            src="/logo_new.png"
            alt="Tinkerithm Logo"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={toggleDropdown}
          >
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{userName || "User"}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
            <Menu className="h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 items-center"
                onClick={() => setDropdownOpen(false)}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </div>
          )}
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
