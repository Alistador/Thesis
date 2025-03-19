"use client";

import React from "react";
import { motion } from "framer-motion";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { InfiniteMovingCards } from "@/components/ui/InfiniteCards";

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    role: "CS Student",
    content:
      "This platform made learning Python so much easier. The interactive challenges helped me understand concepts that I struggled with in class.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Career Changer",
    content:
      "As someone switching careers into tech, these coding journeys gave me the structure I needed to build my skills methodically.",
  },
  {
    id: 3,
    name: "Miguel Rodriguez",
    role: "Frontend Developer",
    content:
      "The web development track helped me fill gaps in my knowledge. Now I feel confident tackling complex projects at work.",
  },
  {
    id: 4,
    name: "Emma Wilson",
    role: "High School Teacher",
    content:
      "I use this platform with my students. The gamification elements keep them engaged and excited about learning to code.",
  },
  {
    id: 5,
    name: "Raj Patel",
    role: "Data Scientist",
    content:
      "The Python journey's focus on data structures helped me improve my algorithmic thinking for data science applications.",
  },
];

const BenefitsAndTestimonials: React.FC = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background effect */}
      <BackgroundBeams className="absolute inset-0 z-0 opacity-20" />

      <div className="relative z-10 container mx-auto px-4">
        {/* User types section */}
        <TracingBeam className="py-10">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
              Who Benefits?
            </h2>

            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Beginner Programmers
                </h3>
                <p className="text-white/70">
                  Step-by-step guidance through fundamental concepts with
                  interactive challenges that provide immediate feedback and
                  helpful hints when you get stuck.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Intermediate Learners
                </h3>
                <p className="text-white/70">
                  Structured pathways to develop deeper understanding of
                  programming concepts, data structures, and algorithms through
                  practical application.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  Advanced Coders
                </h3>
                <p className="text-white/70">
                  Complex challenges and projects that push your skills to new
                  heights, with performance optimization tasks and advanced
                  architectural patterns.
                </p>
              </motion.div>
            </div>
          </div>
        </TracingBeam>

        {/* Testimonials slider */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            User Testimonials
          </h2>

          <div className="h-[30vh] md:h-[40vh] rounded-md flex flex-col items-center justify-center relative overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsAndTestimonials;
