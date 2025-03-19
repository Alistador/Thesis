// /lib/journeyIcons.ts

import { 
    FaPython, 
    FaHtml5, 
    FaJava, 
    FaCode, 
    FaJs, 
    FaReact, 
    FaDatabase, 
    FaServer, 
    FaMobile,
    FaTerminal,
    FaRobot
  } from "react-icons/fa";
  import { SiTypescript, SiCplusplus, SiRuby, SiSwift, SiKotlin } from "react-icons/si";
  import { TbBrandCpp } from "react-icons/tb";
  
  // Define possible journey keys
  type JourneyIconKey =
    | "python"
    | "html"
    | "java"
    | "javascript"
    | "typescript"
    | "cpp"
    | "ruby"
    | "swift"
    | "kotlin"
    | "react"
    | "database"
    | "backend"
    | "mobile"
    | "cli"
    | "ai"
    | "default";
  
  // Define the mapping with TypeScript support
  const journeyIconMap: Record<JourneyIconKey, { icon: React.ElementType; color: string; bgColor: string }> = {
    // Core languages
    python: { icon: FaPython, color: "#3776AB", bgColor: "bg-blue-100" },
    html: { icon: FaHtml5, color: "#E34F26", bgColor: "bg-orange-100" },
    java: { icon: FaJava, color: "#007396", bgColor: "bg-blue-100" },
    javascript: { icon: FaJs, color: "#F7DF1E", bgColor: "bg-yellow-100" },
    typescript: { icon: SiTypescript, color: "#3178C6", bgColor: "bg-blue-100" },
    cpp: { icon: SiCplusplus, color: "#00599C", bgColor: "bg-blue-100" },
    ruby: { icon: SiRuby, color: "#CC342D", bgColor: "bg-red-100" },
    swift: { icon: SiSwift, color: "#FA7343", bgColor: "bg-orange-100" },
    kotlin: { icon: SiKotlin, color: "#7F52FF", bgColor: "bg-purple-100" },
  
    // Frameworks and technologies
    react: { icon: FaReact, color: "#61DAFB", bgColor: "bg-cyan-100" },
    database: { icon: FaDatabase, color: "#336791", bgColor: "bg-blue-100" },
    backend: { icon: FaServer, color: "#6B7280", bgColor: "bg-gray-100" },
    mobile: { icon: FaMobile, color: "#3B82F6", bgColor: "bg-blue-100" },
    cli: { icon: FaTerminal, color: "#000000", bgColor: "bg-gray-100" },
    ai: { icon: FaRobot, color: "#10B981", bgColor: "bg-green-100" },
  
    // Default
    default: { icon: FaCode, color: "#6B7280", bgColor: "bg-gray-100" },
  };
  
  // Utility function to fetch the corresponding icon
  export function getJourneyIcon(slug: string) {
    return journeyIconMap[slug as JourneyIconKey] || journeyIconMap.default;
  }
  