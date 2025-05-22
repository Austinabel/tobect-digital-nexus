
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <div className="bg-tobecatBlue-600 pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Partner with Tobecat Technologies to leverage our expertise for your digital success.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Button asChild className="px-8 py-6 h-auto bg-white hover:bg-gray-100 text-tobecatBlue-600 font-bold rounded-md text-lg shadow-md">
            <Link to="/quote">Get a Quote</Link>
          </Button>
          <Button asChild variant="outline" className="px-8 py-6 h-auto bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold rounded-md text-lg">
            <Link to="/portfolio">View Our Work</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
