
import { useState } from 'react';
import { services } from '@/data/services';
import ServiceCard from './ServiceCard';
import { Button } from '@/components/ui/button';

const ServicesSection = () => {
  const [displayCount, setDisplayCount] = useState(6);
  
  const showMore = () => {
    setDisplayCount(services.length);
  };
  
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-4">
            Our <span className="text-tobecatBlue-600">Services</span>
          </h2>
          <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto">
            We offer a comprehensive range of IT services to help your business thrive in the digital landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, displayCount).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        
        {displayCount < services.length && (
          <div className="mt-12 text-center">
            <Button 
              onClick={showMore}
              className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white"
            >
              View All Services
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
