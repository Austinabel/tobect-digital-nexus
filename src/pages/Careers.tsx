
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Careers = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Front-end Developer',
      location: 'Lagos, Nigeria (Hybrid)',
      department: 'Web Development',
      type: 'Full-time',
      description: 'We are looking for an experienced Front-end Developer to join our team and help create outstanding user experiences for our clients.'
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      location: 'Lagos, Nigeria (Remote)',
      department: 'Design',
      type: 'Full-time',
      description: 'Join our design team to create intuitive, engaging interfaces for web and mobile applications.'
    },
    {
      id: 3,
      title: 'Digital Marketing Specialist',
      location: 'Lagos, Nigeria (On-site)',
      department: 'Marketing',
      type: 'Full-time',
      description: 'Drive our marketing efforts across digital channels and help grow our client base through strategic campaigns.'
    },
    {
      id: 4,
      title: 'Mobile App Developer',
      location: 'Lagos, Nigeria (Remote)',
      department: 'App Development',
      type: 'Full-time',
      description: 'Develop high-quality mobile applications for iOS and Android platforms using modern frameworks like React Native or Flutter.'
    }
  ];
  
  const benefits = [
    'Competitive salary packages',
    'Health insurance coverage',
    'Flexible work arrangements (Remote/Hybrid options)',
    'Career advancement opportunities',
    'Continuous learning and development',
    'Collaborative and supportive work environment',
    'Paid time off and holidays'
  ];
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Careers at Tobecat</h1>
            <p className="text-xl text-tobecatGray-600">Join our team and grow your career with us</p>
          </div>
          
          <div className="bg-tobecatBlue-50 p-8 rounded-lg mb-16">
            <h2 className="text-2xl font-bold mb-4 text-tobecatGray-900">Why Work With Us?</h2>
            <p className="text-tobecatGray-700 mb-6">
              At Tobecat, we're building a team of passionate, creative individuals who are excited about technology and its potential to transform businesses. We offer a supportive environment where innovation is encouraged, and professional growth is prioritized.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 text-tobecatGray-900">Our Benefits</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-tobecatGray-700">
                  <span className="text-tobecatBlue-500 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-tobecatGray-900">Open Positions</h2>
          <div className="space-y-6 mb-16">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-tobecatBlue-600">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <h3 className="text-xl font-bold text-tobecatGray-900">{job.title}</h3>
                  <div className="flex flex-wrap mt-2 md:mt-0 gap-2">
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatBlue-50 text-tobecatBlue-700">
                      {job.department}
                    </span>
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatGreen-50 text-tobecatGreen-700">
                      {job.type}
                    </span>
                  </div>
                </div>
                <p className="text-tobecatGray-500 mb-3">{job.location}</p>
                <p className="text-tobecatGray-700 mb-4">{job.description}</p>
                <a 
                  href="#" 
                  className="inline-block px-6 py-2 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded transition-colors"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
          
          <div className="bg-tobecatGray-100 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-tobecatGray-900">Don't See a Position That Fits?</h2>
            <p className="text-tobecatGray-700 mb-6">
              We're always looking for talented individuals to join our team. Send your resume, and we'll keep it on file for future opportunities.
            </p>
            <a 
              href="#" 
              className="inline-block px-6 py-2 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded transition-colors"
            >
              Submit Open Application
            </a>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Careers;
