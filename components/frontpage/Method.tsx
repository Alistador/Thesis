// components/Method.jsx
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const Method = () => {
  const methodSteps = [
    {
      id: 1,
      title: "Interactive Python Exercises",
      description:
        "Hands-on coding challenges designed to reinforce concepts through practice.",
      icon: "📝",
    },
    {
      id: 2,
      title: "AI-Assisted Learning",
      description:
        "Get personalized guidance and hints from our AI tutor when you're stuck.",
      icon: "🤖",
    },
    {
      id: 3,
      title: "Real-time Feedback",
      description:
        "Immediate code analysis helps you understand mistakes and improve faster.",
      icon: "⚡",
    },
    {
      id: 4,
      title: "Project-Based Approach",
      description: "Apply your skills to real-world scenarios that matter.",
      icon: "🏗️",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 w-full bg-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Learning Method
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            A powerful blend of interactive Python exercises and AI assistance
            to accelerate your learning journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {methodSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/20 backdrop-blur-md rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:bg-white/25 group"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-white/80 group-hover:text-white transition-colors">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-white/10 rounded-xl p-8 backdrop-blur-md shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                How Our Method Works
              </h3>
              <p className="text-white/80 mb-4">
                Our unique approach combines the best of traditional programming
                education with cutting-edge AI assistance. You'll work through
                carefully designed Python exercises that build your skills
                incrementally.
              </p>
              <p className="text-white/80 mb-4">
                When you encounter challenges, our AI tutor provides
                context-aware hints without giving away the solution—helping you
                learn how to think like a programmer.
              </p>
              <ul className="list-disc pl-6 text-white/80 space-y-2">
                <li>Learn at your own pace with adaptive difficulty</li>
                <li>Receive personalized feedback on your code</li>
                <li>Track your progress with detailed analytics</li>
                <li>Build a portfolio of projects as you learn</li>
              </ul>
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden shadow-xl">
              <div className="relative h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg w-4/5">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="text-white/80 text-sm ml-2">
                      python_exercise.py
                    </div>
                  </div>
                  <div className="font-mono text-sm text-white">
                    <div className="text-green-300">
                      # Define a function to calculate fibonacci sequence
                    </div>
                    <div className="text-white">def fibonacci(n):</div>
                    <div className="text-white pl-4">if n &lt;= 1:</div>
                    <div className="text-white pl-8">return n</div>
                    <div className="text-white pl-4">else:</div>
                    <div className="text-white pl-8">
                      return fibonacci(n-1) + fibonacci(n-2)
                    </div>
                    <div className="mt-2 text-blue-300">
                      # AI Hint: Consider using memoization to improve
                      efficiency
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Method;
