
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Globe, Users, Code, Palette, MessageSquare, LineChart } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MarketingCareers from '@/components/careers/MarketingCareers';

const CareersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  
  const departments = [
    { id: 'all', name: 'All Departments', icon: <Globe className="w-5 h-5" /> },
    { id: 'development', name: 'Development', icon: <Code className="w-5 h-5" /> },
    { id: 'design', name: 'Design', icon: <Palette className="w-5 h-5" /> },
    { id: 'marketing', name: 'Marketing', icon: <LineChart className="w-5 h-5" /> },
    { id: 'customer', name: 'Customer Support', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'management', name: 'Management', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="pt-16">
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-tobecatBlue-600 to-tobecatBlue-800 text-white py-20">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Be part of a team that's passionate about creating innovative digital solutions 
                that help businesses grow.
              </p>
              <Button 
                className="bg-white text-tobecatBlue-700 hover:bg-gray-100"
                size="lg"
                onClick={() => {
                  const section = document.getElementById('open-positions');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Open Positions
              </Button>
            </div>
          </section>

          {/* Why Join Us Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-3xl font-bold text-center mb-12">Why Join Tobecat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    title: "Innovation-First Culture",
                    description: "Work on cutting-edge projects using the latest technologies and methodologies.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  },
                  {
                    title: "Growth & Development",
                    description: "Continuous learning opportunities, workshops, and career advancement paths.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  },
                  {
                    title: "Collaborative Environment",
                    description: "Work alongside talented professionals in a supportive team atmosphere.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  },
                  {
                    title: "Flexible Work Options",
                    description: "Remote work possibilities and flexible hours to maintain work-life balance.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  },
                  {
                    title: "Competitive Compensation",
                    description: "Attractive salary packages with bonuses and comprehensive benefits.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  },
                  {
                    title: "Impactful Projects",
                    description: "Work on meaningful projects that make real differences for businesses and users.",
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-tobecatBlue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                ].map((benefit, idx) => (
                  <div key={idx} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Marketing Careers Section */}
          <MarketingCareers />

          {/* Open Positions Section */}
          <section id="open-positions" className="py-16 bg-gray-100">
            <div className="container mx-auto px-4 md:px-6">
              <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
              
              <div className="flex overflow-x-auto pb-4 mb-8 space-x-2">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setActiveTab(dept.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
                      activeTab === dept.id
                      ? 'bg-tobecatBlue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <span className="mr-2">{dept.icon}</span>
                    {dept.name}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Full Stack Developer",
                    department: "development",
                    location: "Lagos, Nigeria",
                    type: "Full-time",
                    description: "We are looking for a skilled Full Stack Developer who is comfortable with both front-end and back-end development to join our growing team.",
                  },
                  {
                    title: "UI/UX Designer",
                    department: "design",
                    location: "Remote",
                    type: "Full-time",
                    description: "We are seeking a creative UI/UX Designer to design and deliver user-centric design solutions for our web and mobile applications.",
                  },
                  {
                    title: "Customer Support Specialist",
                    department: "customer",
                    location: "Lagos, Nigeria",
                    type: "Full-time",
                    description: "We are looking for a Customer Support Specialist to serve as the primary point of contact for our customers.",
                  },
                  {
                    title: "Front-End Developer",
                    department: "development",
                    location: "Remote",
                    type: "Full-time",
                    description: "We are seeking a talented Front-End Developer to help us create beautiful and functional web interfaces.",
                  },
                  {
                    title: "Project Manager",
                    department: "management",
                    location: "Lagos, Nigeria",
                    type: "Full-time",
                    description: "We are looking for an experienced Project Manager to lead our development projects from inception to completion.",
                  },
                  {
                    title: "Graphic Designer",
                    department: "design",
                    location: "Lagos, Nigeria",
                    type: "Contract",
                    description: "We are seeking a creative Graphic Designer to create visual concepts for our clients' branding and marketing materials.",
                  },
                ]
                .filter(job => activeTab === 'all' || job.department === activeTab)
                .map((job, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <p className="text-gray-600">{job.location}</p>
                      </div>
                      <span className="bg-tobecatBlue-100 text-tobecatBlue-800 text-xs font-medium rounded-full px-2.5 py-1">
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    <div className="mt-auto pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "This position is coming soon. Please check back later or apply for our Marketing positions.",
                          });
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Don't see a role that matches your skills?</p>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "This feature is coming soon. Please apply to our available positions for now.",
                    });
                  }}
                  variant="outline"
                  className="border-tobecatBlue-500 text-tobecatBlue-600 hover:bg-tobecatBlue-50"
                >
                  Send Speculative Application
                </Button>
              </div>
            </div>
          </section>

          {/* Join Us CTA */}
          <section className="bg-tobecatAccent-indigo py-16">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Join Our Team?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
                Take the first step towards joining a company that values innovation, growth, and making a real impact.
              </p>
              <Button 
                size="lg"
                className="bg-white text-tobecatAccent-indigo hover:bg-gray-100"
                onClick={() => {
                  const section = document.getElementById('marketing-careers');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Explore Job Openings
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
      <ScrollToTop />
    </>
  );
};

export default CareersPage;
