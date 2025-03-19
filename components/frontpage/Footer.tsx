"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaLocationArrow,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiDocker,
  SiPrisma,
  SiFirebase,
  SiPostgresql,
} from "react-icons/si";
import MagicButton from "@/components/frontpage/MagicButton";

interface TechLogo {
  id: number;
  icon: React.ReactNode;
  name: string;
}

const techLogos: TechLogo[] = [
  { id: 1, icon: <SiReact className="text-blue-400" />, name: "React" },
  { id: 2, icon: <SiNextdotjs className="text-white" />, name: "Next.js" },
  {
    id: 3,
    icon: <SiTailwindcss className="text-cyan-400" />,
    name: "Tailwind CSS",
  },
  {
    id: 4,
    icon: <SiTypescript className="text-blue-500" />,
    name: "TypeScript",
  },
  { id: 5, icon: <SiDocker className="text-blue-500" />, name: "Docker" },
  { id: 6, icon: <SiPrisma className="text-white" />, name: "Prisma" },
  { id: 7, icon: <SiFirebase className="text-yellow-500" />, name: "Firebase" },
  {
    id: 8,
    icon: <SiPostgresql className="text-blue-400" />,
    name: "PostgreSQL",
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 relative z-10 pb-10 bg-[#252669]">
      <div className="w-full absolute left-0 -bottom-72 min-h-96">
        <img
          src="/footer-grid.svg"
          alt="grid"
          className="w-full h-full opacity-50"
        />
      </div>

      {/* Technology Logos */}
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white text-center mb-10"
        >
          Built With Leading Technologies
        </motion.h2>

        <div className="flex flex-col items-center gap-16 mb-20">
          {/* First row of 4 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-16">
            {techLogos.slice(0, 4).map((logo) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: logo.id * 0.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-3 hover:bg-white/10 transition-colors">
                  <div className="text-4xl">{logo.icon}</div>
                </div>
                <span className="text-white/70 text-sm">{logo.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Second row of 4 logos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-16">
            {techLogos.slice(4, 8).map((logo) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: (logo.id - 4) * 0.05 + 0.2,
                }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-3 hover:bg-white/10 transition-colors">
                  <div className="text-4xl">{logo.icon}</div>
                </div>
                <span className="text-white/70 text-sm">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center mt-10 mb-16">
          <h1 className="heading lg:max-w-[45vw] text-center">
            Interested? Try our CodeCamp for{" "}
            <span className="text-purple">free</span>!
          </h1>
          <a href="mailto:support@codingjourney.edu">
            <MagicButton
              title="ENROLL NOW"
              icon={<FaLocationArrow />}
              position="right"
            />
          </a>
        </div>

        {/* Footer Info */}
        <div className="flex mt-16 md:flex-row flex-col justify-between items-center">
          <p className="md:text-base text-sm md:font-normal font-light text-white/70">
            © 2025 Tinkerithm. All rights reserved.
          </p>

          <div className="flex items-center md:gap-3 gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FaTwitter className="h-5 w-5 text-white" />
            </a>
            <a
              href="#"
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FaInstagram className="h-5 w-5 text-white" />
            </a>
            <a
              href="#"
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FaFacebook className="h-5 w-5 text-white" />
            </a>
            <a
              href="#"
              className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <FaLinkedin className="h-5 w-5 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
