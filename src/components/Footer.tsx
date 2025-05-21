
import { Facebook, Twitter, Instagram, Linkedin, Briefcase, Book, Users, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-6">
              <h1 className="font-display text-4xl font-bold tracking-wider text-white">
                TOBECAT
              </h1>
            </div>
            <p className="text-gray-300 mb-6">
              Your one-stop IT solutions partner for business growth and digital transformation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/services#design" className="text-gray-300 hover:text-orange-300 transition-colors">
                  Graphics & Design
                </Link>
              </li>
              <li>
                <Link to="/services#development" className="text-gray-300 hover:text-orange-300 transition-colors">
                  Web & App Development
                </Link>
              </li>
              <li>
                <Link to="/services#business" className="text-gray-300 hover:text-orange-300 transition-colors">
                  CAC & Business Registration
                </Link>
              </li>
              <li>
                <Link to="/services#marketing" className="text-gray-300 hover:text-orange-300 transition-colors">
                  Marketing & Advertising
                </Link>
              </li>
              <li>
                <Link to="/services#social" className="text-gray-300 hover:text-orange-300 transition-colors">
                  Social Media Management
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-orange-300 transition-colors flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="text-gray-300 hover:text-orange-300 transition-colors flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Portfolio
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-300 hover:text-orange-300 transition-colors flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-orange-300 transition-colors flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:text-orange-300 transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <span className="mr-2">📍</span>
                Lagos, Nigeria
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">📱</span>
                +234 800 TOBECAT
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">✉️</span>
                info@tobecat.com
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">🕙</span>
                Mon-Fri: 9AM - 5PM
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Tobecat. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 text-sm hover:text-orange-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 text-sm hover:text-orange-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 text-sm hover:text-orange-300 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
