"use client";

import React from "react";
import { motion } from "framer-motion";

const FAQ: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-20"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
        Frequently Asked Questions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-3">
            How do I get started?
          </h3>
          <p className="text-white/70">
            Getting started is easy! Simply click on the "Sign Up" button and
            create your account. You'll then be guided through selecting your
            first coding journey.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-3">
            Do I need any prior experience?
          </h3>
          <p className="text-white/70">
            Not at all! Our platform is designed for learners of all levels,
            from complete beginners to advanced coders looking to sharpen their
            skills.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-3">
            Is there a free trial?
          </h3>
          <p className="text-white/70">
            Yes! We offer a 7-day free trial that gives you access to the first
            stage of each coding journey. No credit card required to try it out.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-3">
            Can I switch between journeys?
          </h3>
          <p className="text-white/70">
            Absolutely! You can work on multiple coding journeys simultaneously
            or switch between them at any time. Your progress is saved
            separately for each journey.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
