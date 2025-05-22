
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CompanyOverview = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="flex justify-center mb-6">
            <div className="inline-block px-4 py-2 bg-tobecatBlue-100 text-tobecatBlue-700 rounded-full font-medium text-sm">
              CAC Registration: 8487955
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900">
            Your Partner in Digital Transformation
          </h2>
          <p className="text-lg text-tobecatGray-700 text-justify">
            Tobecat Technologies (formerly known as Tobecat Links & Web Solutions) is a forward-thinking 
            technology company founded in 2018. Headquartered in Nigeria, we've grown into a reputable 
            name in the tech industry, providing over 100 services to clients ranging from startups 
            to established enterprises.
          </p>
          <p className="text-lg text-tobecatGray-700 text-justify">
            Our rebranding reflects our broader vision and commitment to delivering end-to-end tech 
            solutions that go beyond web development and design. We're dedicated to solving real-world 
            problems, empowering businesses, and enhancing digital experiences across various sectors.
          </p>
          <div className="pt-8 mb-6">
            <Button asChild className="px-6 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white font-medium rounded-md shadow-md">
              <Link to="/services">Explore Our Services</Link>
            </Button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blackOlive to-tobecatGray-800 rounded-lg overflow-hidden shadow-xl">
          <img 
            src="/lovable-uploads/a46707c1-2f96-483a-922d-aa6761ce4ef1.png" 
            alt="Tobecat Technologies Team" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
