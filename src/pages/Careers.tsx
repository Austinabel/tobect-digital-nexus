
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import JobApplicationForm from '@/components/JobApplicationForm';
import { Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Careers = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

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
    },
    {
      id: 5,
      title: 'Content Marketing Manager',
      location: 'Lagos, Nigeria (Hybrid)',
      department: 'Marketing',
      type: 'Full-time',
      description: 'Create and oversee engaging content strategies that drive brand awareness and customer engagement.'
    },
    {
      id: 6,
      title: 'Social Media Marketing Specialist',
      location: 'Lagos, Nigeria (Remote)',
      department: 'Marketing',
      type: 'Full-time',
      description: 'Manage our social media presence across multiple platforms to increase engagement and drive traffic to our website.'
    },
    {
      id: 7,
      title: 'SEO/SEM Specialist',
      location: 'Lagos, Nigeria (Hybrid)',
      department: 'Marketing',
      type: 'Full-time',
      description: 'Optimize our website and digital presence to improve search engine rankings and increase organic traffic.'
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

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {showApplicationForm ? (
            <div className="relative bg-white p-6 rounded-lg shadow-lg mb-8 animate-fade-in">
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowApplicationForm(false)}
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-tobecatGray-900">
                Apply for: {selectedJob?.title}
              </h2>
              <JobApplicationForm job={selectedJob} onClose={() => setShowApplicationForm(false)} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-tobecatGray-900">Careers at Tobecat</h1>
              <p className="text-xl text-tobecatGray-600">Join our team and grow your career with us</p>
            </div>
          )}
          
          {!showApplicationForm && (
            <>
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
              
              <h2 className="text-2xl font-bold mb-6 text-tobecatGray-900">Marketing Opportunities</h2>
              <div className="space-y-6 mb-16">
                {jobs
                  .filter(job => job.department === 'Marketing')
                  .map((job) => (
                    <div key={job.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-tobecatAccent-orange">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                        <h3 className="text-xl font-bold text-tobecatGray-900">{job.title}</h3>
                        <div className="flex flex-wrap mt-2 md:mt-0 gap-2">
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatAccent-orange/20 text-tobecatAccent-orange">
                            {job.department}
                          </span>
                          <span className="inline-block px-3 py-1 text-xs rounded-full bg-tobecatGreen-50 text-tobecatGreen-700">
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-tobecatGray-500 mb-3">{job.location}</p>
                      <p className="text-tobecatGray-700 mb-4">{job.description}</p>
                      <Button 
                        onClick={() => handleApplyClick(job)}
                        className="inline-block px-6 py-2 bg-tobecatAccent-orange hover:bg-tobecatAccent-orange/80 text-white rounded transition-colors"
                      >
                        <Briefcase className="w-4 h-4 mr-2 inline-block" /> Apply Now
                      </Button>
                    </div>
                  ))}
              </div>
              
              <h2 className="text-2xl font-bold mb-6 text-tobecatGray-900">All Open Positions</h2>
              <div className="space-y-6 mb-16">
                {jobs
                  .filter(job => job.department !== 'Marketing')
                  .map((job) => (
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
                      <Button 
                        onClick={() => handleApplyClick(job)}
                        className="inline-block px-6 py-2 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded transition-colors"
                      >
                        <Briefcase className="w-4 h-4 mr-2 inline-block" /> Apply Now
                      </Button>
                    </div>
                  ))}
              </div>
              
              <div className="bg-tobecatGray-100 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-tobecatGray-900">Don't See a Position That Fits?</h2>
                <p className="text-tobecatGray-700 mb-6">
                  We're always looking for talented individuals to join our team. Send your resume, and we'll keep it on file for future opportunities.
                </p>
                <Button 
                  onClick={() => handleApplyClick({title: 'Open Application', department: 'Any'})}
                  className="inline-block px-6 py-2 bg-tobecatBlue-600 hover:bg-tobecatBlue-700 text-white rounded transition-colors"
                >
                  Submit Open Application
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Careers;
