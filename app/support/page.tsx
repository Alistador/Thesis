"use client";

import React from "react";
import { NavigationBar } from "@/components/frontpage/NavigationBar";
import ContactForm from "@/components/frontpage/ContactForm";
import { motion } from "framer-motion";

export default function SupportPage() {
  // Sample navigation items for the navigation bar
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Features", link: "/features" },
    { name: "Pricing", link: "/pricing" },
    { name: "About", link: "/about" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-900 to-indigo-900">
      {/* Navigation Bar */}
      <NavigationBar navItems={navItems} />

      {/* Support Page Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            We're Here to Help
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get in touch with our support team for assistance with any questions
            or issues.
          </p>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="bg-sky-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Help Center
            </h3>
            <p className="text-white/70 mb-4">
              Browse our documentation for tutorials and common questions.
            </p>
            <a
              href="/help"
              className="text-sky-400 hover:text-sky-300 inline-flex items-center"
            >
              Visit help center
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <div className="bg-sky-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Email Support
            </h3>
            <p className="text-white/70 mb-4">
              Contact us via email and we'll respond within 24 hours.
            </p>
            <a
              href="#contact-form"
              className="text-sky-400 hover:text-sky-300 inline-flex items-center"
            >
              Send an email
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          id="contact-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Get in Touch
          </h2>

          <ContactForm />
        </motion.div>

        {/* Support Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Our Support Policy
          </h2>
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <p className="text-white/70 mb-4">
              We strive to respond to all support inquiries within 24 hours
              during business days. For urgent matters, please use the live chat
              option during business hours (Monday-Friday, 9am-5pm EST).
            </p>
            <p className="text-white/70">
              Premium subscribers receive priority support with guaranteed
              response times of 4 hours or less during business hours.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-white/60">
          <p>© 2025 Tinkerithm. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
