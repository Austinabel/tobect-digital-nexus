
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-display font-bold text-tobecatBlue-600">
            Tobecat
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#services" className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors">
            Services
          </a>
          <a href="#about" className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors">
            About Us
          </a>
          <a href="#portfolio" className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors">
            Portfolio
          </a>
          <a href="#contact" className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors">
            Contact
          </a>
          <Button className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white">
            Get a Quote
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-tobecatGray-700 hover:text-tobecatBlue-600"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col py-4 px-4 space-y-4">
            <a 
              href="#services" 
              className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="#about" 
              className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a 
              href="#portfolio" 
              className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portfolio
            </a>
            <a 
              href="#contact" 
              className="font-medium text-tobecatGray-700 hover:text-tobecatBlue-600 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </a>
            <Button 
              className="bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get a Quote
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
