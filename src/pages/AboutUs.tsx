
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HeroSection from '@/components/about/HeroSection';
import CompanyOverview from '@/components/about/CompanyOverview';
import VisionMission from '@/components/about/VisionMission';
import ExpertiseSection from '@/components/about/ExpertiseSection';
import TechEquipmentSection from '@/components/about/TechEquipmentSection';
import WhyChooseUs from '@/components/about/WhyChooseUs';
import CTASection from '@/components/about/CTASection';

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        <CompanyOverview />
        <VisionMission />
        <ExpertiseSection />
        <TechEquipmentSection />
        <WhyChooseUs />
        <CTASection />
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default AboutUs;
