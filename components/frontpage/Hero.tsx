import { FaLocationArrow } from "react-icons/fa6";
import { FaCode, FaInfinity, FaGamepad, FaUserAlt } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import MagicButton from "./MagicButton";
import { Spotlight } from "../ui/Spotlight";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { Meteors } from "../ui/Meteors";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import { TypewriterEffect } from "../ui/typewriter-effect";
import LogInForm from "../authentication/LogInForm";
import { motion } from "framer-motion";

const Hero = () => {
  const benefitItems = [
    {
      icon: <FaCode className="w-6 h-6 text-white" />,
      title: "Practice-Driven",
      color: "bg-blue-600",
    },
    {
      icon: <FaInfinity className="w-6 h-6 text-white" />,
      title: "Unlimited",
      color: "bg-blue-500",
    },
    {
      icon: <FaGamepad className="w-6 h-6 text-white" />,
      title: "Fun",
      color: "bg-blue-400",
    },
    {
      icon: <FaUserAlt className="w-6 h-6 text-white" />,
      title: "Personalized",
      color: "bg-blue-500",
    },
    {
      icon: <BsRobot className="w-6 h-6 text-white" />,
      title: "AI Enhanced",
      color: "bg-blue-600",
    },
  ];

  // For platform title with STUDENTS highlighted differently
  const words = [
    {
      text: "Dedicated online programming learning platform for",
    },
    {
      text: "STUDENTS",
      className:
        "bg-gradient-to-r from-blue-400 to-blue-200 text-transparent bg-clip-text font-bold animate-pulse",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full min-h-screen flex flex-col justify-start pt-12">
      {/* Solid Background Color */}
      <div className="absolute inset-0 bg-[#19395E]" />

      {/* Spotlight Effects */}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="#2B4D74"
        />
        <Spotlight className="h-screen w-1/2 top-10 left-full" fill="#345B86" />
        <Spotlight className="left-80 top-28 h-screen w-1/2" fill="#4D75A3" />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-white/[0.02] backdrop-blur-sm" />
      </div>

      {/* Meteors Effect */}
      <Meteors number={40} />

      {/* Content Section */}
      <div className="flex justify-center relative z-10 w-full py-12 md:py-16 lg:py-20">
        <div className="w-full max-w-7xl px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-8">
              <div className="text-[28px] md:text-3xl lg:text-4xl xl:text-5xl leading-tight font-semibold">
                <span className="text-white">
                  Dedicated online programming learning platform for{" "}
                </span>
                <span className="relative inline-block group">
                  {/* Enhanced highlight using existing animations */}
                  <span className="relative">
                    {/* Main text with shimmer effect on hover */}
                    <span className="text-blue-300 font-extrabold relative bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:via-white group-hover:to-blue-300 group-hover:text-transparent group-hover:bg-[length:200%_100%] group-hover:animate-shimmer">
                      students
                    </span>

                    {/* Gradient underline */}
                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-blue-300 to-blue-600 rounded-full"></span>

                    {/* Moving highlight on the underline - using your animation */}
                    <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-70 rounded-full animate-moveLight"></span>

                    {/* Spotlight glow effect that appears on hover */}
                    <div className="absolute -inset-1 -z-10 opacity-0 group-hover:opacity-100 transition duration-700 blur-xl bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 group-hover:animate-moveHorizontal"></div>
                  </span>
                </span>
              </div>
            </div>

            {/* Benefits List and Character */}
            <div className="mt-8 relative flex flex-col md:flex-row items-center justify-between w-full mb-8">
              {/* Benefits List on the left */}
              <div className="flex-1 order-2 md:order-1 max-w-md">
                {benefitItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className={`${item.color} p-2 rounded-lg`}>
                      {item.icon}
                    </div>
                    <span className="text-white font-medium">{item.title}</span>
                  </motion.div>
                ))}
              </div>

              {/* Character Mascot on the right */}
              <motion.div
                className="order-1 md:order-2 md:ml-auto"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              >
                <img
                  src="/character_1.svg"
                  alt="Character mascot"
                  className="w-80 h-80 object-contain"
                />
              </motion.div>
            </div>

            {/* Start Learning Button */}
            <div className="mt-6 mb-8 flex justify-center md:justify-start">
              <MagicButton
                title="START LEARNING NOW"
                icon={<FaLocationArrow />}
                position="right"
              />
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-md bg-[#F0F8FF] text-white backdrop-blur-lg rounded-3xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-transparent opacity-70"></div>
              <div className="relative z-10">
                <LogInForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
