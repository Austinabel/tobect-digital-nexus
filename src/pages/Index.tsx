
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Hero />
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <ServicesSection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <ContactSection />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
