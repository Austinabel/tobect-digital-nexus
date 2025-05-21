
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "Digital Partner";
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setTypedText('');
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setTypedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Carousel images
  const carouselImages = [
    {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      alt: "IT Professional workspace"
    },
    {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      alt: "Business team collaborating"
    },
    {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      alt: "Modern tech office"
    }
  ];

  return (
    <section className="relative pt-24 md:pt-32 pb-20 md:pb-32 bg-gradient-to-br from-tobecatBlue-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tobecatGray-900 leading-tight">
              Your <span className="text-tobecatBlue-600 relative">
                {typedText}
                {!isTypingComplete && (
                  <span className="absolute -right-1 top-0 h-full w-1 bg-tobecatBlue-600 animate-pulse"></span>
                )}
              </span> for Business Success
            </h1>
            <p className="mt-6 text-lg md:text-xl text-tobecatGray-600 max-w-xl animate-fade-in" style={{ animationDelay: '1s' }}>
              We provide comprehensive IT solutions tailored to help your business grow, 
              from stunning design to cutting-edge development and strategic marketing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '1.5s' }}>
              <Link to="/services">
                <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white px-8 py-6 text-lg hover:scale-105 transition-transform">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/get-quote">
                <Button variant="outline" className="border-tobecatBlue-600 text-tobecatBlue-600 hover:bg-tobecatBlue-50 px-8 py-6 text-lg hover:scale-105 transition-transform">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 lg:pl-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Carousel className="w-full relative">
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative transform hover-scale-image hover-gradient-overlay transition-all hover:scale-[1.02] duration-300">
                      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-auto"
                        />
                      </div>
                      {index === 0 && (
                        <>
                          <div className="absolute -bottom-6 -right-6 bg-tobecatAccent-purple text-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:-translate-y-1">
                            <p className="font-bold text-xl">10+ Services</p>
                            <p className="text-sm">For Your Business</p>
                          </div>
                          <div className="absolute -top-6 -left-6 bg-tobecatAccent-orange text-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:translate-y-1">
                            <p className="font-bold text-xl">100%</p>
                            <p className="text-sm">Client Satisfaction</p>
                          </div>
                        </>
                      )}
                      {index === 1 && (
                        <div className="absolute -bottom-6 -right-6 bg-tobecatAccent-orange text-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:-translate-y-1">
                          <p className="font-bold text-xl">24/7</p>
                          <p className="text-sm">Customer Support</p>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="absolute -top-6 -right-6 bg-tobecatAccent-purple text-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:translate-y-1">
                          <p className="font-bold text-xl">15+ Years</p>
                          <p className="text-sm">Industry Experience</p>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 lg:-left-4 bg-white/80 hover:bg-white" />
              <CarouselNext className="right-2 lg:-right-4 bg-white/80 hover:bg-white" />
              
              {/* Carousel indicators */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {carouselImages.map((_, index) => (
                  <div 
                    key={index} 
                    className="w-2 h-2 rounded-full bg-tobecatBlue-300 transition-all duration-300"
                  ></div>
                ))}
              </div>
            </Carousel>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-tobecatBlue-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-tobecatAccent-purple rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
    </section>
  );
};

export default Hero;
