
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-24 md:pt-32 pb-20 md:pb-32 bg-gradient-to-br from-tobecatBlue-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tobecatGray-900 leading-tight">
              Your <span className="text-tobecatBlue-600">Digital Partner</span> for Business Success
            </h1>
            <p className="mt-6 text-lg md:text-xl text-tobecatGray-600 max-w-xl">
              We provide comprehensive IT solutions tailored to help your business grow, 
              from stunning design to cutting-edge development and strategic marketing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white px-8 py-6 text-lg">
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-tobecatBlue-600 text-tobecatBlue-600 hover:bg-tobecatBlue-50 px-8 py-6 text-lg">
                Contact Us
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-12">
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80" 
                  alt="IT Professional workspace" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-tobecatAccent-purple text-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-xl">10+ Services</p>
                <p className="text-sm">For Your Business</p>
              </div>
              <div className="absolute -top-6 -left-6 bg-tobecatAccent-orange text-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-xl">100%</p>
                <p className="text-sm">Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-tobecatAccent-purple rounded-full filter blur-3xl opacity-20"></div>
    </section>
  );
};

export default Hero;
