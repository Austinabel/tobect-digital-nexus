
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { services } from '@/data/services';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  // Extract main service categories for the expertise section
  const mainServiceCategories = services.slice(0, 4);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blackOlive to-tobecatGray-800 text-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Tobecat Technologies</h1>
              <p className="text-xl text-gray-200">A dynamic technology company providing innovative solutions since 2018</p>
            </div>
          </div>
        </div>
        
        {/* Company Overview */}
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-tobecatBlue-100 text-tobecatBlue-700 rounded-full font-medium text-sm">
                CAC Registration: 8487955
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900">
                Your Partner in Digital Transformation
              </h2>
              <p className="text-lg text-tobecatGray-700">
                Tobecat Technologies (formerly known as Tobecat Links & Web Solutions) is a forward-thinking 
                technology company founded in 2018. Headquartered in Nigeria, we've grown into a reputable 
                name in the tech industry, providing over 100 services to clients ranging from startups 
                to established enterprises.
              </p>
              <p className="text-lg text-tobecatGray-700">
                Our rebranding reflects our broader vision and commitment to delivering end-to-end tech 
                solutions that go beyond web development and design. We're dedicated to solving real-world 
                problems, empowering businesses, and enhancing digital experiences across various sectors.
              </p>
              <div className="pt-4">
                <Link to="/services" className="inline-block px-6 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white font-medium rounded-md transition-colors shadow-md">
                  Explore Our Services
                </Link>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/lovable-uploads/a46707c1-2f96-483a-922d-aa6761ce4ef1.png" 
                alt="Tobecat Technologies Team" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Vision & Mission */}
        <div className="bg-gradient-to-br from-tobecatBlue-50 to-white py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-4">
                Our Vision & Mission
              </h2>
              <div className="w-20 h-1 bg-orange-500 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-16 w-16 rounded-full bg-tobecatBlue-100 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-center text-tobecatGray-900 mb-4">Our Vision</h3>
                <p className="text-tobecatGray-700 text-center">
                  To be a leading technology solutions provider in Africa, empowering businesses through innovation, 
                  creativity, and excellence. We aim to drive digital transformation that creates lasting impact for 
                  our clients and communities.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-center text-tobecatGray-900 mb-4">Our Mission</h3>
                <p className="text-tobecatGray-700 text-center">
                  To deliver cutting-edge technology services and solutions that drive growth, efficiency, and 
                  success for our clients. We are committed to understanding each client's unique needs and 
                  providing tailored solutions with exceptional service and support.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Our Expertise */}
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-4">
              Our Expertise
            </h2>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of digital and technology services designed to help 
              businesses thrive in today's competitive landscape.
            </p>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {mainServiceCategories.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
                <div className="h-14 w-14 rounded-full bg-tobecatBlue-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">{service.title}</h3>
                <p className="text-tobecatGray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.subcategories.slice(0, 3).map((sub) => (
                    <li key={sub.id} className="flex items-start">
                      <CheckCircle size={18} className="text-green-500 mr-2 mt-1" />
                      <span className="text-tobecatGray-700">{sub.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/services" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors shadow-md">
              View All Services
            </Link>
          </div>
        </div>
        
        {/* Tech Equipment Section */}
        <div className="bg-gradient-to-br from-tobecatGray-800 to-blackOlive py-16 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Tech Equipment & Solutions
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Beyond digital services, we're a trusted supplier of high-quality tech equipment providing 
                  sales, installation, and support services.
                </p>
                <div className="w-20 h-1 bg-orange-500 mx-auto mt-6"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-orange-400">Security Solutions</h3>
                  <ul className="space-y-3">
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
                
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-orange-400">Power Solutions</h3>
                  <ul className="space-y-3">
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
              
              <div className="mt-10 text-center">
                <Link to="/products" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md transition-colors shadow-md">
                  Explore Products
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Why Choose Us */}
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-tobecatGray-900 mb-4">
              Why Choose Tobecat Technologies?
            </h2>
            <p className="text-lg text-tobecatGray-600 max-w-3xl mx-auto">
              We're committed to delivering exceptional value through our services and approach.
            </p>
            <div className="w-20 h-1 bg-orange-500 mx-auto mt-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-tobecatBlue-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-tobecatBlue-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tobecatBlue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">Experienced Team</h3>
              <p className="text-tobecatGray-600">
                Our team brings years of industry experience and expertise to every project, 
                ensuring high-quality solutions that meet your business needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">Affordable Pricing</h3>
              <p className="text-tobecatGray-600">
                We offer competitive rates without compromising on quality, 
                ensuring excellent value and return on your investment.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">Timely Delivery</h3>
              <p className="text-tobecatGray-600">
                We respect your time and deadlines, ensuring projects are completed 
                efficiently without compromising on quality.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">Customer-Centric</h3>
              <p className="text-tobecatGray-600">
                We put our clients at the center of everything we do, listening to your needs 
                and tailoring solutions that help you achieve your goals.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-pink-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">Innovation</h3>
              <p className="text-tobecatGray-600">
                We stay ahead of technological trends and bring innovative solutions 
                that give your business a competitive edge.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-tobecatGray-900">After-Sales Support</h3>
              <p className="text-tobecatGray-600">
                Our relationship doesn't end after project completion. We provide ongoing 
                support to ensure your solutions continue performing optimally.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-tobecatBlue-600 py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Partner with Tobecat Technologies to leverage our expertise for your digital success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/quote" className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-tobecatBlue-600 font-bold rounded-md transition-colors shadow-md">
                Get a Quote
              </Link>
              <Link to="/portfolio" className="inline-block px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold rounded-md transition-colors">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default AboutUs;
