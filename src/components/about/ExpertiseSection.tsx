
import React from 'react';
import { services } from '@/data/services';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ExpertiseSection = () => {
  // Extract main service categories for the expertise section
  const mainServiceCategories = services.slice(0, 4);
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-28">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-6">
          Our Expertise
        </h2>
        <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto mb-6">
          We offer a comprehensive range of digital and technology services designed to help 
          businesses thrive in today's competitive landscape.
        </p>
        <Separator className="w-20 h-1 bg-orange-500 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
        {mainServiceCategories.map((service) => (
          <Card key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
            <CardContent className="p-0">
              <div className="h-14 w-14 rounded-full bg-tobecatBlue-100 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">{service.title}</h3>
              <p className="text-tobecatGray-600 mb-5">{service.description}</p>
              <ul className="space-y-3 text-left">
                {service.subcategories.slice(0, 3).map((sub) => (
                  <li key={sub.id} className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-1" />
                    <span className="text-tobecatGray-700">{sub.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mb-10">
        <Button asChild className="px-8 py-6 h-auto bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md shadow-md text-lg">
          <Link to="/services">View All Services</Link>
        </Button>
      </div>
    </div>
  );
};

export default ExpertiseSection;
