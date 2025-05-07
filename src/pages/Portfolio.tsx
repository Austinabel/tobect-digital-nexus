
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Portfolio = () => {
  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      category: 'Web Development',
      description: 'A fully responsive e-commerce solution with advanced filtering, payment integration, and inventory management.',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 2,
      title: 'Banking Mobile App',
      category: 'App Development',
      description: 'Secure mobile banking application with biometric authentication and transaction history.',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 3,
      title: 'Corporate Branding',
      category: 'Graphics & Design',
      description: 'Complete brand identity package including logo design, style guide, and marketing materials.',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 4,
      title: 'Social Media Campaign',
      category: 'Marketing',
      description: 'Strategic social media campaign that increased engagement by 200% and generated new leads.',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 5,
      title: 'Educational Platform',
      category: 'Web Development',
      description: 'Learning management system with course creation tools, assessment features, and student tracking.',
      image: 'bg-tobecatGray-200'
    },
    {
      id: 6,
      title: 'Restaurant Booking System',
      category: 'Web & App Development',
      description: 'Integrated booking system with table management and customer notification features.',
      image: 'bg-tobecatGray-200'
    },
  ];
  
  const categories = ['All', 'Web Development', 'App Development', 'Graphics & Design', 'Marketing'];
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Our Portfolio</h1>
            <p className="text-xl text-tobecatGray-600">Showcasing our best work across various industries</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-white border border-tobecatGray-200 hover:bg-tobecatBlue-50 hover:border-tobecatBlue-200 text-tobecatGray-700 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className={`${project.image} h-60 flex items-center justify-center`}>
                  <span className="text-tobecatGray-500">Project Image</span>
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-sm rounded-full bg-tobecatBlue-50 text-tobecatBlue-700 mb-3">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold mb-2 text-tobecatGray-900">{project.title}</h3>
                  <p className="text-tobecatGray-600 mb-4">{project.description}</p>
                  <a 
                    href="#" 
                    className="inline-block text-tobecatBlue-600 hover:text-tobecatBlue-800 font-medium transition-colors"
                  >
                    View Case Study →
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded-md transition-colors shadow-md">
              Load More Projects
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Portfolio;
