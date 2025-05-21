
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect, useState } from 'react';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className={`w-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Hero />
        <div className="animate-fade-in w-full" style={{ animationDelay: '0.3s' }}>
          <ServicesSection />
        </div>
        <div className="animate-fade-in w-full" style={{ animationDelay: '0.5s' }}>
          <FeaturedProducts />
        </div>
        <div className="animate-fade-in w-full" style={{ animationDelay: '0.7s' }}>
          <ContactSection />
        </div>
        <div className="animate-fade-in w-full" style={{ animationDelay: '0.9s' }}>
          <Footer />
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Index;
