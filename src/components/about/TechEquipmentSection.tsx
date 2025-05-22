
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const TechEquipmentSection = () => {
  return (
    <div className="bg-gradient-to-br from-tobecatGray-800 to-blackOlive py-24 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tech Equipment & Solutions
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
              Beyond digital services, we're a trusted supplier of high-quality tech equipment providing 
              sales, installation, and support services.
            </p>
            <Separator className="w-20 h-1 bg-orange-500 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Security Solutions</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>CCTV Surveillance Systems</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>Alarm & Access Control Systems</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>Security Integration Services</span>
                </li>
              </ul>
            </div>
            
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Power Solutions</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>Solar Energy Systems</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>Inverters & Lithium Batteries</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={18} className="text-green-400 mr-3" />
                  <span>Installation & Maintenance</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild className="px-8 py-6 h-auto bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md shadow-md text-lg">
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechEquipmentSection;
