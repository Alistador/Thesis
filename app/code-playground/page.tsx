// app/code-playground/page.tsx
"use client";

import { useSession } from "next-auth/react";
import CodeEditor from "@/components/levels/CodeEditor";

export default function CodePlayground() {
  const { data: session, status } = useSession();

  console.log("Session status:", status);
  console.log("Session data:", session);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Please sign in to access the code playground
      </div>
    );
  }

  const defaultCode = `# Write your Python code here
print("Hello, World!")
`;

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <h1 className="text-2xl font-bold p-4 bg-white text-black shadow-md">
        Code Playground
      </h1>

      {/* Editor Container - Takes Remaining Space */}
      <div className="flex-1">
        <CodeEditor defaultCode={defaultCode} languageId={28} />
      </div>
    </div>
  );
}
