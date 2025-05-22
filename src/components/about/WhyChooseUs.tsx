
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const WhyChooseUs = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-6">
          Why Choose Tobecat Technologies?
        </h2>
        <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto mb-6">
          We're committed to delivering exceptional value through our services and approach.
        </p>
        <Separator className="w-20 h-1 bg-orange-500 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-tobecatBlue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-tobecatBlue-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">Experienced Team</h3>
            <p className="text-tobecatGray-600">
              Our team brings years of industry experience and expertise to every project, 
              ensuring high-quality solutions that meet your business needs.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">Affordable Pricing</h3>
            <p className="text-tobecatGray-600">
              We offer competitive rates without compromising on quality, 
              ensuring excellent value and return on your investment.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">Timely Delivery</h3>
            <p className="text-tobecatGray-600">
              We respect your time and deadlines, ensuring projects are completed 
              efficiently without compromising on quality.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">Customer-Centric</h3>
            <p className="text-tobecatGray-600">
              We put our clients at the center of everything we do, listening to your needs 
              and tailoring solutions that help you achieve your goals.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-pink-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">Innovation</h3>
            <p className="text-tobecatGray-600">
              We stay ahead of technological trends and bring innovative solutions 
              that give your business a competitive edge.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-4 text-tobecatGray-900">After-Sales Support</h3>
            <p className="text-tobecatGray-600">
              Our relationship doesn't end after project completion. We provide ongoing 
              support to ensure your solutions continue performing optimally.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhyChooseUs;
