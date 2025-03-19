// EditorSidebar.tsx
import { useState } from "react";
import { ArrowLeft, BookOpen, Menu, X, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditorSidebarProps {
  onShowTutorial: () => void;
  backUrl?: string;
}

export default function EditorSidebar({ onShowTutorial, backUrl = "/dashboard" }: EditorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.push(backUrl);
  };

  return (
    <div 
      className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col h-full ${
        isCollapsed ? "w-12" : "w-16"
      }`}
    >
      <div className="flex justify-center py-3 border-b border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      
      <div className="flex flex-col items-center gap-6 py-6 flex-grow">
        <button
          onClick={handleBackClick}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 flex flex-col items-center"
          title="Go Back"
        >
          <ArrowLeft size={22} />
          {!isCollapsed && <span className="text-xs mt-1 text-gray-400">Back</span>}
        </button>
        
        <button
          onClick={onShowTutorial}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 flex flex-col items-center"
          title="Show Tutorial"
        >
          <BookOpen size={22} />
          {!isCollapsed && <span className="text-xs mt-1 text-gray-400">Tutorial</span>}
        </button>
        
        <button
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 flex flex-col items-center mt-auto"
          title="Help"
        >
          <HelpCircle size={22} />
          {!isCollapsed && <span className="text-xs mt-1 text-gray-400">Help</span>}
        </button>
      </div>
    </div>
  );
}