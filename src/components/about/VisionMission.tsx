
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const VisionMission = () => {
  return (
    <div className="bg-gradient-to-br from-tobecatBlue-50 to-white py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-6">
            Our Vision & Mission
          </h2>
          <Separator className="w-20 h-1 bg-orange-500 mx-auto" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="h-16 w-16 rounded-full bg-tobecatBlue-100 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center text-tobecatGray-900 mb-6">Our Vision</h3>
              <p className="text-tobecatGray-700 text-center">
                To be a leading technology solutions provider in Africa, empowering businesses through innovation, 
                creativity, and excellence. We aim to drive digital transformation that creates lasting impact for 
                our clients and communities.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-center text-tobecatGray-900 mb-6">Our Mission</h3>
              <p className="text-tobecatGray-700 text-center">
                To deliver cutting-edge technology services and solutions that drive growth, efficiency, and 
                success for our clients. We are committed to understanding each client's unique needs and 
                providing tailored solutions with exceptional service and support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisionMission;
