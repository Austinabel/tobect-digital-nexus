
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-tobecatBlue-600 shadow-md py-2' : 'bg-tobecatBlue-500 py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-display font-bold text-white animate-fade-in">
            Tobecat
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/portfolio" className="font-medium text-white hover:text-tobecatGray-100 transition-colors hover:scale-105 transform duration-200">
            Portfolio
          </Link>
          <Link to="/about" className="font-medium text-white hover:text-tobecatGray-100 transition-colors hover:scale-105 transform duration-200">
            About Us
          </Link>
          <Link to="/blog" className="font-medium text-white hover:text-tobecatGray-100 transition-colors hover:scale-105 transform duration-200">
            Blog
          </Link>
          <Link to="/careers" className="font-medium text-white hover:text-tobecatGray-100 transition-colors hover:scale-105 transform duration-200">
            Careers
          </Link>
          <Link to="/testimonials" className="font-medium text-white hover:text-tobecatGray-100 transition-colors hover:scale-105 transform duration-200">
            Testimonials
          </Link>
          <Button className="bg-white text-tobecatBlue-600 hover:bg-tobecatGray-100 transition-transform hover:scale-105">
            Get a Quote
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-tobecatGray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-tobecatBlue-700 shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col py-4 px-4 space-y-4">
            <Link
              to="/portfolio"
              className="font-medium text-white hover:text-tobecatGray-100 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/about" 
              className="font-medium text-white hover:text-tobecatGray-100 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/blog"
              className="font-medium text-white hover:text-tobecatGray-100 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/careers"
              className="font-medium text-white hover:text-tobecatGray-100 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Careers
            </Link>
            <Link
              to="/testimonials"
              className="font-medium text-white hover:text-tobecatGray-100 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Button 
              className="bg-white text-tobecatBlue-600 hover:bg-tobecatGray-100 w-full"
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
