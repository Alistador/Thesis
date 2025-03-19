"use client";

import { useEffect, useState } from "react";
import UsernamePopup from "./UsernamePopup";
import { useSuccessToast } from "@/components/successMessage/SuccessToastContext";

interface UsernameCheckWrapperProps {
  userId: number;
  email: string;
  name: string | null | undefined;
  children: React.ReactNode;
}

export default function UsernameCheckWrapper({
  userId,
  email,
  name,
  children,
}: UsernameCheckWrapperProps) {
  const [showPopup, setShowPopup] = useState(false);
  const { showSuccess } = useSuccessToast();

  useEffect(() => {
    // If the user doesn't have a name (null or undefined), show the popup
    if (name === null || name === undefined || name === "") {
      setShowPopup(true);
    } else {
      // If name exists, ensure popup is closed
      setShowPopup(false);
    }
  }, [name]);

  const handleUsernameSet = (newUsername: string) => {
    showSuccess(`Username successfully set to ${newUsername}!`);
  };

  return (
    <>
      {children}
      {showPopup && (
        <UsernamePopup
          userId={userId}
          currentEmail={email}
          onSuccess={handleUsernameSet}
        />
      )}
    </>
  );
}
