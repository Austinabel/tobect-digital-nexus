import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { services } from '@/data/services';

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
      isScrolled ? 'bg-sky-600 shadow-md py-2' : 'bg-gradient-to-r from-tobecatBlue-600 to-tobecatBlue-500 py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-white animate-fade-in hover:opacity-90 transition-opacity">
            <img 
              src="/lovable-uploads/a2e171ee-9464-4e14-bc3f-2ac5942fb55f.png" 
              alt="Tobecat Technologies Logo" 
              className="h-12 md:h-14 transition-transform hover:scale-105 duration-300"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105 flex items-center">
              Services <ChevronDown size={16} className="ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white animate-fade-in">
              {services.map((service) => (
                <DropdownMenuItem key={service.id} className="hover:bg-sky-50">
                  <Link 
                    to={`/services#${service.id}`} 
                    className="w-full py-1"
                    onClick={() => {
                      // Ensure the tab is activated when clicked
                      const element = document.getElementById(`tab-${service.id}`);
                      if (element) {
                        setTimeout(() => element.click(), 100);
                      }
                    }}
                  >
                    {service.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/products" className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105">
            Products
          </Link>
          <Link to="/portfolio" className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105">
            Portfolio
          </Link>
          <Link to="/about" className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105">
            About Us
          </Link>
          <Link to="/blog" className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105">
            Blog
          </Link>
          <Link to="/testimonials" className="font-medium text-white hover:text-orange-300 transition-colors transform duration-200 hover:scale-105">
            Testimonials
          </Link>
          <Link to="/quote">
            <Button className="bg-orange-500 text-white hover:bg-orange-600 transition-transform hover:scale-105 shadow-lg">
              Get a Quote
            </Button>
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:text-orange-300"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-sky-700 shadow-lg absolute w-full animate-fade-in">
          <div className="flex flex-col py-4 px-4 space-y-4">
            <div className="relative">
              <button
                className="font-medium text-white hover:text-orange-300 transition-colors py-2 flex items-center w-full"
                onClick={(e) => {
                  e.preventDefault();
                  const subMenu = document.getElementById('mobileServicesMenu');
                  if (subMenu) {
                    subMenu.classList.toggle('hidden');
                  }
                }}
              >
                Services <ChevronDown size={16} className="ml-1" />
              </button>
              <div id="mobileServicesMenu" className="hidden pl-4 mt-2 space-y-2">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services#${service.id}`}
                    className="block text-white hover:text-orange-300 py-1"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      // Ensure the tab is activated when clicked
                      setTimeout(() => {
                        const element = document.getElementById(`tab-${service.id}`);
                        if (element) {
                          element.click();
                        }
                      }, 100);
                    }}
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/products"
              className="font-medium text-white hover:text-orange-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/portfolio"
              className="font-medium text-white hover:text-orange-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Portfolio
            </Link>
            <Link
              to="/about" 
              className="font-medium text-white hover:text-orange-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/blog"
              className="font-medium text-white hover:text-orange-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/testimonials"
              className="font-medium text-white hover:text-orange-300 transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              to="/quote"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button 
                className="bg-orange-500 text-white hover:bg-orange-600 w-full"
              >
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
