"use client";

import { navItems } from "@/data";
import React from "react";
import Hero from "@/components/frontpage/Hero";
import Method from "@/components/frontpage/Method";
import { NavigationBar } from "@/components/frontpage/NavigationBar";
import Journeys from "@/components/frontpage/Journeys";
import Footer from "@/components/frontpage/Footer";
import BenefitsAndTestimonials from "@/components/frontpage/BenefitsAndTestimonials";

const HomePage = () => {
  return (
    <main className="relative flex flex-col w-full min-h-screen">
      {/* Fixed gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#2B6CB0] to-[#3182CE] opacity-95 -z-10" />

      {/* Fixed width navigation bar */}
      <NavigationBar navItems={navItems} className="w-full z-50" />

      {/* Content with consistent spacing */}
      <div className="relative w-full flex-1 flex flex-col">
        <Hero />
        <Method />
        <Journeys />
        <BenefitsAndTestimonials />
        <Footer />
      </div>
    </main>
  );
};

export default HomePage;
