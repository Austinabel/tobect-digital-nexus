
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "Digital Partner";
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Create autoplay plugin with 5 second delay and no stopping on interaction
  const autoplayOptions = {
    delay: 5000,
    stopOnInteraction: false,
  };
  
  const autoplayPlugin = useRef(
    Autoplay(autoplayOptions)
  );

  // Create embla carousel ref with proper configuration for fade effect
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      skipSnaps: false,
      duration: 20 // Slower transition for better fade effect
    },
    [autoplayPlugin.current]
  );

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

  // Handle slide change to update active index
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    
    // Preload all images to prevent flashing
    const preloadImages = () => {
      carouselImages.forEach(image => {
        const img = new Image();
        img.src = image.src;
      });
    };
    
    preloadImages();
    
    // Return a cleanup function
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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
    <section className="relative h-screen w-full overflow-hidden border-b border-gray-200">
      {/* Full-page background carousel */}
      <div className="absolute inset-0 w-full h-full z-0 embla-carousel bg-black">
        <div className="w-full h-full overflow-hidden" ref={emblaRef}>
          <div className="carousel-fade h-full flex">
            {carouselImages.map((image, index) => (
              <div 
                key={index} 
                className={`carousel-fade-item min-w-0 w-full h-full flex-shrink-0 ${index === activeIndex ? 'is-selected' : ''}`}
                style={{ flex: '0 0 100%' }}
              >
                <div className="relative w-full h-full">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content overlay */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center text-white border border-white/10 bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in">
            Your <span className="text-tobecatBlue-300 relative">
              {typedText}
              {!isTypingComplete && (
                <span className="absolute -right-1 top-0 h-full w-1 bg-tobecatBlue-300 animate-pulse"></span>
              )}
            </span> for Business Success
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '1s' }}>
            We provide comprehensive IT solutions tailored to help your business grow, 
            from stunning design to cutting-edge development and strategic marketing.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <Link to="/services">
              <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white px-8 py-6 text-lg hover:scale-105 transition-transform border border-tobecatBlue-400">
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/get-quote">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg hover:scale-105 transition-transform">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats overlay boxes - positioned absolutely */}
      <div className="absolute bottom-10 right-10 z-20 hidden lg:block">
        <div className="bg-tobecatAccent-purple text-white p-4 rounded-lg shadow-lg transform hover:scale-110 transition-transform border border-white/20">
          <p className="font-bold text-xl">10+ Services</p>
          <p className="text-sm">For Your Business</p>
        </div>
      </div>
      
      {/* Client satisfaction box - adjusted position to be below the navbar */}
      <div className="absolute top-24 left-10 z-20 hidden lg:block">
        <div className="bg-tobecatAccent-orange text-white p-4 rounded-lg shadow-lg transform hover:scale-110 transition-transform border border-white/20">
          <p className="font-bold text-xl">100%</p>
          <p className="text-sm">Client Satisfaction</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
