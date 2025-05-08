
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { services } from '@/data/services';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';

const Services = () => {
  const [activeTab, setActiveTab] = useState(services[0].id.toString());

  // Handle hash in URL for direct linking
  useEffect(() => {
    // Get hash from URL (remove the # character)
    const hash = window.location.hash.substring(1);
    if (hash) {
      // If there's a service with this ID, activate its tab
      const service = services.find(s => s.id.toString() === hash);
      if (service) {
        setActiveTab(service.id.toString());
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 md:pt-28 pb-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-tobecatGray-900 mb-4">
              Our <span className="text-tobecatBlue-600">Services</span>
            </h1>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of services designed to help your business thrive in today's digital landscape.
            </p>
          </div>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 overflow-x-auto">
              <TabsList className="w-full justify-start md:justify-center flex-wrap border-b bg-transparent p-0">
                {services.map((service) => {
                  const IconComponent = service.icon && typeof service.icon === 'string' 
                    ? (Icons as any)[service.icon] || Icons.FileText
                    : Icons.FileText;
                  
                  return (
                    <TabsTrigger 
                      key={service.id} 
                      id={`tab-${service.id}`}
                      value={service.id.toString()}
                      className="flex items-center gap-2 py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-tobecatBlue-600 rounded-none bg-transparent data-[state=active]:bg-sky-50 data-[state=active]:text-tobecatBlue-600"
                    >
                      <IconComponent size={18} />
                      {service.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {services.map((service) => {
              const IconComponent = service.icon && typeof service.icon === 'string' 
                ? (Icons as any)[service.icon] || Icons.FileText
                : Icons.FileText;
              
              return (
                <TabsContent 
                  key={service.id} 
                  value={service.id.toString()} 
                  id={service.id.toString()} 
                  className="animate-fade-in"
                >
                  <Card className="p-6 md:p-8 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="p-4 bg-tobecatBlue-100 rounded-lg w-16 h-16 flex items-center justify-center text-tobecatBlue-600">
                          <IconComponent size={32} />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-tobecatGray-800 mb-3">{service.title}</h2>
                        <p className="text-tobecatGray-600 mb-6">{service.description}</p>
                        
                        <h3 className="text-xl font-semibold text-tobecatGray-800 mb-4">Our Specialties</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {service.subcategories.map((subcat) => (
                            <div 
                              key={subcat.id} 
                              className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-start"
                            >
                              <span className="w-2 h-2 rounded-full bg-tobecatBlue-500 mt-2 mr-3 flex-shrink-0"></span>
                              <div>
                                <h4 className="font-medium text-tobecatGray-800">{subcat.name}</h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
